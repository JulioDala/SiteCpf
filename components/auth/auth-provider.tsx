'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/storage/atuh-storage';
import { Loader2 } from 'lucide-react';

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ✅ Rotas que não precisam de autenticação
const PUBLIC_PATHS = [
    '/login',
    '/registro',
    '/recuperar-senha',
];

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const { userLogin, isInitialized, initialize } = useAuthStore();
    const [isRedirecting, setIsRedirecting] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    const isAuthenticated = !!userLogin?.accessToken;

    useEffect(() => {
        if (!isInitialized) {
            initialize();
        }
    }, [isInitialized, initialize]);

    useEffect(() => {
        if (!isInitialized) return;

        const isPublicPath = PUBLIC_PATHS.some(path => pathname.startsWith(path)) || pathname === '/';
        const isProtectedPath = pathname.startsWith('/dashboard') ||
            pathname.startsWith('/perfil') ||
            pathname.startsWith('/configuracoes');

        // 🚫 Tentar acessar rota protegida SEM token
        if (isProtectedPath && !isAuthenticated) {
            console.log('❌ AuthProvider: Acesso negado - Redirecionando para /login');
            setIsRedirecting(true);
            router.push(`/login?redirect=${pathname}`);
            return;
        }

        // 🔄 Já autenticado tentando acessar página de login ou registro
        if (isAuthenticated && (pathname === '/login' || pathname === '/registro')) {
            console.log('✅ AuthProvider: Já autenticado - Redirecionando para dashboard');
            setIsRedirecting(true);
            router.push('/dashboard/home');
            return;
        }

        setIsRedirecting(false);
    }, [isAuthenticated, isInitialized, pathname, router]);

    // Exibe loading durante a inicialização ou redirecionamento
    if (!isInitialized || isRedirecting) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-white z-[9999]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
                    <p className="text-gray-500 font-medium">Verificando autenticação...</p>
                </div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, isLoading: !isInitialized, user: userLogin?.cliente }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
};
