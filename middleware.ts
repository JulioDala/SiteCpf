// middleware.ts (na raiz do projeto)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // ✅ Middleware agora apenas passa todas as requisições
  // A proteção de rotas é feita pelos AuthProviders nos layouts
  console.log('🔄 Middleware - Rota:', request.nextUrl.pathname);
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