// middleware.ts (na raiz do projeto)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  const { pathname } = request.nextUrl;

  console.log('🔒 Middleware executado:', pathname);
  console.log('🔑 Token presente:', !!token);

  // ✅ Rotas públicas (não precisam de autenticação)
  const publicPaths = [
    '/',
    '/login',
    '/registro',
    '/recuperar-senha',
  ];

  // ✅ Rotas protegidas (precisam de autenticação)
  const protectedPaths = [
    '/dashboard',
    '/perfil',
    '/configuracoes',
  ];

  const isPublicPath = publicPaths.some(path => 
    pathname === path || pathname.startsWith(path)
  );
  
  const isProtectedPath = protectedPaths.some(path => 
    pathname.startsWith(path)
  );

  // 🚫 Tentar acessar rota protegida SEM token
  if (isProtectedPath && !token) {
    console.log('❌ Acesso negado - Sem token');
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 🔄 Já autenticado tentando acessar página de login
  if (token && pathname === '/login') {
    console.log('✅ Já autenticado - Redirecionando para dashboard');
    return NextResponse.redirect(new URL('/dashboard/home', request.url));
  }

  console.log('✅ Acesso permitido');
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg).*)',
  ],
};