const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface Racha {
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
    link_compartilhamento?: string;
}

export interface CriarRachaData {
    nome: string;
    descricao?: string;
    data_hora: string;
    localizacao: string;
    limite_min?: number;
    limite_max: number;
    valor?: number;
}

export interface EditarRachaData {
    nome?: string;
    descricao?: string;
    data_hora?: string;
    localizacao?: string;
    limite_min?: number;
    limite_max?: number;
    valor?: number;
}

class RachaService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = API_URL;
    }

    // Obter token
    private getToken(): string | null {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('auth_token');
        }
        return null;
    }

    // Listar todos os rachas
    async listarRachas(status?: string): Promise<{ rachas: Racha[] }> {
        try {
            let url = `${this.baseUrl}/rachas`;
            if (status) {
                url += `?status=${status}`;
            }

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error('Erro ao buscar rachas');
            }

            return await response.json();
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(error.message || 'Erro ao conectar com o servidor');
            }
            throw new Error('Erro desconhecido');
        }
    }

    // Listar meus rachas (como dono)
    async listarMeusRachas(): Promise<{ rachas: Racha[] }> {
        try {
            // Para simplificar, vamos filtrar no frontend
            // Em uma implementação real, o backend teria um endpoint específico
            const response = await fetch(`${this.baseUrl}/rachas`);

            if (!response.ok) {
                throw new Error('Erro ao buscar rachas');
            }

            const data = await response.json();

            // Aqui você precisaria implementar a lógica real
            // Por enquanto retorna todos (simulação)
            return data;
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(error.message || 'Erro ao conectar com o servidor');
            }
            throw new Error('Erro desconhecido');
        }
    }

    // Buscar racha por ID
    async buscarRachaPorId(id: string): Promise<{ racha: Racha }> {
        try {
            const response = await fetch(`${this.baseUrl}/rachas/${id}`);

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Racha não encontrado');
                }
                throw new Error('Erro ao buscar racha');
            }

            return await response.json();
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
            throw new Error('Erro desconhecido');
        }
    }

    // Criar novo racha
    async criarRacha(data: CriarRachaData): Promise<{ mensagem: string; racha: Racha }> {
        try {
            const token = this.getToken();
            if (!token) {
                throw new Error('Token não encontrado');
            }

            const response = await fetch(`${this.baseUrl}/rachas`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Erro ao criar racha');
            }

            return result;
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(error.message || 'Erro ao conectar com o servidor');
            }
            throw new Error('Erro desconhecido');
        }
    }

    // Editar racha
    async editarRacha(id: string, data: EditarRachaData): Promise<{ mensagem: string; racha: Racha }> {
        try {
            const token = this.getToken();
            if (!token) {
                throw new Error('Token não encontrado');
            }

            const response = await fetch(`${this.baseUrl}/rachas/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Erro ao editar racha');
            }

            return result;
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(error.message || 'Erro ao conectar com o servidor');
            }
            throw new Error('Erro desconhecido');
        }
    }

    // Deletar racha
    async deletarRacha(id: string): Promise<{ mensagem: string }> {
        try {
            const token = this.getToken();
            if (!token) {
                throw new Error('Token não encontrado');
            }

            const response = await fetch(`${this.baseUrl}/rachas/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Erro ao deletar racha');
            }

            return result;
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(error.message || 'Erro ao conectar com o servidor');
            }
            throw new Error('Erro desconhecido');
        }
    }

    // Encerrar racha
    async encerrarRacha(id: string): Promise<{ mensagem: string; racha: Racha }> {
        try {
            const token = this.getToken();
            if (!token) {
                throw new Error('Token não encontrado');
            }

            const response = await fetch(`${this.baseUrl}/rachas/${id}/encerrar`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Erro ao encerrar racha');
            }

            return result;
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(error.message || 'Erro ao conectar com o servidor');
            }
            throw new Error('Erro desconhecido');
        }
    }

    // Participar de um racha
    async participarRacha(id: string): Promise<{ mensagem: string }> {
        try {
            const token = this.getToken();
            if (!token) {
                throw new Error('Token não encontrado');
            }

            // Aqui você precisaria implementar a lógica de participação
            // Por enquanto é uma simulação
            await new Promise(resolve => setTimeout(resolve, 1000));

            return { mensagem: 'Participação confirmada!' };
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(error.message || 'Erro ao participar do racha');
            }
            throw new Error('Erro desconhecido');
        }
    }
}

export default new RachaService();