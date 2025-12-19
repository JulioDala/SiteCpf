// components/providers/AuthProvider.tsx
'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/storage/atuh-storage';

interface AuthProviderProps {
  children: React.ReactNode;
  requireAuth?: boolean; // true = rota protegida, false = rota pública
}

export function AuthProvider({ children, requireAuth = false }: AuthProviderProps) {
  const { isAuthenticated, isInitialized } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Aguarda inicialização do auth store
    if (!isInitialized) {
      console.log('⏳ Aguardando inicialização...');
      return;
    }

    console.log('🔒 AuthProvider - Rota:', pathname);
    console.log('🔑 Autenticado:', isAuthenticated);
    console.log('🛡️ Requer autenticação:', requireAuth);

    // ROTA PROTEGIDA: Precisa estar autenticado
    if (requireAuth && !isAuthenticated) {
      console.log('❌ Acesso negado - Redirecionando para login');
      const loginUrl = `/login?redirect=${encodeURIComponent(pathname)}`;
      router.replace(loginUrl);
      return;
    }

    // ROTA PÚBLICA: Se já autenticado e tentar acessar login, redireciona
    if (!requireAuth && isAuthenticated && pathname === '/login') {
      console.log('✅ Já autenticado - Redirecionando para dashboard');
      router.replace('/dashboard/home');
      return;
    }

    console.log('✅ Acesso permitido');
  }, [isAuthenticated, isInitialized, requireAuth, pathname, router]);

  // Mostra loading enquanto inicializa
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-cyan-50 to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Se rota protegida e não autenticado, mostra loading (vai redirecionar)
  if (requireAuth && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-cyan-50 to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return <>{children}</>;
}