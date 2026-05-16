import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cx = searchParams.get('cx');
  const cy = searchParams.get('cy');
  const radius = searchParams.get('radius') || '1000';

  if (!cx || !cy) {
    return NextResponse.json({ error: 'Missing parameters (cx, cy)' }, { status: 400 });
  }

  // 공공데이터포털 API Key (서버 사이드에서만 안전하게 사용됨)
  const serviceKey = process.env.DATA_GO_KR_API_KEY;
  
  if (!serviceKey) {
    return NextResponse.json({ error: 'API Key not configured' }, { status: 500 });
  }

  const url = `https://apis.data.go.kr/B553077/api/open/sdsc2/storeListInRadius?ServiceKey=${serviceKey}&pageNo=1&numOfRows=100&cx=${cx}&cy=${cy}&radius=${radius}&type=json`;

  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error(`Public API responded with status ${res.status}`);
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Proxy API Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch data from data.go.kr' }, { status: 500 });
  }
}
