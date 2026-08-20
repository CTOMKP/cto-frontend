/**
 * Upload Mascot Images to S3
 * 
 * Upload a validated, versioned collection of finished mascot PFPs to S3.
 * 
 * Usage:
 *   node scripts/upload-mascots-to-s3.js --source ../output --prefix mascots/v2/full --expected-count 146
 * 
 * Required Environment Variables:
 *   AWS_ACCESS_KEY_ID
 *   AWS_SECRET_ACCESS_KEY
 *   AWS_REGION (defaults to eu-north-1)
 *   AWS_S3_BUCKET_NAME (defaults to ctom-bucket-backup)
 */

const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

function getArgument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

const requestedEnvironmentFile = getArgument('--env-file');

// Load environment variables from .env files if they exist
try {
  if (requestedEnvironmentFile) {
    require('dotenv').config({ path: path.resolve(requestedEnvironmentFile) });
  }
  // Try .env.upload first (for upload script), then .env.local
  require('dotenv').config({ path: path.join(__dirname, '../.env.upload') });
  require('dotenv').config({ path: path.join(__dirname, '../.env.local') });
} catch (e) {
  // dotenv not critical if .env files don't exist
}

// Configuration
const BUCKET_NAME =
  getArgument('--bucket') ||
  process.env.AWS_S3_BUCKET_NAME ||
  'ctom-bucket-backup';
const REGION =
  getArgument('--region') || process.env.AWS_REGION || 'eu-north-1';
const MASCOTS_DIR = path.resolve(
  getArgument('--source') || path.join(__dirname, '../public/mascots'),
);
const S3_PREFIX = String(
  getArgument('--prefix') || 'mascots/v2/full',
).replace(/^\/+|\/+$/g, '');
const EXPECTED_COUNT = Number(getArgument('--expected-count') || 146);
const DRY_RUN = process.argv.includes('--dry-run');

// Initialize S3 client
const s3Client = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Get MIME type from file extension
function getMimeType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
  };
  return mimeTypes[ext] || 'image/png';
}

// Upload a single file to S3
async function uploadFile(localPath, s3Key) {
  if (DRY_RUN) {
    console.log(`[dry-run] ${s3Key}`);
    return true;
  }
  try {
    const fileContent = fs.readFileSync(localPath);
    const contentType = getMimeType(localPath);

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
      Body: fileContent,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000, immutable',
      // Note: ACL removed - bucket uses bucket policies for public access
      // The bucket should have a policy allowing public read access to mascots/*
    });

    await s3Client.send(command);
    console.log(`✅ Uploaded: ${s3Key}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to upload ${s3Key}:`, error.message);
    if (
      [
        'InvalidAccessKeyId',
        'SignatureDoesNotMatch',
        'ExpiredToken',
        'CredentialsProviderError',
      ].includes(error.name)
    ) {
      throw error;
    }
    return false;
  }
}

// Recursively get all files in a directory
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
    } else {
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
}

// Main upload function
async function uploadMascots() {
  console.log('🚀 Starting mascot images upload to S3...\n');
  console.log(`📦 Bucket: ${BUCKET_NAME}`);
  console.log(`🌍 Region: ${REGION}`);
  console.log(`📁 Source: ${MASCOTS_DIR}\n`);
  console.log(`🗂️  Prefix: ${S3_PREFIX}`);
  console.log(`🧪 Mode: ${DRY_RUN ? 'validation only' : 'upload'}\n`);

  // Check if mascots directory exists
  if (!fs.existsSync(MASCOTS_DIR)) {
    console.error(`❌ Error: Mascots directory not found at ${MASCOTS_DIR}`);
    process.exit(1);
  }

  // Check AWS credentials
  if (!DRY_RUN && (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY)) {
    console.error('❌ Error: AWS credentials not found!');
    console.error('   Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables');
    process.exit(1);
  }

  // Get all image files
  const allFiles = getAllFiles(MASCOTS_DIR);
  const imageFiles = allFiles.filter((file) => {
    const ext = path.extname(file).toLowerCase();
    return ['.png', '.jpg', '.jpeg', '.gif', '.webp'].includes(ext);
  });
  imageFiles.sort((left, right) => left.localeCompare(right));

  if (imageFiles.length !== EXPECTED_COUNT) {
    console.error(`❌ Expected ${EXPECTED_COUNT} images but found ${imageFiles.length}`);
    process.exit(1);
  }

  const invalidNames = imageFiles.filter(
    (file) => !/^\d{5}\.png$/i.test(path.basename(file)),
  );
  if (invalidNames.length > 0) {
    console.error('❌ Every v2 PFP must use a five-digit PNG filename');
    invalidNames.forEach((file) => console.error(`   ${path.basename(file)}`));
    process.exit(1);
  }

  if (imageFiles.length === 0) {
    console.error('❌ No image files found in mascots directory');
    process.exit(1);
  }

  console.log(`📸 Found ${imageFiles.length} image files to upload\n`);

  // Upload each file
  let successCount = 0;
  let failCount = 0;

  for (const localPath of imageFiles) {
    // Calculate S3 key (relative path from mascots directory)
    const relativePath = path.relative(MASCOTS_DIR, localPath);
    // Normalize path separators for S3 (use forward slashes)
    const s3Key = `${S3_PREFIX}/${relativePath.replace(/\\/g, '/')}`;

    const success = await uploadFile(localPath, s3Key);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Upload Summary:');
  console.log(`   ✅ Successful: ${successCount}`);
  console.log(`   ❌ Failed: ${failCount}`);
  console.log(`   📦 Total: ${imageFiles.length}`);
  console.log('='.repeat(50));

  if (failCount > 0) {
    console.error('\n⚠️  Some uploads failed. Please check the errors above.');
    process.exit(1);
  } else {
    console.log('\n🎉 All mascot images uploaded successfully!');
    console.log(`\n🔗 CloudFront URLs will be available at:`);
    console.log(`   https://d2cjbd1iqkwr9j.cloudfront.net/${S3_PREFIX}/00001.png`);
  }
}

// Run the upload
uploadMascots().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
