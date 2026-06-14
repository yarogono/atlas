import { NextRequest, NextResponse } from 'next/server';

// 보호가 필요한 경로 목록
const PROTECTED_PATHS = [
  '/game/admin.html',
  '/game/admin.js',
  '/api/game/upload',
  '/api/game/config',
  '/api/game/assets',
];

// 인증 쿠키 이름
const AUTH_COOKIE = 'game_admin_token';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 보호 경로인지 확인
  const isProtected = PROTECTED_PATHS.some(p => pathname.startsWith(p));
  if (!isProtected) {
    return NextResponse.next();
  }

  // 로그인 API 자체는 인증 없이 통과 (무한루프 방지)
  if (pathname.startsWith('/api/game/admin')) {
    return NextResponse.next();
  }

  // 설정 조회(GET)는 일반 사용자도 게임 플레이를 위해 접근할 수 있어야 함
  if (pathname === '/api/game/config' && req.method === 'GET') {
    return NextResponse.next();
  }

  // 쿠키에서 토큰 읽기
  const token = req.cookies.get(AUTH_COOKIE)?.value;
  const expectedToken = await generateToken(process.env.ADMIN_SECRET || '');

  // 토큰 유효성 검사
  if (!token || token !== expectedToken) {
    // API 경로는 401 JSON 반환
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: '인증이 필요합니다. 관리자 페이지에서 로그인하세요.' },
        { status: 401 }
      );
    }
    // 일반 페이지는 로그인 페이지로 리다이렉트
    const loginUrl = new URL('/game/admin-login.html', req.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Web Crypto API를 사용하여 비밀번호에서 토큰을 생성 (Edge Runtime 호환)
async function generateToken(secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(secret + ':game-admin-salt-v1');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// 미들웨어가 실행될 경로 패턴 지정
export const config = {
  matcher: [
    '/game/admin.html',
    '/game/admin.js',
    '/api/game/upload',
    '/api/game/config',
    '/api/game/admin/:path*',
  ],
};
