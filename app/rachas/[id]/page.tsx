// app/rachas/[id]/page.tsx (partes atualizadas)
"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Calendar, MapPin, Users, DollarSign, Edit, Trash2, CheckCircle, X, User, Check, XCircle, Shuffle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import rachaService, { Racha as RachaType } from "@/lib/racha"
import authService from "@/lib/auth"
import { RachaModal } from "@/components/racha-modal"
import { TimesSorteadosModal } from "@/components/times-sorteados-modal" // Importe o novo modal

interface Participante {
    id: string
    user_id: string
    tipo: 'titular' | 'suplente'
    pagou: boolean
    ordem?: number
    created_at: string
    usuario?: {
        id: string
        username: string
        email: string
        profile_picture_url?: string
    }
}

interface JogadorTime {
    id: string
    nome: string
    user_id: string
}

export default function RachaDetalhesPage() {
    const params = useParams()
    const router = useRouter()
    const rachaId = params.id as string

    const [racha, setRacha] = useState<RachaType | null>(null)
    const [participantes, setParticipantes] = useState<Participante[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isLoadingActions, setIsLoadingActions] = useState<string | null>(null)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isTimesModalOpen, setIsTimesModalOpen] = useState(false) // Novo state para o modal de times
    const [timesSorteados, setTimesSorteados] = useState<{
        time1: JogadorTime[]
        time2: JogadorTime[]
    }>({ time1: [], time2: [] }) // State para armazenar os times
    const [user, setUser] = useState(authService.getUser())
    const [isOwner, setIsOwner] = useState(false)

    // Carregar dados do racha
    const loadRachaData = async () => {
        try {
            setIsLoading(true)
            const [rachaData, participantesData] = await Promise.all([
                rachaService.buscarRachaPorId(rachaId),
                fetchParticipantes()
            ])

            setRacha(rachaData.racha)
            setParticipantes(participantesData)

            // Verificar se o usuário é o dono
            const currentUser = authService.getUser()
            setUser(currentUser)
            setIsOwner(rachaData.racha.criado_por === currentUser?.id)
        } catch (error: unknown) {
            toast.error("Erro ao carregar dados do racha")
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    // Buscar participantes
    const fetchParticipantes = async (): Promise<Participante[]> => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rachas/${rachaId}/participantes`)
            if (!response.ok) return []

            const data = await response.json()
            return data.participantes || []
        } catch (error) {
            console.error("Erro ao buscar participantes:", error)
            return []
        }
    }

    useEffect(() => {
        loadRachaData()
    }, [rachaId])

    // Formatar data
    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return {
            date: date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }),
            time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        }
    }

    // Função para sortear times
    const handleSortearTimes = async () => {
        if (!isOwner) return

        setIsLoadingActions('sortear')
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rachas/${rachaId}/times`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authService.getToken()}`,
                    'Content-Type': 'application/json',
                },
            })

            if (!response.ok) {
                const errorText = await response.text()
                throw new Error(errorText || 'Erro ao sortear times')
            }

            const data = await response.json()
            toast.success(data.mensagem || "Times sorteados com sucesso!")

            // Armazenar os times e abrir o modal
            if (data.times) {
                setTimesSorteados(data.times)
                setIsTimesModalOpen(true) // Abre o modal
            }
        } catch (error: unknown) {
            console.error('Erro ao sortear times:', error)
            if (error instanceof Error) {
                toast.error(error.message || "Erro ao sortear times")
            }
        } finally {
            setIsLoadingActions(null)
        }
    }

    // Outras funções permanecem as mesmas...
    const handleExcluir = async () => {
        if (!confirm("Tem certeza que deseja excluir este racha?")) return

        setIsLoadingActions('excluir')
        try {
            await rachaService.deletarRacha(rachaId)
            toast.success("Racha excluído com sucesso!")
            router.push('/')
        } catch (error: unknown) {
            if (error instanceof Error) {
                toast.error(error.message || "Erro ao excluir racha")
            }
        } finally {
            setIsLoadingActions(null)
        }
    }

    const handleEncerrar = async () => {
        if (!confirm("Tem certeza que deseja encerrar este racha?")) return

        setIsLoadingActions('encerrar')
        try {
            await rachaService.encerrarRacha(rachaId)
            toast.success("Racha encerrado com sucesso!")
            loadRachaData()
        } catch (error: unknown) {
            if (error instanceof Error) {
                toast.error(error.message || "Erro ao encerrar racha")
            }
        } finally {
            setIsLoadingActions(null)
        }
    }

    const handleSair = async () => {
        if (!confirm("Tem certeza que deseja sair deste racha?")) return

        setIsLoadingActions('sair')
        try {
            const participanteAtual = participantes.find(p => p.usuario?.id === user?.id)

            if (!participanteAtual) {
                toast.error("Você não está participando deste racha")
                return
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rachas/${rachaId}/participantes/${participanteAtual.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authService.getToken()}`,
                }
            })

            if (!response.ok) {
                throw new Error('Erro ao sair do racha')
            }

            toast.success("Você saiu do racha com sucesso!")
            router.push('/')
        } catch (error: unknown) {
            if (error instanceof Error) {
                toast.error(error.message || "Erro ao sair do racha")
            }
        } finally {
            setIsLoadingActions(null)
        }
    }

    const handleTogglePagamento = async (participanteId: string, pagouAtual: boolean) => {
        if (!isOwner) return

        setIsLoadingActions(`pagamento-${participanteId}`)
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rachas/${rachaId}/pagamento`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${authService.getToken()}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    participante_id: participanteId,
                    pagou: !pagouAtual
                })
            })

            if (!response.ok) {
                throw new Error('Erro ao atualizar pagamento')
            }

            toast.success("Status de pagamento atualizado!")
            loadRachaData()
        } catch (error: unknown) {
            if (error instanceof Error) {
                toast.error(error.message || "Erro ao atualizar pagamento")
            }
        } finally {
            setIsLoadingActions(null)
        }
    }

    const handleParticipar = async () => {
        setIsLoadingActions('participar')
        try {
            const resultado = await rachaService.participarRacha(rachaId)
            toast.success(resultado.mensagem || "Participação confirmada!")
            loadRachaData()
        } catch (error: unknown) {
            if (error instanceof Error) {
                toast.error(error.message || "Erro ao participar do racha")
            }
        } finally {
            setIsLoadingActions(null)
        }
    }

    // Verificar se usuário já está participando
    const isParticipating = participantes.some(p => p.usuario?.id === user?.id)

    // Separar titulares e suplentes
    const titulares = participantes.filter(p => p.tipo === 'titular')
    const suplentes = participantes.filter(p => p.tipo === 'suplente').sort((a, b) => (a.ordem || 0) - (b.ordem || 0))

    // Verificar se está lotado
    const isLotado = titulares.length >= (racha?.limite_max || 0)

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Carregando...</p>
                </div>
            </div>
        )
    }

    if (!racha) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-foreground mb-2">Racha não encontrado</h2>
                    <Button onClick={() => router.push('/')}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar para a página inicial
                    </Button>
                </div>
            </div>
        )
    }

    const { date, time } = formatDate(racha.data_hora)
    const porcentagem = racha.limite_max > 0 ? (titulares.length / racha.limite_max) * 100 : 0

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <Button
                            variant="ghost"
                            onClick={() => router.push('/')}
                            className="gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Voltar
                        </Button>

                        <div className="flex items-center gap-4">
                            {isOwner && (
                                <>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setIsEditModalOpen(true)}
                                        disabled={isLoadingActions !== null}
                                    >
                                        <Edit className="mr-2 h-4 w-4" />
                                        Editar
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleEncerrar}
                                        disabled={isLoadingActions !== null}
                                    >
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        {isLoadingActions === 'encerrar' ? 'Encerrando...' : 'Encerrar'}
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={handleExcluir}
                                        disabled={isLoadingActions !== null}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        {isLoadingActions === 'excluir' ? 'Excluindo...' : 'Excluir'}
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Informações do Racha */}
                <Card className="mb-8">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-2xl font-bold">{racha.nome}</CardTitle>
                                <div className="flex items-center gap-2 mt-2">
                                    <Badge className={
                                        racha.status === 'ativo' ? 'bg-green-500' :
                                            racha.status === 'encerrado' ? 'bg-gray-500' :
                                                racha.status === 'lotado' ? 'bg-red-500' : 'bg-blue-500'
                                    }>
                                        {racha.status === 'ativo' ? 'Ativo' :
                                            racha.status === 'encerrado' ? 'Encerrado' :
                                                racha.status === 'lotado' ? 'Lotado' : 'Disponível'}
                                    </Badge>
                                    {racha.criado_por === user?.id && (
                                        <Badge variant="outline" className="border-primary text-primary">
                                            Você é o organizador
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <div className="space-y-6">
                            {/* Descrição */}
                            {racha.descricao && (
                                <div>
                                    <h3 className="font-semibold mb-2">Descrição</h3>
                                    <p className="text-muted-foreground">{racha.descricao}</p>
                                </div>
                            )}

                            <Separator />

                            {/* Informações */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Calendar className="h-5 w-5 text-primary" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Data e Hora</p>
                                            <p className="font-medium">{date} às {time}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <MapPin className="h-5 w-5 text-primary" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Localização</p>
                                            <p className="font-medium">{racha.localizacao}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <DollarSign className="h-5 w-5 text-primary" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Valor por jogador</p>
                                            <p className="text-xl font-bold text-accent">
                                                R$ {racha.valor?.toFixed(2) || "0,00"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Users className="h-5 w-5 text-primary" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Limite de jogadores</p>
                                            <p className="font-medium">
                                                {titulares.length}/{racha.limite_max} ({racha.limite_min || 0} mínimo)
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Vagas preenchidas</span>
                                    <span className="font-medium">{titulares.length}/{racha.limite_max}</span>
                                </div>
                                <Progress value={porcentagem} className="h-2" />
                            </div>

                            {/* Botões de Ação */}
                            <div className="flex gap-3 pt-4">
                                {!isOwner && (
                                    <>
                                        {isParticipating ? (
                                            <Button
                                                variant="destructive"
                                                onClick={handleSair}
                                                disabled={isLoadingActions !== null}
                                                className="flex-1"
                                            >
                                                <X className="mr-2 h-4 w-4" />
                                                {isLoadingActions === 'sair' ? 'Saindo...' : 'Sair do Racha'}
                                            </Button>
                                        ) : (
                                            <Button
                                                onClick={handleParticipar}
                                                disabled={isLotado || isLoadingActions !== null}
                                                className="flex-1 bg-primary hover:bg-primary/90"
                                            >
                                                {isLoadingActions === 'participar' ? (
                                                    <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                                                ) : null}
                                                {isLotado ? 'Lotado' : 'Participar do Racha'}
                                            </Button>
                                        )}
                                    </>
                                )}

                                {isOwner && titulares.length >= 2 && (
                                    <Button
                                        onClick={handleSortearTimes}
                                        disabled={isLoadingActions !== null}
                                        className="flex-1"
                                    >
                                        <Shuffle className="mr-2 h-4 w-4" />
                                        {isLoadingActions === 'sortear' ? 'Sorteando...' : 'Sortear Times'}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Lista de Participantes */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Titulares */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Titulares ({titulares.length}/{racha.limite_max})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {titulares.length === 0 ? (
                                    <p className="text-muted-foreground text-center py-4">Nenhum titular ainda</p>
                                ) : (
                                    titulares.map((participante) => (
                                        <div
                                            key={participante.id}
                                            className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src={participante.usuario?.profile_picture_url} />
                                                    <AvatarFallback>
                                                        {participante.usuario?.username?.charAt(0).toUpperCase() || 'U'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{participante.usuario?.username || 'Usuário'}</p>
                                                    <p className="text-xs text-muted-foreground">{participante.usuario?.email}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {isOwner && racha.valor && racha.valor > 0 && (
                                                    <Button
                                                        size="sm"
                                                        variant={participante.pagou ? "default" : "outline"}
                                                        onClick={() => handleTogglePagamento(participante.id, participante.pagou)}
                                                        disabled={isLoadingActions !== null}
                                                    >
                                                        {isLoadingActions === `pagamento-${participante.id}` ? (
                                                            <div className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full" />
                                                        ) : participante.pagou ? (
                                                            <Check className="h-3 w-3 mr-1" />
                                                        ) : (
                                                            <XCircle className="h-3 w-3 mr-1" />
                                                        )}
                                                        {participante.pagou ? 'Pago' : 'Não Pago'}
                                                    </Button>
                                                )}

                                                {participante.usuario?.id === user?.id && (
                                                    <Badge variant="outline" className="border-primary text-primary">
                                                        Você
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Suplentes */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Reservas ({suplentes.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {suplentes.length === 0 ? (
                                    <p className="text-muted-foreground text-center py-4">Nenhum reserva ainda</p>
                                ) : (
                                    suplentes.map((participante, index) => (
                                        <div
                                            key={participante.id}
                                            className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary">
                                                    <span className="text-sm font-bold">{index + 1}</span>
                                                </div>
                                                <div>
                                                    <p className="font-medium">{participante.usuario?.username || 'Usuário'}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Posição {participante.ordem || index + 1} na fila
                                                    </p>
                                                </div>
                                            </div>

                                            <div>
                                                {participante.usuario?.id === user?.id && (
                                                    <Badge variant="outline" className="border-primary text-primary">
                                                        Você
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Modal de Edição */}
            {isOwner && racha && (
                <RachaModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onSuccess={() => {
                        setIsEditModalOpen(false)
                        loadRachaData()
                        toast.success("Racha atualizado com sucesso!")
                    }}
                    initialData={racha}
                    isEditing={true}
                />
            )}

            {/* Modal de Times Sorteados */}
            {timesSorteados.time1.length > 0 && (
                <TimesSorteadosModal
                    isOpen={isTimesModalOpen}
                    onClose={() => setIsTimesModalOpen(false)}
                    times={timesSorteados}
                    rachaNome={racha.nome}
                />
            )}
        </div>
    )
}