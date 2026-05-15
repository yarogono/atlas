import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;
const CDN_URL = process.env.NEXT_PUBLIC_CDN_URL || `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com`;

async function processAndUploadImage(inputFilePath) {
  try {
    const fileName = path.basename(inputFilePath, path.extname(inputFilePath));
    const webpFileName = `${fileName}-${Date.now()}.webp`;
    const s3Key = `blog-assets/${webpFileName}`;

    console.log(`Converting ${inputFilePath} to WebP...`);
    
    // 1. Convert to WebP using sharp
    const webpBuffer = await sharp(inputFilePath)
      .webp({ quality: 80, effort: 6 }) // Highly compressed WebP
      .toBuffer();

    console.log(`Uploading ${webpFileName} to S3 bucket ${BUCKET_NAME}...`);
    
    // 2. Upload to S3
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
      Body: webpBuffer,
      ContentType: 'image/webp',
      CacheControl: 'public, max-age=31536000, immutable',
    });

    await s3Client.send(command);

    const publicUrl = `${CDN_URL}/${s3Key}`;
    console.log('✅ Upload successful!');
    console.log(`Image CDN URL: ${publicUrl}`);
    
    return publicUrl;
  } catch (error) {
    console.error('❌ Error processing/uploading image:', error);
  }
}

// Example usage: node src/scripts/upload-to-s3.mjs ./input/ai-generated-image.png
const [, , inputPath] = process.argv;
if (inputPath) {
  processAndUploadImage(inputPath);
} else {
  console.log('Please provide an image path: node src/scripts/upload-to-s3.mjs <path-to-image>');
}
