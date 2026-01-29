const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export interface RegisterData {
    username: string;
    email: string;
    phone?: string;
    password: string;
    confirmPassword: string; // Adicione este campo
}

export interface LoginData {
    username: string;
    password: string;
}

export interface User {
    id: string;
    username: string;
    email: string;
    phone?: string;
    profile_picture_url?: string;
    created_at: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    user: User;
    token: string;
}

class AuthService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = API_URL;
    }

    async register(data: RegisterData): Promise<AuthResponse> {
        try {
            // Validação adicional no frontend (opcional, mas bom ter dupla validação)
            if (data.password !== data.confirmPassword) {
                throw new Error('As senhas não coincidem');
            }

            if (data.password.length < 6) {
                throw new Error('A senha deve ter pelo menos 6 caracteres');
            }

            const response = await fetch(`${this.baseUrl}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Erro ao registrar');
            }

            if (result.token) {
                this.setToken(result.token);
                this.setUser(result.user);
            }

            return result;
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(error.message || 'Erro ao conectar com o servidor');
            }
            throw new Error('Erro desconhecido');
        }
    }

    async login(data: LoginData): Promise<AuthResponse> {
        try {
            const response = await fetch(`${this.baseUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Credenciais inválidas');
            }

            if (result.token) {
                this.setToken(result.token);
                this.setUser(result.user);
            }

            return result;
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(error.message || 'Erro ao conectar com o servidor');
            }
            throw new Error('Erro desconhecido');
        }
    }

    async getProfile(): Promise<{ success: boolean; user: User }> {
        try {
            const token = this.getToken();
            if (!token) {
                throw new Error('Token não encontrado');
            }

            const response = await fetch(`${this.baseUrl}/auth/profile`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Erro ao buscar perfil');
            }

            return result;
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(error.message || 'Erro ao conectar com o servidor');
            }
            throw new Error('Erro desconhecido');
        }
    }

    isAuthenticated(): boolean {
        return !!this.getToken();
    }

    logout(): void {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
        }
    }

    private setToken(token: string): void {
        if (typeof window !== 'undefined') {
            localStorage.setItem('auth_token', token);
        }
    }

    getToken(): string | null {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('auth_token');
        }
        return null;
    }

    private setUser(user: User): void {
        if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(user));
        }
    }

    getUser(): User | null {
        if (typeof window !== 'undefined') {
            const userStr = localStorage.getItem('user');
            return userStr ? JSON.parse(userStr) : null;
        }
        return null;
    }
}

export default new AuthService();