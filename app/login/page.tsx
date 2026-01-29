"use client"

import { useState } from "react"
import { Eye, EyeOff, User, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import authService, { LoginData } from "@/lib/auth"
import { toast } from "sonner"

export default function Login() {
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState<LoginData>({
        username: "",
        password: ""
    })
    const router = useRouter()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.username || !formData.password) {
            toast.error("Por favor, preencha todos os campos")
            return
        }

        setLoading(true)

        try {
            const response = await authService.login(formData)

            if (response.success) {
                toast.success("Login realizado com sucesso!")

                setTimeout(() => {
                    router.push("/")
                }, 1000)
            }
        } catch (error: unknown) {
            if (error instanceof Error) {
                toast.error(error.message || "Erro ao fazer login")
            } else {
                toast.error("Erro desconhecido ao fazer login")
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="flex flex-col items-center mb-8">
                    <div className="relative h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4 shadow-lg">
                        <Image src="/logo.png" alt="Logo" width={64} height={64} />
                    </div>
                    <h1 className="text-3xl font-bold text-foreground">CONVOCA</h1>
                    <p className="text-sm text-muted-foreground">Organizador de Racha</p>
                </div>

                <Card className="border-border shadow-xl">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold">Bem-vindo de volta</CardTitle>
                        <CardDescription>
                            Entre com suas credenciais para acessar sua conta
                        </CardDescription>
                    </CardHeader>

                    <form onSubmit={handleLogin}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="username">Usuário</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="username"
                                        name="username"
                                        type="text"
                                        placeholder="usuario"
                                        className="pl-10"
                                        required
                                        value={formData.username}
                                        onChange={handleChange}
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Senha</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••••••••••"
                                        className="pl-10 pr-10"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        disabled={loading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform hover:text-primary -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                        disabled={loading}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Entrando...
                                    </>
                                ) : "Entrar"}
                            </Button>

                        </CardContent>

                        <CardFooter className="flex flex-col space-y-4 mt-6">
                            <div className="text-sm text-center text-muted-foreground">
                                Não tem uma conta?{" "}
                                <Link href="/register" className="text-primary hover:underline font-medium">
                                    Cadastre-se
                                </Link>
                            </div>
                        </CardFooter>
                    </form>
                </Card>

                <div className="mt-8 text-center text-xs text-muted-foreground">
                    <p>© 2026 CONVOCA. Todos os direitos reservados.</p>
                </div>
            </div>
        </div>
    )
}