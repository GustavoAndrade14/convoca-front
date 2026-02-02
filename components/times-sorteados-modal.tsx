import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Users, Trophy, Copy, Share2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

interface JogadorTime {
    id: string
    nome: string
    user_id: string
}

interface TimesSorteadosModalProps {
    isOpen: boolean
    onClose: () => void
    times: {
        time1: JogadorTime[]
        time2: JogadorTime[]
    }
    rachaNome: string
}

export function TimesSorteadosModal({
    isOpen,
    onClose,
    times,
    rachaNome
}: TimesSorteadosModalProps) {
    const totalJogadores = times.time1.length + times.time2.length

    const copiarTimesParaClipboard = () => {
        const texto = `🏆 TIMES SORTEADOS - ${rachaNome} 🏆\n\n` +
            `TIME 1 (${times.time1.length} jogadores):\n` +
            times.time1.map(j => `• ${j.nome}`).join('\n') +
            `\n\nTIME 2 (${times.time2.length} jogadores):\n` +
            times.time2.map(j => `• ${j.nome}`).join('\n') +
            `\n\nDivirtam-se! ⚽`

        navigator.clipboard.writeText(texto)
            .then(() => {
                toast.success("Times copiados para a área de transferência!")
            })
            .catch(() => {
                toast.error("Erro ao copiar times")
            })
    }

    const compartilharTimes = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Times Sorteados - ${rachaNome}`,
                    text: `TIME 1: ${times.time1.map(j => j.nome).join(', ')}\n` +
                        `TIME 2: ${times.time2.map(j => j.nome).join(', ')}`,
                })
            } catch (error) {
                console.log('Compartilhamento cancelado')
            }
        } else {
            copiarTimesParaClipboard()
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-yellow-500" />
                        Times Sorteados
                    </DialogTitle>
                    <DialogDescription>
                        Os times foram sorteados aleatoriamente para o racha <span className="font-semibold">{rachaNome}</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Resumo */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-bold text-blue-700 dark:text-blue-300">Time 1</span>
                                <Badge variant="outline" className="border-blue-500 text-blue-500">
                                    {times.time1.length} jogadores
                                </Badge>
                            </div>
                            <div className="space-y-2">
                                {times.time1.map((jogador, index) => (
                                    <div
                                        key={jogador.id}
                                        className="flex items-center gap-2 p-2 rounded-md bg-white dark:bg-gray-800"
                                    >
                                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-bold">
                                            {index + 1}
                                        </div>
                                        <span className="font-medium text-blue-900 dark:text-blue-100">{jogador.nome}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-bold text-red-700 dark:text-red-300">Time 2</span>
                                <Badge variant="outline" className="border-red-500 text-red-500">
                                    {times.time2.length} jogadores
                                </Badge>
                            </div>
                            <div className="space-y-2">
                                {times.time2.map((jogador, index) => (
                                    <div
                                        key={jogador.id}
                                        className="flex items-center gap-2 p-2 rounded-md bg-white dark:bg-gray-800"
                                    >
                                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 text-xs font-bold">
                                            {index + 1}
                                        </div>
                                        <span className="font-medium text-red-900 dark:text-red-100">{jogador.nome}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <p className="text-2xl font-bold text-primary">{totalJogadores}</p>
                            <p className="text-sm text-muted-foreground">Total de jogadores</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-blue-500">{times.time1.length}</p>
                            <p className="text-sm text-muted-foreground">Time Azul</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-red-500">{times.time2.length}</p>
                            <p className="text-sm text-muted-foreground">Time Vermelho</p>
                        </div>
                    </div>

                    <Separator />

                    {/* Observações */}
                    <div className="text-sm text-muted-foreground italic border-l-4 border-yellow-400 pl-3 py-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                        <p>⚽ Os times foram sorteados aleatoriamente para garantir a diversão de todos!</p>
                        <p className="mt-1">🎯 Se necessário, o organizador pode sortear novamente.</p>
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button onClick={onClose}>
                        Fechar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}