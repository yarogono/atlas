import { NextResponse } from 'next/server';
import { S3Client, ListObjectsV2Command, DeleteObjectCommand } from '@aws-sdk/client-s3';

// S3 Client 및 설정 취득 헬퍼
function getS3Config() {
  const bucketName = process.env.AWS_S3_BUCKET_NAME;
  const region = process.env.AWS_REGION;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const cdnUrl = process.env.NEXT_PUBLIC_CDN_URL || `https://${bucketName}.s3.${region}.amazonaws.com`;

  const isConfigured = !!(bucketName && region && accessKeyId && secretAccessKey);

  const client = new S3Client({
    region: region || 'ap-northeast-2',
    credentials: {
      accessKeyId: accessKeyId || '',
      secretAccessKey: secretAccessKey || '',
    },
  });

  return { client, bucketName, cdnUrl, isConfigured };
}

// GET: S3 에셋 목록 조회 (game-assets/ 하위 파일)
export async function GET() {
  try {
    const { client: s3Client, bucketName: BUCKET_NAME, cdnUrl: CDN_URL, isConfigured } = getS3Config();

    if (!isConfigured) {
      return NextResponse.json({ error: 'AWS S3 설정이 올바르지 않습니다.' }, { status: 500 });
    }

    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: 'game-assets/',
    });

    const response = await s3Client.send(command);
    
    // 객체 목록 가공 및 정렬 (최신 업로드 순)
    const contents = response.Contents || [];
    const assets = contents
      .filter(item => {
        // 폴더 그 자체 및 JSON 설정 파일은 에셋 라이브러리(이미지 목록)에서 제외
        return item.Key && !item.Key.endsWith('/') && !item.Key.endsWith('.json') && !item.Key.endsWith('stages.json');
      })
      .map(item => {
        const key = item.Key!;
        const name = key.replace('game-assets/', '');
        const url = `${CDN_URL}/${key}`;
        return {
          key,
          name,
          url,
          size: item.Size || 0,
          lastModified: item.LastModified || new Date(),
        };
      })
      .sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());

    return NextResponse.json({ success: true, assets });
  } catch (error: any) {
    console.error('S3 List Assets Error:', error);
    return NextResponse.json({ error: error.message || 'S3 에셋 목록을 가져오는데 실패했습니다.' }, { status: 500 });
  }
}

// DELETE: S3 에셋 삭제
export async function DELETE(req: Request) {
  try {
    const { client: s3Client, bucketName: BUCKET_NAME, isConfigured } = getS3Config();

    if (!isConfigured) {
      return NextResponse.json({ error: 'AWS S3 설정이 올바르지 않습니다.' }, { status: 500 });
    }

    const url = new URL(req.url);
    const key = url.searchParams.get('key');

    if (!key) {
      return NextResponse.json({ error: '삭제할 key 파라미터가 필요합니다.' }, { status: 400 });
    }

    // 보안을 위해 game-assets/로 시작하는 객체만 삭제 가능하도록 제한
    if (!key.startsWith('game-assets/')) {
      return NextResponse.json({ error: '삭제 권한이 없는 비정상적인 경로입니다.' }, { status: 400 });
    }

    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);

    return NextResponse.json({ success: true, message: '에셋이 성공적으로 삭제되었습니다.' });
  } catch (error: any) {
    console.error('S3 Delete Asset Error:', error);
    return NextResponse.json({ error: error.message || 'S3 에셋 삭제에 실패했습니다.' }, { status: 500 });
  }
}
