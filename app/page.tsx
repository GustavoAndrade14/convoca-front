"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserAvatar } from "@/components/user-avatar"
import { RachaModal } from "@/components/racha-modal"
import { RachaList } from "@/components/racha-list"
import authService from "@/lib/auth"
import rachaService, { Racha as RachaType } from "@/lib/racha"
import Image from "next/image"
import { Calendar, Users, DollarSign } from "lucide-react"
import { toast } from "sonner"

export default function Home() {
  const [user, setUser] = useState(authService.getUser())
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [rachas, setRachas] = useState<RachaType[]>([])
  const [meusRachas, setMeusRachas] = useState<RachaType[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("ativos")

  // Carregar dados com useCallback para evitar recriações
  const loadRachas = useCallback(async () => {
    try {
      const [allRachas, myRachas] = await Promise.all([
        rachaService.listarRachas(),
        rachaService.listarMeusRachas()
      ])

      setRachas(allRachas.rachas || [])
      setMeusRachas(myRachas.rachas || [])
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || "Erro ao carregar rachas")
        console.error(error)
      } else {
        toast.error("Erro ao carregar rachas")
        console.error("Erro desconhecido:", error)
      }
    }
  }, [])

  useEffect(() => {
    const checkAuth = () => {
      const token = authService.getToken()
      if (token) {
        const storedUser = authService.getUser()
        setUser(storedUser)
      }
      setIsLoading(false)
    }

    checkAuth()

    // Usar setTimeout para evitar chamada síncrona de setState
    const loadData = async () => {
      await loadRachas()
    }

    // Usar setTimeout 0 para adicionar à fila de tarefas
    const timer = setTimeout(() => {
      loadData()
    }, 0)

    return () => {
      clearTimeout(timer)
    }
  }, [loadRachas])

  // Filtrar rachas por busca
  const filteredRachas = rachas.filter(racha =>
    racha.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    racha.localizacao.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Filtrar meus rachas por busca
  const filteredMeusRachas = meusRachas.filter(racha =>
    racha.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    racha.localizacao.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Estatísticas
  const estatisticas = {
    ativos: rachas.filter(r => r.status !== 'encerrado').length,
    participando: rachas.length, // Simulação
    finalizados: rachas.filter(r => r.status === 'encerrado').length,
    valorTotal: rachas.reduce((sum, racha) => sum + (racha.valor || 0), 0)
  }

  // Verificar se o usuário está logado
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

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Image src="/logo.png" alt="Logo" width={80} height={80} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">CONVOCA</h1>
                <p className="text-xs text-muted-foreground">Organizador de Racha</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isLoading ? (
                <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
              ) : (
                <UserAvatar user={user} />
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-8">
          <p className="text-muted-foreground mt-1">
            Confira os rachas disponíveis
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar rachas..."
              className="pl-10 bg-card border-border"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 shadow-lg shadow-primary/25"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Novo Racha
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="ativos">Ativos</TabsTrigger>
            <TabsTrigger value="meus">Meus Rachas</TabsTrigger>
            <TabsTrigger value="participando">Participando</TabsTrigger>
          </TabsList>

          {/* Cards de Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 mt-6">
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Rachas Ativos</p>
                    <p className="text-2xl font-bold text-foreground">{estatisticas.ativos}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Participando</p>
                    <p className="text-lg font-bold text-foreground">{estatisticas.participando}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Valor Total</p>
                    <p className="text-2xl font-bold text-foreground">
                      R$ {estatisticas.valorTotal.toFixed(2)}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-chart-3/10 flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-chart-3" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Conteúdo das Tabs */}
          <TabsContent value="ativos" className="mt-6">
            {filteredRachas.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">Nenhum racha encontrado</p>
                <p className="text-sm text-muted-foreground">
                  {searchTerm ? "Tente buscar com outros termos" : "Crie seu primeiro racha para começar!"}
                </p>
              </div>
            ) : (
              <RachaList
                rachas={filteredRachas}
                onRefresh={loadRachas}
              />
            )}
          </TabsContent>

          <TabsContent value="meus" className="mt-6">
            {filteredMeusRachas.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">Você ainda não criou nenhum racha</p>
                <Button
                  onClick={() => setIsModalOpen(true)}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Criar Meu Primeiro Racha
                </Button>
              </div>
            ) : (
              <RachaList
                rachas={filteredMeusRachas}
                onRefresh={loadRachas}
                showActions={true}
              />
            )}
          </TabsContent>

          <TabsContent value="participando" className="mt-6">
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Em desenvolvimento</p>
              <p className="text-sm text-muted-foreground">
                Em breve você poderá ver todos os rachas que está participando
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Modal para criar novo racha */}
        <RachaModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false)
            loadRachas()
            toast.success("Racha criado com sucesso!")
          }}
        />
      </div>
    </main>
  )
}