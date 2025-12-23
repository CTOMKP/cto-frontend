/**
 * Upload Mascot Images to S3
 * 
 * This script uploads all mascot images from public/mascots/ to S3 bucket ctom-bucket-backup
 * 
 * Usage:
 *   node scripts/upload-mascots-to-s3.js
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

// Load environment variables from .env files if they exist
try {
  // Try .env.upload first (for upload script), then .env.local
  require('dotenv').config({ path: path.join(__dirname, '../.env.upload') });
  require('dotenv').config({ path: path.join(__dirname, '../.env.local') });
} catch (e) {
  // dotenv not critical if .env files don't exist
}

// Configuration
const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || 'ctom-bucket-backup';
const REGION = process.env.AWS_REGION || 'eu-north-1';
const MASCOTS_DIR = path.join(__dirname, '../public/mascots');

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
  try {
    const fileContent = fs.readFileSync(localPath);
    const contentType = getMimeType(localPath);

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
      Body: fileContent,
      ContentType: contentType,
      // Note: ACL removed - bucket uses bucket policies for public access
      // The bucket should have a policy allowing public read access to mascots/*
    });

    await s3Client.send(command);
    console.log(`✅ Uploaded: ${s3Key}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to upload ${s3Key}:`, error.message);
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

  // Check if mascots directory exists
  if (!fs.existsSync(MASCOTS_DIR)) {
    console.error(`❌ Error: Mascots directory not found at ${MASCOTS_DIR}`);
    process.exit(1);
  }

  // Check AWS credentials
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
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
    const s3Key = `mascots/${relativePath.replace(/\\/g, '/')}`;

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
    console.log(`   https://d2cjbd1iqkwr9j.cloudfront.net/mascots/STAGE/STAGE.png`);
    console.log(`   https://d2cjbd1iqkwr9j.cloudfront.net/mascots/SKIN/BASE SKIN.png`);
    console.log(`   https://d2cjbd1iqkwr9j.cloudfront.net/mascots/TRAITS/...`);
  }
}

// Run the upload
uploadMascots().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
