"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
    Avatar,
    AvatarFallback,
    AvatarImage
} from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import {
    LogOut,
    User,
    Settings,
    Bell
} from "lucide-react"
import authService from "@/lib/auth"
import { toast } from "sonner"

interface UserAvatarProps {
    user: {
        username: string
        email: string
        profile_picture_url?: string
    } | null
}

export function UserAvatar({ user }: UserAvatarProps) {
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)

    const handleLogout = () => {
        try {
            authService.logout()
            toast.success("Logout realizado com sucesso!")
            router.push("/")
            setIsOpen(false)
        } catch (error) {
            toast.error("Erro ao fazer logout")
        }
    }

    const handleProfile = () => {
        router.push("/profile")
        setIsOpen(false)
    }

    if (!user) {
        return (
            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push("/login")}
                    className="text-foreground hover:text-primary"
                >
                    Entrar
                </Button>
                <Button
                    onClick={() => router.push("/register")}
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                    Cadastrar
                </Button>
            </div>
        )
    }

    // Gerar iniciais para o avatar fallback
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    return (
        <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
                    3
                </span>
            </Button>

            <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                        <Avatar className="h-10 w-10 border-2 border-border hover:border-primary transition-colors">
                            <AvatarImage
                                src={user.profile_picture_url || ""}
                                alt={user.username}
                            />
                            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-foreground">
                                {getInitials(user.username)}
                            </AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    className="w-56 bg-card border-border"
                    align="end"
                    sideOffset={5}
                >
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none text-foreground">
                                {user.username}
                            </p>
                            <p className="text-xs leading-none text-muted-foreground truncate">
                                {user.email}
                            </p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-border" />

                    <DropdownMenuItem
                        onClick={handleProfile}
                        className="cursor-pointer hover:bg-accent/50 focus:bg-accent/50"
                    >
                        <User className="mr-2 h-4 w-4 hover:text-black" />
                        <span>Meu Perfil</span>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="bg-border" />

                    <DropdownMenuItem
                        onClick={handleLogout}
                        className="cursor-pointer hover:bg-destructive/20 focus:bg-destructive/20 text-destructive focus:text-destructive"
                    >
                        <LogOut className="mr-2 h-4 w-4 hover:text-destructive/80" />
                        <span>Sair</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}