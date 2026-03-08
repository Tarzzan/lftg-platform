import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes publiques (accessibles sans authentification)
const PUBLIC_ROUTES = [
  '/login',
  '/register',
  '/offline',
  '/kiosque',
  '/tourisme',
  '/public',
];

// Routes qui nécessitent une authentification
const PROTECTED_PREFIXES = ['/admin'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Vérifier si la route est protégée
  const isProtected = PROTECTED_PREFIXES.some(prefix => pathname.startsWith(prefix));
  
  if (!isProtected) {
    return NextResponse.next();
  }

  // Vérifier la présence du token dans les cookies
  const token = request.cookies.get('lftg_token')?.value 
    || request.cookies.get('token')?.value;

  // Vérifier aussi dans localStorage via un cookie de session
  const sessionCookie = request.cookies.get('lftg_session')?.value;

  if (!token && !sessionCookie) {
    // Rediriger vers login avec l'URL de retour
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Matcher pour toutes les routes sauf :
     * - _next/static (fichiers statiques)
     * - _next/image (optimisation images)
     * - favicon.ico
     * - fichiers publics
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
