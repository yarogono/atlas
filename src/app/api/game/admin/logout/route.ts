import { NextResponse } from 'next/server';

const AUTH_COOKIE = 'game_admin_token';

// POST: 인증 쿠키 삭제 (로그아웃)
export async function POST() {
  const response = NextResponse.json({ success: true, message: '로그아웃 되었습니다.' });
  
  // 쿠키 만료 처리 (maxAge: 0으로 즉시 삭제)
  response.cookies.set(AUTH_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  });

  return response;
}
