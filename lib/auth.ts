import { createClient, SupabaseClient } from '@supabase/supabase-js';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

let supabaseClient: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
}

export interface RegisterData {
    username: string;
    email: string;
    phone?: string;
    password: string;
    confirmPassword: string;
}

export interface LoginData {
    username: string;
    password: string;
}

export interface UpdateProfileData {
    username: string;
    email: string;
    phone?: string;
}

export interface ChangePasswordData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
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

export interface UpdateProfileResponse {
    success: boolean;
    message: string;
    user: User;
}

export interface UploadPictureResponse {
    success: boolean;
    message: string;
    profile_picture_url: string | null;
}

export interface ChangePasswordResponse {
    success: boolean;
    message: string;
}

// Função de validação do usuário
const isValidUser = (user: unknown): user is User => {
    if (!user || typeof user !== 'object') {
        console.log('isValidUser: não é objeto', user);
        return false;
    }

    const userObj = user as Record<string, unknown>;

    console.log('Validando propriedades:', {
        id: typeof userObj.id,
        username: typeof userObj.username,
        email: typeof userObj.email,
        created_at: typeof userObj.created_at,
        phone: userObj.phone,
        profile_picture_url: userObj.profile_picture_url
    });

    // Propriedades obrigatórias
    const hasRequiredProps =
        typeof userObj.id === 'string' &&
        typeof userObj.username === 'string' &&
        typeof userObj.email === 'string' &&
        typeof userObj.created_at === 'string';

    if (!hasRequiredProps) {
        console.log('isValidUser: propriedades obrigatórias faltando');
        return false;
    }

    // Propriedades opcionais - agora aceita null também
    const optionalPropsValid =
        (userObj.phone === undefined || userObj.phone === null || typeof userObj.phone === 'string') &&
        (userObj.profile_picture_url === undefined || userObj.profile_picture_url === null || typeof userObj.profile_picture_url === 'string');

    if (!optionalPropsValid) {
        console.log('isValidUser: propriedades opcionais inválidas');
        return false;
    }

    console.log('isValidUser: usuário válido!');
    return true;
};

class AuthService {
    private baseUrl: string;
    private supabase: SupabaseClient | null;

    constructor() {
        this.baseUrl = API_URL;
        this.supabase = supabaseClient;
    }

    async register(data: RegisterData): Promise<AuthResponse> {
        try {
            // Validação adicional no frontend
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

    async updateProfile(data: UpdateProfileData): Promise<UpdateProfileResponse> {
        try {
            const token = this.getToken();
            if (!token) {
                throw new Error('Token não encontrado');
            }

            const response = await fetch(`${this.baseUrl}/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Erro ao atualizar perfil');
            }

            // Atualizar usuário no localStorage
            if (result.user) {
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

    async changePassword(data: ChangePasswordData): Promise<ChangePasswordResponse> {
        try {
            const token = this.getToken();
            if (!token) {
                throw new Error('Token não encontrado');
            }

            const response = await fetch(`${this.baseUrl}/auth/profile/password`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Erro ao alterar senha');
            }

            return result;
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(error.message || 'Erro ao conectar com o servidor');
            }
            throw new Error('Erro desconhecido');
        }
    }

    async uploadProfilePicture(file: File): Promise<UploadPictureResponse> {
        try {
            const token = this.getToken();
            if (!token) {
                throw new Error('Token não encontrado');
            }

            // Primeiro, verificar se o Supabase está configurado
            if (!this.supabase) {
                throw new Error('Supabase não configurado. Verifique as variáveis de ambiente.');
            }

            // Obter o usuário atual
            const user = this.getUser();
            if (!user) {
                throw new Error('Usuário não encontrado');
            }

            // Validar o arquivo
            if (!file.type.startsWith('image/')) {
                throw new Error('O arquivo deve ser uma imagem');
            }

            if (file.size > 5 * 1024 * 1024) { // 5MB
                throw new Error('A imagem deve ter no máximo 5MB');
            }

            // Gerar nome único para o arquivo
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}/${Date.now()}.${fileExt}`;
            const filePath = `profile-pictures/${fileName}`;

            console.log('Fazendo upload para:', filePath);

            // Fazer upload para o Supabase Storage
            const { data: uploadData, error: uploadError } = await this.supabase
                .storage
                .from('profiles') // Nome do bucket
                .upload(filePath, file, {
                    upsert: true, // Sobrescreve se existir
                    contentType: file.type
                });

            if (uploadError) {
                console.error('Erro no upload do Supabase:', uploadError);
                throw new Error(`Erro no upload: ${uploadError.message}`);
            }

            // Obter URL pública da imagem
            const { data: publicUrlData } = this.supabase
                .storage
                .from('profiles')
                .getPublicUrl(filePath);

            const profilePictureUrl = publicUrlData?.publicUrl || null;

            if (!profilePictureUrl) {
                throw new Error('Não foi possível obter a URL pública da imagem');
            }

            // Atualizar o perfil do usuário com a nova URL
            const updateResponse = await fetch(`${this.baseUrl}/auth/profile/picture`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ profile_picture_url: profilePictureUrl }),
            });

            const updateResult = await updateResponse.json();

            if (!updateResponse.ok) {
                // Se falhar a atualização no banco, tenta deletar a imagem do storage
                await this.supabase
                    .storage
                    .from('profiles')
                    .remove([filePath]);

                throw new Error(updateResult.message || 'Erro ao atualizar perfil');
            }

            // Atualizar usuário no localStorage
            if (updateResult.user) {
                this.setUser(updateResult.user);
            }

            return {
                success: true,
                message: 'Foto de perfil atualizada com sucesso!',
                profile_picture_url: profilePictureUrl
            };

        } catch (error: unknown) {
            console.error('Erro completo no upload:', error);
            if (error instanceof Error) {
                throw new Error(error.message || 'Erro ao fazer upload da foto');
            }
            throw new Error('Erro desconhecido ao fazer upload da foto');
        }
    }

    async deleteProfilePicture(): Promise<{ success: boolean; message: string }> {
        try {
            const token = this.getToken();
            if (!token) {
                throw new Error('Token não encontrado');
            }

            if (!this.supabase) {
                throw new Error('Supabase não configurado');
            }

            const user = this.getUser();
            if (!user) {
                throw new Error('Usuário não encontrado');
            }

            // Se o usuário tem uma foto, tentar deletar do storage
            if (user.profile_picture_url) {
                try {
                    // Extrair o caminho da URL
                    const url = new URL(user.profile_picture_url);
                    const pathParts = url.pathname.split('/');
                    const bucketIndex = pathParts.indexOf('profiles');

                    if (bucketIndex !== -1) {
                        const filePath = pathParts.slice(bucketIndex + 1).join('/');

                        const { error: deleteError } = await this.supabase
                            .storage
                            .from('profiles')
                            .remove([filePath]);

                        if (deleteError) {
                            console.warn('Não foi possível deletar a imagem antiga:', deleteError);
                        }
                    }
                } catch (error) {
                    console.warn('Erro ao tentar deletar imagem antiga:', error);
                }
            }

            // Atualizar o perfil para remover a URL da foto
            const response = await fetch(`${this.baseUrl}/auth/profile/picture`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Erro ao remover foto');
            }

            // Atualizar usuário no localStorage
            if (result.user) {
                this.setUser(result.user);
            }

            return {
                success: true,
                message: 'Foto de perfil removida com sucesso!'
            };

        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(error.message || 'Erro ao remover foto');
            }
            throw new Error('Erro desconhecido ao remover foto');
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
            console.log('userStr do localStorage:', userStr); // DEBUG

            if (!userStr) {
                console.log('Nenhum usuário encontrado no localStorage'); // DEBUG
                return null;
            }

            try {
                const parsedUser = JSON.parse(userStr);
                console.log('parsedUser:', parsedUser); // DEBUG
                const isValid = isValidUser(parsedUser);
                console.log('isValid:', isValid); // DEBUG
                return isValid ? parsedUser : null;
            } catch (error) {
                console.error('Erro ao fazer parse do usuário:', error); // DEBUG
                return null;
            }
        }
        return null;
    }
}

export default new AuthService();