"use client"

import { useState } from "react"
import { Calendar, MapPin, Users, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import rachaService, { CriarRachaData } from "@/lib/racha"
import { toast } from "sonner"

interface RachaModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess?: () => void
}

export function RachaModal({ isOpen, onClose, onSuccess }: RachaModalProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState<CriarRachaData>({
        nome: "",
        descricao: "",
        data_hora: "",
        localizacao: "",
        limite_min: 8,
        limite_max: 12,
        valor: 25
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: name.includes('limite') || name === 'valor' ? parseInt(value) || 0 : value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validações básicas
        if (!formData.nome.trim() || !formData.data_hora || !formData.localizacao.trim()) {
            toast.error("Preencha todos os campos obrigatórios")
            return
        }

        if (formData.limite_max < 2) {
            toast.error("O limite máximo deve ser pelo menos 2 jogadores")
            return
        }

        setIsLoading(true)

        try {
            await rachaService.criarRacha(formData)

            toast.success("Racha criado com sucesso!")
            onClose()
            setFormData({
                nome: "",
                descricao: "",
                data_hora: "",
                localizacao: "",
                limite_min: 8,
                limite_max: 12,
                valor: 25
            })

            if (onSuccess) {
                onSuccess()
            }
        } catch (error: unknown) {
            if (error instanceof Error) {
                toast.error(error.message)
            } else {
                toast.error("Erro ao criar racha")
            }
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] bg-background">
                <DialogHeader>
                    <DialogTitle className="text-xl">Criar Novo Racha</DialogTitle>
                    <DialogDescription>
                        Preencha os dados para criar um novo racha de futebol
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        {/* Nome do Racha */}
                        <div className="space-y-2">
                            <Label htmlFor="nome">Nome do Racha *</Label>
                            <div className="relative">
                                <Input
                                    id="nome"
                                    name="nome"
                                    value={formData.nome}
                                    onChange={handleChange}
                                    placeholder="Ex: Pelada dos Amigos"
                                    className="pl-10"
                                    required
                                    disabled={isLoading}
                                />
                                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            </div>
                        </div>

                        {/* Descrição */}
                        <div className="space-y-2">
                            <Label htmlFor="descricao">Descrição</Label>
                            <Textarea
                                id="descricao"
                                name="descricao"
                                value={formData.descricao}
                                onChange={handleChange}
                                placeholder="Descreva seu racha (opcional)"
                                rows={3}
                                disabled={isLoading}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Data e Hora */}
                            <div className="space-y-2">
                                <Label htmlFor="data_hora">Data e Hora *</Label>
                                <div className="relative">
                                    <Input
                                        id="data_hora"
                                        name="data_hora"
                                        type="datetime-local"
                                        value={formData.data_hora}
                                        onChange={handleChange}
                                        className="pl-10"
                                        required
                                        disabled={isLoading}
                                    />
                                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                </div>
                            </div>

                            {/* Valor */}
                            <div className="space-y-2">
                                <Label htmlFor="valor">Valor (R$)</Label>
                                <div className="relative">
                                    <Input
                                        id="valor"
                                        name="valor"
                                        type="number"
                                        value={formData.valor}
                                        onChange={handleChange}
                                        placeholder="0"
                                        className="pl-10"
                                        disabled={isLoading}
                                    />
                                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                </div>
                            </div>
                        </div>

                        {/* Localização */}
                        <div className="space-y-2">
                            <Label htmlFor="localizacao">Localização *</Label>
                            <div className="relative">
                                <Input
                                    id="localizacao"
                                    name="localizacao"
                                    value={formData.localizacao}
                                    onChange={handleChange}
                                    placeholder="Ex: Quadra do Parque"
                                    className="pl-10"
                                    required
                                    disabled={isLoading}
                                />
                                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Limite Mínimo */}
                            <div className="space-y-2">
                                <Label htmlFor="limite_min">Mínimo de Jogadores</Label>
                                <div className="relative">
                                    <Input
                                        id="limite_min"
                                        name="limite_min"
                                        type="number"
                                        min="2"
                                        max="20"
                                        value={formData.limite_min}
                                        onChange={handleChange}
                                        placeholder="8"
                                        className="pl-10"
                                        disabled={isLoading}
                                    />
                                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                </div>
                            </div>

                            {/* Limite Máximo */}
                            <div className="space-y-2">
                                <Label htmlFor="limite_max">Máximo de Jogadores *</Label>
                                <div className="relative">
                                    <Input
                                        id="limite_max"
                                        name="limite_max"
                                        type="number"
                                        min="2"
                                        max="20"
                                        value={formData.limite_max}
                                        onChange={handleChange}
                                        placeholder="12"
                                        className="pl-10"
                                        required
                                        disabled={isLoading}
                                    />
                                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="bg-primary hover:bg-primary/90"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Criando...
                                </>
                            ) : "Criar Racha"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}