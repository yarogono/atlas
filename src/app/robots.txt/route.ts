import { NextResponse } from 'next/server';

export function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://atlas.yaro.co.kr';

  const content = `User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml

#DaumWebMasterTool:5cd7304718707deed3b1b4d48bb4bc028ce3cc85ba35a3ddb856ebc46e70e7ad:zT5MXd5hNCLIV2Rd+LwLzg==`;

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}
