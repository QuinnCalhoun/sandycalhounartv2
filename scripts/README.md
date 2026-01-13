# Image Migration Script

This script migrates images from imgbb.co to AWS S3 and updates the database with new URLs.

## Prerequisites

1. **AWS S3 Bucket**: 
   - The script will **automatically create the bucket** if it doesn't exist
   - Recommended name: `sandycalhoun-art-images`
   - Region: Same as your other AWS resources (e.g., `us-west-2`)
   - **AWS credentials need `s3:CreateBucket` permission** (or create bucket manually)
   - After creation, configure bucket for public read access (or use CloudFront)

2. **AWS Credentials**: Ensure your `.env` file has:
   ```
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_REGION=us-west-2
   AWS_S3_BUCKET_NAME=sandycalhoun-art-images
   AWS_S3_REGION=us-west-2
   ```

3. **CloudFront (Optional but Recommended)**:
   - Create a CloudFront distribution pointing to your S3 bucket
   - Add to `.env`: `CLOUDFRONT_DOMAIN=your-cloudfront-domain.cloudfront.net`
   - Or use custom domain: `CLOUDFRONT_DOMAIN=images.sandycalhoun.com`

4. **MongoDB Connection**: Ensure `MONGODB_URI` is set in `.env`

## AWS S3 Setup Steps

### 1. Create S3 Bucket

1. Go to AWS S3 Console
2. Click "Create bucket"
3. Bucket name: `sandycalhoun-art-images` (or your preferred name)
4. Region: Choose same as your other AWS resources
5. Uncheck "Block all public access" (or configure bucket policy for public read)
6. Create bucket

### 2. Configure Bucket Policy (for public read access)

If not using CloudFront, add this bucket policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::sandycalhoun-art-images/*"
    }
  ]
}
```

### 3. Set up CloudFront (Recommended)

1. Go to CloudFront Console
2. Create distribution
3. Origin: Select your S3 bucket
4. Viewer protocol policy: Redirect HTTP to HTTPS
5. Default cache behavior: Optimize caching
6. Create distribution
7. Note the distribution domain name

### 4. Configure CORS (if needed)

If accessing images from web, add CORS configuration to S3 bucket:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": []
  }
]
```

## Running the Migration

The migration is split into two steps for safety:

### Step 1: Upload Images to S3

**Dry Run (Test without making changes):**
```bash
npm run upload:images:dry-run
```

**Full Upload:**
```bash
npm run upload:images
```

This will:
- **Create S3 bucket if it doesn't exist** (automatically)
- Download images from imgbb.co
- Upload to S3
- **NOT** update the database
- Generate `upload-report.json` with results

### Step 2: Update Database URLs

**Dry Run (Test without making changes):**
```bash
npm run update:urls:dry-run
```

**Full Update:**
```bash
npm run update:urls
```

This will:
- Read `upload-report.json` from Step 1
- Update database with new S3 URLs
- Only update artworks that were successfully uploaded
- Generate `update-report.json` with results

### Run Both Steps Together

**Dry Run:**
```bash
npm run migrate:images:dry-run
```

**Full Migration:**
```bash
npm run migrate:images
```

This runs both steps sequentially.

## Migration Report

After running, check `scripts/migration-report.json` for:
- Total images processed
- Success/failure count
- Detailed results for each image
- Any errors encountered

## Rollback

If something goes wrong:
1. Check the migration report
2. Restore database from backup
3. Or manually update image URLs back to imgbb.co URLs

## Image Organization

Images are stored in S3 with this structure:
```
artwork/
  ├── it-must-be-monday.jpg
  ├── mama-sputnik.jpg
  └── ...
```

URLs will be:
- **With CloudFront**: `https://your-cloudfront-domain.cloudfront.net/artwork/image-name.jpg`
- **Without CloudFront**: `https://bucket-name.s3.region.amazonaws.com/artwork/image-name.jpg`

## Troubleshooting

### "InvalidClientTokenId" error
- Check AWS credentials in `.env`
- Verify IAM user has S3 permissions

### "Access Denied" error
- Check bucket policy allows public read
- Verify IAM user has `s3:PutObject` permission
- If bucket creation fails, verify IAM user has `s3:CreateBucket` permission
- Or create the bucket manually in AWS Console first

### Images not loading after migration
- Check S3 bucket public access settings
- Verify CloudFront distribution is active
- Check CORS configuration

### Migration fails partway through
- Check migration report for failed images
- Re-run migration (it will skip already migrated images if you update the script)
- Or manually fix failed images

