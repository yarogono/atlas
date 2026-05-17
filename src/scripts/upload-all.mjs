import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

// Load environment variables from .env.local
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

const jobs = [
  {
    name: '2026-oil-support-guide.mdx',
    imagePath: 'C:\\Users\\dlaal\\.gemini\\antigravity\\brain\\7a12c47f-0ce5-40ad-ba0a-4447bb410f4a\\oil_support_korean_thumbnail_1779012112026.png',
    mdxPath: path.join(process.cwd(), 'src/content/posts/2026-oil-support-guide.mdx'),
    isOilPost: true,
  },
  {
    name: 'sample-post.mdx',
    imagePath: 'C:\\Users\\dlaal\\.gemini\\antigravity\\brain\\7a12c47f-0ce5-40ad-ba0a-4447bb410f4a\\subsidy24_korean_thumbnail_1779012134208.png',
    mdxPath: path.join(process.cwd(), 'src/content/posts/sample-post.mdx'),
  },
  {
    name: 'second-post.mdx',
    imagePath: 'C:\\Users\\dlaal\\.gemini\\antigravity\\brain\\7a12c47f-0ce5-40ad-ba0a-4447bb410f4a\\local_currency_korean_thumbnail_1779012153223.png',
    mdxPath: path.join(process.cwd(), 'src/content/posts/second-post.mdx'),
  },
  {
    name: 'third-post.mdx',
    imagePath: 'C:\\Users\\dlaal\\.gemini\\antigravity\\brain\\7a12c47f-0ce5-40ad-ba0a-4447bb410f4a\\small_business_korean_thumbnail_1779012171245.png',
    mdxPath: path.join(process.cwd(), 'src/content/posts/third-post.mdx'),
  }
];

async function run() {
  console.log('🚀 Starting Premium Korean Thumbnail S3 Upload & MDX Update...\n');

  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.error('❌ Error: AWS S3 credentials are not set in .env.local!');
    process.exit(1);
  }

  for (const job of jobs) {
    console.log(`--------------------------------------------------`);
    console.log(`Processing: ${job.name}`);
    
    if (!fs.existsSync(job.imagePath)) {
      console.error(`❌ Error: Local source image not found at ${job.imagePath}`);
      continue;
    }
    if (!fs.existsSync(job.mdxPath)) {
      console.error(`❌ Error: Target MDX file not found at ${job.mdxPath}`);
      continue;
    }

    try {
      // 1. Convert to WebP using sharp
      console.log(`Converting ${path.basename(job.imagePath)} to high-quality WebP...`);
      const webpBuffer = await sharp(job.imagePath)
        .webp({ quality: 80, effort: 6 })
        .toBuffer();

      // 2. Upload to S3
      const timestamp = Date.now();
      const baseName = path.basename(job.imagePath, path.extname(job.imagePath)).split('_')[0];
      const webpFileName = `${baseName}-${timestamp}.webp`;
      const s3Key = `blog-assets/${webpFileName}`;

      console.log(`Uploading ${webpFileName} to S3 bucket ${BUCKET_NAME}...`);
      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: s3Key,
        Body: webpBuffer,
        ContentType: 'image/webp',
        CacheControl: 'public, max-age=31536000, immutable',
      });

      await s3Client.send(command);
      const publicUrl = `${CDN_URL}/${s3Key}`;
      console.log(`✅ Upload successful! CDN URL: ${publicUrl}`);

      // 3. Update MDX Content
      console.log(`Updating frontmatter in ${job.name}...`);
      let mdxContent = fs.readFileSync(job.mdxPath, 'utf8');

      // Update coverImage in frontmatter
      mdxContent = mdxContent.replace(
        /(coverImage:\s*)(['"])[^\n]*?\2/,
        `$1$2${publicUrl}$2`
      );

      // Force hideCoverImage: true in frontmatter to hide at the very top of individual pages
      if (mdxContent.includes('hideCoverImage:')) {
        mdxContent = mdxContent.replace(
          /(hideCoverImage:\s*)(true|false)/,
          `$1true`
        );
      } else {
        // Insert right after coverImage
        mdxContent = mdxContent.replace(
          /(coverImage:\s*(['"])[^\n]*?\2)/,
          `$1\nhideCoverImage: true`
        );
      }

      if (job.isOilPost) {
        console.log(`Special updates for Oil Support Guide post...`);

        // Update S3_IMAGE_URL export
        mdxContent = mdxContent.replace(
          /(export\s+const\s+S3_IMAGE_URL\s*=\s*)(['"])[^\n]*?\2/,
          `$1$2${publicUrl}$2`
        );

        // Update the inline img tag in the body (matches both Unsplash and any previous S3 URLs for idempotency)
        mdxContent = mdxContent.replace(
          /(<img\s+src=)(['"])(https:\/\/images\.unsplash\.com\/photo-1604594849809-dfedbc827105[^\n]*?|https:\/\/[^\n]*?amazonaws\.com\/blog-assets\/[^\n]*?)\2/,
          `$1$2${publicUrl}$2`
        );
      }

      fs.writeFileSync(job.mdxPath, mdxContent, 'utf8');
      console.log(`✅ MDX file updated successfully!`);

    } catch (error) {
      console.error(`❌ Failed to process ${job.name}:`, error);
    }
  }

  console.log(`\n🎉 All jobs completed successfully!`);
}

run();
