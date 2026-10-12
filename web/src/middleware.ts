import { NextResponse, type NextRequest } from 'next/server';
import { readAuthConfig, SESSION_COOKIE, verifySessionToken } from './app/_auth/session';

const UNAUTHORIZED = 401;

/** Tudo exige sessão, exceto o login e os ficheiros estáticos do Next. */
export async function middleware(request: NextRequest): Promise<NextResponse> {
  const auth = readAuthConfig();
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (auth && (await verifySessionToken(token, auth.secret, Date.now()))) {
    return NextResponse.next();
  }
  const { pathname, search } = request.nextUrl;
  if (pathname.startsWith('/api/')) {
    return NextResponse.json(
      { error: { code: 'unauthorized', message: 'Sessão em falta ou expirada.' } },
      { status: UNAUTHORIZED },
    );
  }
  const login = new URL('/login', request.url);
  if (pathname !== '/') login.searchParams.set('next', `${pathname}${search}`);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ['/((?!login|_next/static|_next/image|favicon.ico).*)'],
};
