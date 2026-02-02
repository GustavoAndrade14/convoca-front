"use client"

import { useState, useEffect } from "react"
import { Calendar, MapPin, Users, MoreVertical, Edit, Trash2, Eye, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { RachaModal } from "@/components/racha-modal"
import rachaService from "@/lib/racha"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface Racha {
    id: string;
    nome: string;
    descricao?: string;
    data_hora: string;
    localizacao: string;
    limite_min?: number;
    limite_max: number;
    valor?: number;
    status?: string;
    total_participantes?: number;
    total_confirmados?: number;
}

interface RachaListProps {
    rachas: Racha[]
    showActions?: boolean
    onRefresh?: () => void
}

export function RachaList({ rachas, showActions = false, onRefresh }: RachaListProps) {
    const router = useRouter()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedRacha, setSelectedRacha] = useState<Racha | null>(null)
    const [isLoading, setIsLoading] = useState<string | null>(null)
    const [participacoes, setParticipacoes] = useState<Record<string, boolean>>({})

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return {
            date: date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' }),
            time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        }
    }

    // Verificar participações ao carregar
    useEffect(() => {
        const verificarParticipacoes = async () => {
            const novasParticipacoes: Record<string, boolean> = {}

            for (const racha of rachas) {
                try {
                    const { participando } = await rachaService.verificarParticipacao(racha.id)
                    novasParticipacoes[racha.id] = participando
                } catch (error) {
                    console.error(`Erro ao verificar participação no racha ${racha.id}:`, error)
                    novasParticipacoes[racha.id] = false
                }
            }

            setParticipacoes(novasParticipacoes)
        }

        if (rachas.length > 0) {
            verificarParticipacoes()
        }
    }, [rachas])

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir este racha?")) {
            return
        }

        setIsLoading(id)
        try {
            await rachaService.deletarRacha(id)
            toast.success("Racha excluído com sucesso!")
            if (onRefresh) onRefresh()
        } catch (error: unknown) {
            if (error instanceof Error) {
                toast.error(error.message || "Erro ao excluir racha")
            } else {
                toast.error("Erro ao excluir racha")
            }
        } finally {
            setIsLoading(null)
        }
    }

    const handleEncerrar = async (id: string) => {
        if (!confirm("Tem certeza que deseja encerrar este racha?")) {
            return
        }

        setIsLoading(id)
        try {
            await rachaService.encerrarRacha(id)
            toast.success("Racha encerrado com sucesso!")
            if (onRefresh) onRefresh()
        } catch (error: unknown) {
            if (error instanceof Error) {
                toast.error(error.message || "Erro ao encerrar racha")
            } else {
                toast.error("Erro ao encerrar racha")
            }
        } finally {
            setIsLoading(null)
        }
    }

    const handleParticipar = async (id: string) => {
        setIsLoading(id);
        try {
            const resultado = await rachaService.participarRacha(id);

            // Atualizar o estado de participação localmente
            setParticipacoes(prev => ({
                ...prev,
                [id]: true
            }));

            // Definir interface para a resposta
            interface ParticipacaoResponse {
                mensagem: string;
                participante?: {
                    tipo: string;
                    ordem?: number;
                };
            }

            const response = resultado as ParticipacaoResponse;
            const mensagem = response.mensagem || "Participação confirmada!";

            if (response.participante) {
                if (response.participante.tipo === 'suplente') {
                    toast.success(`${mensagem} Você está na posição ${response.participante.ordem} da fila de suplentes.`);
                } else {
                    toast.success(mensagem);
                }
            } else {
                toast.success(mensagem);
            }

            if (onRefresh) onRefresh();
        } catch (error: unknown) {
            if (error instanceof Error) {
                toast.error(error.message || "Erro ao participar do racha");
            } else {
                toast.error("Erro ao participar do racha");
            }
        } finally {
            setIsLoading(null);
        }
    };

    const handleViewDetails = (id: string) => {
        router.push(`/rachas/${id}`)
    }

    const handleEdit = (racha: Racha) => {
        setSelectedRacha(racha)
        setIsModalOpen(true)
    }

    const getStatusBadge = (status?: string) => {
        switch (status) {
            case 'ativo':
                return <Badge className="bg-green-500">Ativo</Badge>
            case 'encerrado':
                return <Badge variant="outline" className="border-gray-400 text-gray-400">Encerrado</Badge>
            case 'lotado':
                return <Badge variant="destructive">Lotado</Badge>
            default:
                return <Badge>Disponível</Badge>
        }
    }

    const getProgressColor = (porcentagem: number) => {
        if (porcentagem >= 100) {
            return "bg-destructive"
        } else if (porcentagem >= 80) {
            return "bg-orange-500"
        } else {
            return "bg-green-500"
        }
    }

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {rachas.map((racha) => {
                    const { date, time } = formatDate(racha.data_hora)
                    const participantes = racha.total_confirmados || 0
                    const porcentagem = (participantes / racha.limite_max) * 100
                    const isLotado = participantes >= racha.limite_max
                    const progressColor = getProgressColor(porcentagem)
                    const jaParticipa = participacoes[racha.id] || false

                    return (
                        <Card
                            key={racha.id}
                            className="bg-card border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg group overflow-hidden"
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <CardTitle className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                                                {racha.nome}
                                            </CardTitle>
                                            {getStatusBadge(racha.status)}
                                            {showActions && (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="ml-auto h-8 w-8 p-0"
                                                        >
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleViewDetails(racha.id)}>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            Ver Detalhes
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleEdit(racha)}>
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Editar
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleEncerrar(racha.id)}>
                                                            <CheckCircle className="mr-2 h-4 w-4" />
                                                            Encerrar
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleDelete(racha.id)}
                                                            className="text-destructive focus:text-destructive"
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Excluir
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {racha.descricao || "Sem descrição"}
                                        </p>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="pb-3">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="flex items-center gap-1.5 text-muted-foreground">
                                            <Calendar className="h-4 w-4" />
                                            <span className="font-medium">{date}</span>
                                            <span className="text-foreground font-bold">• {time}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <MapPin className="h-4 w-4" />
                                        <div>
                                            <p className="text-xs truncate">{racha.localizacao}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="text-right">
                                            <p className="text-xs text-muted-foreground">Valor por jogador</p>
                                            <p className="text-xl font-bold text-accent">
                                                R$ {racha.valor?.toFixed(2) || "0,00"}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Vagas preenchidas</span>
                                            <span className="font-medium text-foreground">
                                                {participantes}/{racha.limite_max}
                                            </span>
                                        </div>
                                        <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                                            <div
                                                className={`h-full ${progressColor} transition-all duration-300`}
                                                style={{ width: `${Math.min(porcentagem, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>

                            <CardFooter className="pt-3 border-t border-border">
                                <div className="flex w-full gap-3">
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => handleViewDetails(racha.id)}
                                    >
                                        Detalhes
                                    </Button>
                                    <Button
                                        className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                                        disabled={isLotado || isLoading === racha.id || jaParticipa}
                                        onClick={() => handleParticipar(racha.id)}
                                    >
                                        {isLoading === racha.id ? (
                                            <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        ) : null}
                                        {jaParticipa ? "Já Participando" : isLotado ? "Lotado" : "Participar"}
                                    </Button>
                                </div>
                            </CardFooter>
                        </Card>
                    )
                })}
            </div>

            {/* Modal de edição */}
            {selectedRacha && (
                <div className="hidden">
                    {/* Você precisaria criar um modal de edição similar ao de criação */}
                    {/* Implementação similar ao RachaModal mas para edição */}
                </div>
            )}
        </>
    )
}