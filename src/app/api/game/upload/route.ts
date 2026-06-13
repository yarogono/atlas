import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// S3 Client 초기화 (AWS credentials 활용)
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;
const CDN_URL = process.env.NEXT_PUBLIC_CDN_URL || `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com`;

export async function POST(req: Request) {
  try {
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
