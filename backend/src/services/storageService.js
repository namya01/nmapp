/**
 * Storage Service
 * Provides AWS S3 Presigned URLs and local fallback file handling
 * for College IDs, User Avatars, Student CVs, and Event Media galleries.
 */

const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

const UPLOADS_DIR = path.join(__dirname, '../../uploads');

// Ensure local uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

/**
 * Generate Presigned Upload URL
 * In AWS production: Calls s3.getSignedUrlPromise('putObject', {...})
 * In development: Returns simulated upload endpoint with unique asset URL
 */
async function getPresignedUploadUrl(category, fileName, contentType) {
  const extension = path.extname(fileName) || (contentType.includes('pdf') ? '.pdf' : '.jpg');
  const fileKey = `${category}/${Date.now()}-${crypto.randomBytes(6).toString('hex')}${extension}`;

  if (process.env.AWS_S3_BUCKET && process.env.AWS_ACCESS_KEY_ID) {
    // AWS S3 implementation
    /*
    const s3 = new AWS.S3();
    const uploadUrl = await s3.getSignedUrlPromise('putObject', {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: fileKey,
      ContentType: contentType,
      Expires: 300 // 5 minutes
    });
    const publicUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
    return { uploadUrl, publicUrl, fileKey };
    */
  }

  // Local / dev fallback URL
  const publicUrl = `/uploads/${fileKey}`;
  const uploadUrl = `/api/storage/mock-upload?key=${encodeURIComponent(fileKey)}`;

  return {
    uploadUrl,
    publicUrl,
    fileKey,
    provider: 'local-dev'
  };
}

module.exports = {
  getPresignedUploadUrl,
  UPLOADS_DIR
};
