import { NextResponse, type NextRequest } from 'next/server';
import { hasValidSession, SESSION_COOKIE } from './app/_auth/session';

const UNAUTHORIZED = 401;
const LOGIN_PATH = '/login';

/** Tudo exige sessão, exceto o login e os ficheiros estáticos do Next. */
export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (pathname === LOGIN_PATH || (await hasValidSession(token, Date.now()))) {
    return NextResponse.next();
  }
  if (pathname.startsWith('/api/')) {
    return NextResponse.json(
      { error: { code: 'unauthorized', message: 'Sessão em falta ou expirada.' } },
      { status: UNAUTHORIZED },
    );
  }
  const login = new URL(LOGIN_PATH, request.url);
  if (pathname !== '/') login.searchParams.set('next', `${pathname}${search}`);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
