import { NextResponse } from 'next/server';

const AUTH_COOKIE = 'game_admin_token';

// Web Crypto API로 토큰 생성 (미들웨어와 동일 로직)
async function generateToken(secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(secret + ':game-admin-salt-v1');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// POST: 비밀번호 검증 후 인증 쿠키 발급
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json({ error: '비밀번호를 입력하세요.' }, { status: 400 });
    }

    const adminSecret = process.env.ADMIN_SECRET;
    if (!adminSecret) {
      return NextResponse.json({ error: '서버 설정 오류: ADMIN_SECRET이 설정되지 않았습니다.' }, { status: 500 });
    }

    // 비밀번호 검증
    if (password !== adminSecret) {
      return NextResponse.json({ error: '비밀번호가 올바르지 않습니다.' }, { status: 401 });
    }

    // 인증 토큰 생성
    const token = await generateToken(adminSecret);

    // 응답에 httpOnly 쿠키 설정
    const response = NextResponse.json({ success: true, message: '로그인 성공' });
    response.cookies.set(AUTH_COOKIE, token, {
      httpOnly: true,          // JS에서 접근 불가 (XSS 방어)
      secure: process.env.NODE_ENV === 'production', // HTTPS 전용 (프로덕션에서만)
      sameSite: 'strict',      // CSRF 방어
      maxAge: 60 * 60 * 8,     // 8시간 유지
      path: '/',
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || '로그인 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
