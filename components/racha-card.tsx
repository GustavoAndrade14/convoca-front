"use client"

import { Calendar, MapPin, Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface RachaCardProps {
    id: string
    nome: string
    data: string
    local: string
    jogadores: number
    maxJogadores: number
}

export function RachaCard({ nome, data, local, jogadores, maxJogadores }: RachaCardProps) {
    return (
        <Card className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer group">
            <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                            {nome}
                        </h3>
                        <div className="mt-2 space-y-1.5">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4 shrink-0 text-primary" />
                                <span>{data}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <MapPin className="h-4 w-4 shrink-0 text-primary" />
                                <span className="truncate">{local}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-center gap-1 shrink-0">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary">
                            <Users className="h-4 w-4 text-accent" />
                            <span className="text-sm font-medium text-foreground">
                                {jogadores}/{maxJogadores}
                            </span>
                        </div>
                        <span className="text-xs text-muted-foreground">jogadores</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
