import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

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

export async function POST(req: Request) {
  try {
    const { client: s3Client, bucketName: BUCKET_NAME, cdnUrl: CDN_URL, isConfigured } = getS3Config();

    if (!isConfigured) {
      return NextResponse.json({ error: 'AWS S3 설정이 올바르지 않습니다. 환경 변수를 확인하세요.' }, { status: 500 });
    }

    // 폼 데이터 수신
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const stageId = formData.get('stageId') as string;
    const imageType = formData.get('imageType') as string; // 'a' (원본) 또는 'b' (수정본)

    if (!file) {
      return NextResponse.json({ error: '파일이 업로드되지 않았습니다.' }, { status: 400 });
    }
    if (!stageId || !imageType) {
      return NextResponse.json({ error: '필수 필드(stageId, imageType)가 누락되었습니다.' }, { status: 400 });
    }

    // 파일을 버퍼로 변환
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 고유 파일 이름 생성 (stageX_a_timestamp.png)
    const ext = file.name.split('.').pop() || 'png';
    const s3Key = `game-assets/stage${stageId}_${imageType}_${Date.now()}.${ext}`;

    // S3 업로드 명령 구성
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
      Body: buffer,
      ContentType: file.type || 'image/png',
      CacheControl: 'public, max-age=31536000, immutable',
    });

    // S3 전송
    await s3Client.send(command);

    // CDN 또는 퍼블릭 URL 생성
    const publicUrl = `${CDN_URL}/${s3Key}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      s3Key: s3Key
    });
  } catch (error: any) {
    console.error('S3 Upload Route Error:', error);
    return NextResponse.json({ error: error.message || 'S3 업로드 중 에러가 발생했습니다.' }, { status: 500 });
  }
}
