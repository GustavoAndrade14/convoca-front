import { Plus, Search, Filter, Bell, Calendar, MapPin, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import Image from "next/image"

const rachasExemplo = [
  {
    id: "1",
    nome: "Racha Masters",
    descricao: "Futebol para jogadores acima de 30 anos, nível intermediário",
    data: "Qua, 29 Jan",
    horario: "20:00",
    endereco: "Av. Paulista, 1000 - São Paulo",
    jogadores: 12,
    maxJogadores: 14,
    valor: "R$ 25,00",
    status: "disponivel"
  },
  {
    id: "2",
    nome: "Pelada dos Amigos",
    descricao: "Racha descontraído para amigos de longa data",
    data: "Sáb, 01 Fev",
    horario: "16:00",
    endereco: "Rua das Flores, 500 - São Paulo",
    jogadores: 8,
    maxJogadores: 10,
    valor: "R$ 30,00",
    status: "disponivel"
  },
  {
    id: "3",
    nome: "Rachão Competitivo",
    descricao: "Para quem gosta de jogo forte e competitivo",
    data: "Sex, 31 Jan",
    horario: "19:00",
    endereco: "Alameda Santos, 2000 - São Paulo",
    jogadores: 14,
    maxJogadores: 14,
    valor: "R$ 20,00",
    status: "lotado"
  },
  {
    id: "4",
    nome: "Futebol Manhã de Domingo",
    descricao: "Iniciantes são bem-vindos! Ambiente amigável",
    data: "Dom, 02 Fev",
    horario: "09:00",
    endereco: "Praça da Liberdade, 300 - São Paulo",
    jogadores: 6,
    maxJogadores: 12,
    valor: "R$ 15,00",
    status: "disponivel"
  },
  {
    id: "5",
    nome: "Racha da Firma",
    descricao: "Exclusivo para funcionários da empresa TechCorp",
    data: "Qui, 30 Jan",
    horario: "18:30",
    endereco: "Av. Faria Lima, 3500 - São Paulo",
    jogadores: 9,
    maxJogadores: 10,
    valor: "R$ 35,00",
    status: "disponivel"
  },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-accent  from-primary to-accent flex items-center justify-center">
                <Image src="/logo.png" alt="Logo" width={80} height={80} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">CONVOCA</h1>
                <p className="text-xs text-muted-foreground">Organizador de Racha</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
                  3
                </span>
              </Button>
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
            />
          </div>
          <div className="flex gap-2">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 shadow-lg shadow-primary/25">
              <Plus className="h-4 w-4" />
              Novo Racha
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="ativos" className="mb-8">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="ativos">Ativos</TabsTrigger>
            <TabsTrigger value="participando">Participando</TabsTrigger>
            <TabsTrigger value="finalizados">Finalizados</TabsTrigger>
          </TabsList>
          <TabsContent value="ativos" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card className="bg-card border-border">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Rachas Ativos</p>
                      <p className="text-2xl font-bold text-foreground">5</p>
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
                      <p className="text-sm text-muted-foreground">Próximo Racha</p>
                      <p className="text-lg font-bold text-foreground">Amanhã, 20:00</p>
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
                      <p className="text-2xl font-bold text-foreground">R$ 125,00</p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-chart-3/10 flex items-center justify-center">
                      <span className="text-2xl font-bold text-chart-3">R$</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {rachasExemplo.map((racha) => (
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
                          <Badge
                            variant={racha.status === "lotado" ? "destructive" : "default"}
                            className="ml-auto"
                          >
                            {racha.status === "lotado" ? "Lotado" : "Disponível"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {racha.descricao}
                        </p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pb-3">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span className="font-medium">{racha.data}</span>
                          <span className="text-foreground font-bold">• {racha.horario}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <div>
                          <p className="text-xs truncate">{racha.endereco}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Valor por jogador</p>
                          <p className="text-xl font-bold text-accent">{racha.valor}</p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Vagas preenchidas</span>
                          <span className="font-medium text-foreground">
                            {racha.jogadores}/{racha.maxJogadores}
                          </span>
                        </div>
                        <Progress
                          value={(racha.jogadores / racha.maxJogadores) * 100}
                          className="h-2"
                        />
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="pt-3 border-t border-border">
                    <div className="flex w-full gap-3">
                      <Button variant="outline" className="flex-1">
                        Detalhes
                      </Button>
                      <Button
                        className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                        disabled={racha.status === "lotado"}
                      >
                        {racha.status === "lotado" ? "Lista de Espera" : "Participar"}
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="fixed bottom-6 right-6 md:hidden">
          <Button
            size="lg"
            className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/30"
          >
            <Plus className="h-6 w-6" />
            <span className="sr-only">Criar novo racha</span>
          </Button>
        </div>
      </div>
    </main>
  )
}
