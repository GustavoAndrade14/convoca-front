"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    User,
    Mail,
    Phone,
    Calendar,
    Edit,
    Save,
    X,
    Camera,
    Lock,
    Key,
    ArrowLeft,
    Trash2,
    Upload,
    AlertCircle
} from "lucide-react"
import authService from "@/lib/auth"
import { toast } from "sonner"

export default function ProfilePage() {
    const router = useRouter()
    const [user, setUser] = useState(authService.getUser())
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        phone: ""
    })
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    })
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [activeTab, setActiveTab] = useState("informacoes")
    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        const timer = setTimeout(() => {
            const token = authService.getToken()
            if (!token) {
                router.push("/login")
                return
            }

            const currentUser = authService.getUser()
            setUser(currentUser)

            if (currentUser) {
                setFormData({
                    username: currentUser.username,
                    email: currentUser.email,
                    phone: currentUser.phone || ""
                })
            }
            setIsLoading(false)
        }, 0)

        return () => clearTimeout(timer)
    }, [router])

    const handleSaveProfile = async () => {
        if (!formData.username.trim() || !formData.email.trim()) {
            toast.error("Username e email são obrigatórios")
            return
        }

        // Validação de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData.email)) {
            toast.error("Por favor, insira um email válido")
            return
        }

        setIsSaving(true)

        try {
            const result = await authService.updateProfile(formData)

            // Atualizar usuário no estado local
            setUser(result.user)

            toast.success("Perfil atualizado com sucesso!")
            setIsEditing(false)
        } catch (error: unknown) {
            if (error instanceof Error) {
                toast.error(error.message || "Erro ao atualizar perfil")
            } else {
                toast.error("Erro desconhecido ao atualizar perfil")
            }
        } finally {
            setIsSaving(false)
        }
    }

    const handleSavePassword = async () => {
        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            toast.error("Preencha todos os campos de senha")
            return
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error("As novas senhas não coincidem")
            return
        }

        if (passwordData.newPassword.length < 6) {
            toast.error("A nova senha deve ter pelo menos 6 caracteres")
            return
        }

        setIsSaving(true)

        try {
            await authService.changePassword(passwordData)

            toast.success("Senha alterada com sucesso!")
            setPasswordData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            })
        } catch (error: unknown) {
            if (error instanceof Error) {
                toast.error(error.message || "Erro ao alterar senha")
            } else {
                toast.error("Erro desconhecido ao alterar senha")
            }
        } finally {
            setIsSaving(false)
        }
    }

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        // Validações básicas
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        if (!validTypes.includes(file.type)) {
            toast.error("Por favor, selecione uma imagem (JPEG, PNG, GIF ou WebP)")
            return
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB
            toast.error("A imagem deve ter no máximo 5MB")
            return
        }

        setIsUploading(true)

        try {
            const result = await authService.uploadProfilePicture(file)

            toast.success(result.message)

            // Atualizar usuário localmente
            if (result.profile_picture_url && user) {
                const updatedUser = {
                    ...user,
                    profile_picture_url: result.profile_picture_url
                }
                setUser(updatedUser)
            }

        } catch (error: unknown) {
            if (error instanceof Error) {
                toast.error(error.message || "Erro ao fazer upload da foto")
            } else {
                toast.error("Erro desconhecido ao fazer upload da foto")
            }
        } finally {
            setIsUploading(false)
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    const handleDeleteProfilePicture = async () => {
        if (!user?.profile_picture_url) {
            toast.info("Você não tem foto de perfil para remover")
            return
        }

        if (!confirm("Tem certeza que deseja remover sua foto de perfil?")) {
            return
        }

        setIsUploading(true)

        try {
            const result = await authService.deleteProfilePicture()

            toast.success(result.message)

            // Atualizar usuário localmente
            if (user) {
                const updatedUser = { ...user, profile_picture_url: undefined }
                setUser(updatedUser)
            }

        } catch (error: unknown) {
            if (error instanceof Error) {
                toast.error(error.message || "Erro ao remover foto")
            } else {
                toast.error("Erro desconhecido ao remover foto")
            }
        } finally {
            setIsUploading(false)
        }
    }

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    const triggerFileInput = () => {
        fileInputRef.current?.click()
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Carregando perfil...</p>
                </div>
            </div>
        )
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <p className="text-muted-foreground mb-4">Usuário não encontrado</p>
                    <Button onClick={() => router.push("/login")}>
                        Fazer Login
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <header className="border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => router.push("/")}
                                className="mr-2 hover:bg-accent"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <div className="relative h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                                <Image src="/logo.png" alt="Logo" width={80} height={80} />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-foreground">CONVOCA</h1>
                                <p className="text-xs text-muted-foreground">Organizador de Racha</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground mb-2">Meu Perfil</h1>
                    <p className="text-muted-foreground">
                        Gerencie suas informações pessoais
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Coluna da esquerda - Avatar e informações básicas */}
                    <div className="lg:col-span-1">
                        <Card className="border-border">
                            <CardContent className="pt-6">
                                <div className="flex flex-col items-center text-center">
                                    <div className="relative group">
                                        <Avatar className="h-32 w-32 border-4 border-background shadow-lg mb-4">
                                            <AvatarImage
                                                src={user.profile_picture_url || ""}
                                                alt={user.username}
                                            />
                                            <AvatarFallback className="text-3xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
                                                {getInitials(user.username)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <Button
                                            onClick={triggerFileInput}
                                            size="icon"
                                            className="absolute bottom-2 right-2 h-10 w-10 rounded-full bg-primary/90 hover:bg-primary text-primary-foreground shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                            disabled={isSaving}
                                        >
                                            <Camera className="h-5 w-5" />
                                        </Button>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleImageUpload}
                                            accept="image/*"
                                            className="hidden"
                                        />
                                    </div>

                                    <h2 className="text-xl font-bold text-foreground mb-1">
                                        {user.username}
                                    </h2>
                                    <p className="text-muted-foreground mb-4">{user.email}</p>

                                    <div className="w-full space-y-3">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Membro desde</span>
                                            <span className="font-medium text-foreground">
                                                {new Date(user.created_at).toLocaleDateString('pt-BR')}
                                            </span>
                                        </div>

                                        <Button
                                            className="w-full"
                                            onClick={() => setIsEditing(!isEditing)}
                                            disabled={isSaving}
                                        >
                                            {isEditing ? (
                                                <>
                                                    <X className="mr-2 h-4 w-4" />
                                                    Cancelar
                                                </>
                                            ) : (
                                                <>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Editar Perfil
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Coluna da direita - Informações detalhadas */}
                    <div className="lg:col-span-2">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full max-w-md grid-cols-2">
                                <TabsTrigger value="informacoes">Informações</TabsTrigger>
                                <TabsTrigger value="seguranca">Segurança</TabsTrigger>
                            </TabsList>

                            <TabsContent value="informacoes" className="mt-6">
                                <Card className="border-border">
                                    <CardHeader>
                                        <CardTitle className="text-lg">Informações Pessoais</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="username">
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4" />
                                                    <span>Usuário</span>
                                                </div>
                                            </Label>
                                            {isEditing ? (
                                                <Input
                                                    id="username"
                                                    value={formData.username}
                                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                                    disabled={isSaving}
                                                />
                                            ) : (
                                                <div className="text-foreground font-medium p-2 bg-accent/10 rounded">
                                                    {user.username}
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email">
                                                <div className="flex items-center gap-2">
                                                    <Mail className="h-4 w-4" />
                                                    <span>E-mail</span>
                                                </div>
                                            </Label>
                                            {isEditing ? (
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    disabled={isSaving}
                                                />
                                            ) : (
                                                <div className="text-foreground font-medium p-2 bg-accent/10 rounded">
                                                    {user.email}
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="phone">
                                                <div className="flex items-center gap-2">
                                                    <Phone className="h-4 w-4" />
                                                    <span>Telefone</span>
                                                </div>
                                            </Label>
                                            {isEditing ? (
                                                <Input
                                                    id="phone"
                                                    type="tel"
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                    placeholder="(00) 00000-0000"
                                                    disabled={isSaving}
                                                />
                                            ) : (
                                                <div className="text-foreground font-medium p-2 bg-accent/10 rounded">
                                                    {user.phone || "Não informado"}
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4" />
                                                    <span>Data de Criação</span>
                                                </div>
                                            </Label>
                                            <div className="text-foreground font-medium p-2 bg-accent/10 rounded">
                                                {new Date(user.created_at).toLocaleDateString('pt-BR', {
                                                    day: '2-digit',
                                                    month: 'long',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                        </div>

                                        {isEditing && (
                                            <div className="pt-4">
                                                <Button
                                                    onClick={handleSaveProfile}
                                                    className="w-full bg-primary hover:bg-primary/90"
                                                    disabled={isSaving}
                                                >
                                                    {isSaving ? (
                                                        <>
                                                            <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                            </svg>
                                                            Salvando...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Save className="mr-2 h-4 w-4" />
                                                            Salvar Alterações
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="seguranca" className="mt-6">
                                <Card className="border-border">
                                    <CardHeader>
                                        <CardTitle className="text-lg">Alterar Senha</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="currentPassword">
                                                <div className="flex items-center gap-2">
                                                    <Key className="h-4 w-4" />
                                                    <span>Senha Atual</span>
                                                </div>
                                            </Label>
                                            <Input
                                                id="currentPassword"
                                                type="password"
                                                value={passwordData.currentPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                disabled={isSaving}
                                                placeholder="Digite sua senha atual"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="newPassword">
                                                <div className="flex items-center gap-2">
                                                    <Lock className="h-4 w-4" />
                                                    <span>Nova Senha</span>
                                                </div>
                                            </Label>
                                            <Input
                                                id="newPassword"
                                                type="password"
                                                value={passwordData.newPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                disabled={isSaving}
                                                placeholder="Mínimo 6 caracteres"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="confirmPassword">
                                                <div className="flex items-center gap-2">
                                                    <Lock className="h-4 w-4" />
                                                    <span>Confirmar Nova Senha</span>
                                                </div>
                                            </Label>
                                            <Input
                                                id="confirmPassword"
                                                type="password"
                                                value={passwordData.confirmPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                disabled={isSaving}
                                                placeholder="Confirme sua nova senha"
                                            />
                                        </div>

                                        <div className="pt-4">
                                            <Button
                                                onClick={handleSavePassword}
                                                className="w-full bg-primary hover:bg-primary/90"
                                                disabled={isSaving}
                                            >
                                                {isSaving ? (
                                                    <>
                                                        <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Alterando...
                                                    </>
                                                ) : "Alterar Senha"}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </div>
    )
}