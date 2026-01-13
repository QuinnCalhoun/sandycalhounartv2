import { MongoClient } from 'mongodb'
import { S3Client, PutObjectCommand, CreateBucketCommand, HeadBucketCommand } from '@aws-sdk/client-s3'
import axios from 'axios'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Initialize AWS S3 client
const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION || process.env.AWS_REGION || 'us-west-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
})

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME
const REGION = process.env.AWS_S3_REGION || process.env.AWS_REGION || 'us-west-2'
const CLOUDFRONT_DOMAIN = process.env.CLOUDFRONT_DOMAIN || ''
const MONGODB_URI = process.env.MONGODB_URI
const DRY_RUN = process.env.DRY_RUN === 'true'

if (!BUCKET_NAME) {
  console.error('ERROR: AWS_S3_BUCKET_NAME environment variable is required')
  process.exit(1)
}

if (!MONGODB_URI) {
  console.error('ERROR: MONGODB_URI environment variable is required')
  process.exit(1)
}

/**
 * Creates a URL-friendly slug from a title
 */
const createSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Checks if bucket exists
 */
const bucketExists = async (bucketName) => {
  try {
    await s3Client.send(new HeadBucketCommand({ Bucket: bucketName }))
    return true
  } catch (error) {
    if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
      return false
    }
    throw error
  }
}

/**
 * Creates S3 bucket if it doesn't exist
 */
const createBucketIfNeeded = async () => {
  console.log(`Checking if bucket '${BUCKET_NAME}' exists...`)
  
  const exists = await bucketExists(BUCKET_NAME)
  
  if (exists) {
    console.log(`✓ Bucket '${BUCKET_NAME}' already exists`)
    return
  }

  console.log(`Bucket '${BUCKET_NAME}' does not exist. Creating...`)
  
  if (DRY_RUN) {
    console.log(`[DRY RUN] Would create bucket: ${BUCKET_NAME}`)
    return
  }

  try {
    const command = new CreateBucketCommand({
      Bucket: BUCKET_NAME,
      CreateBucketConfiguration: {
        LocationConstraint: REGION === 'us-east-1' ? undefined : REGION,
      },
    })

    await s3Client.send(command)
    console.log(`✓ Bucket '${BUCKET_NAME}' created successfully`)
    
    // Note: In production, you'd want to configure bucket policies, CORS, etc.
    // This script just creates the bucket. Configure permissions separately.
    console.log(`⚠️  Remember to configure bucket permissions and CORS if needed`)
  } catch (error) {
    if (error.name === 'BucketAlreadyOwnedByYou') {
      console.log(`✓ Bucket '${BUCKET_NAME}' already exists (owned by you)`)
    } else {
      throw new Error(`Failed to create bucket: ${error.message}`)
    }
  }
}

/**
 * Downloads an image from a URL
 */
const downloadImage = async (url) => {
  try {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'arraybuffer',
      timeout: 30000, // 30 second timeout
    })
    return Buffer.from(response.data)
  } catch (error) {
    throw new Error(`Failed to download image from ${url}: ${error.message}`)
  }
}

/**
 * Uploads an image to S3
 */
const uploadToS3 = async (buffer, key, contentType) => {
  // Construct the URL (we'll return this even in dry run)
  const baseUrl = CLOUDFRONT_DOMAIN 
    ? `https://${CLOUDFRONT_DOMAIN}`
    : `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com`
  
  const newUrl = `${baseUrl}/${key}`

  if (DRY_RUN) {
    // In dry run, just return the URL that would be used
    // Don't actually upload
    return newUrl
  }

  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: 'max-age=31536000', // 1 year cache
    })

    await s3Client.send(command)
    return newUrl
  } catch (error) {
    throw new Error(`Failed to upload to S3: ${error.message}`)
  }
}

/**
 * Gets content type from file extension
 */
const getContentType = (url) => {
  const ext = path.extname(url).toLowerCase()
  const contentTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
  }
  return contentTypes[ext] || 'image/jpeg'
}

/**
 * Uploads a single image to S3
 */
const uploadImage = async (artwork, index) => {
  const { imageUrl, title, _id } = artwork
  const slug = createSlug(title)
  const extension = path.extname(imageUrl) || '.jpg'
  const s3Key = `artwork/${slug}${extension}`
  
  console.log(`[${index + 1}] Processing: ${title}`)
  console.log(`    From: ${imageUrl}`)
  console.log(`    To: s3://${BUCKET_NAME}/${s3Key}`)

  try {
    if (DRY_RUN) {
      // In dry run, simulate the process without actually doing it
      console.log(`    [DRY RUN] Would download image...`)
      console.log(`    [DRY RUN] Would upload to S3...`)
      
      // Construct the URL that would be used
      const baseUrl = CLOUDFRONT_DOMAIN 
        ? `https://${CLOUDFRONT_DOMAIN}`
        : `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com`
      const newUrl = `${baseUrl}/${s3Key}`
      
      console.log(`    [DRY RUN] Would result in: ${newUrl}`)
      
      return {
        success: true,
        artworkId: _id,
        title,
        oldUrl: imageUrl,
        newUrl,
        s3Key,
      }
    }

    // Actual upload process
    // Download image
    console.log(`    Downloading...`)
    const imageBuffer = await downloadImage(imageUrl)

    // Upload to S3
    console.log(`    Uploading to S3...`)
    const contentType = getContentType(imageUrl)
    const newUrl = await uploadToS3(imageBuffer, s3Key, contentType)

    console.log(`    ✓ Success: ${newUrl}`)
    return {
      success: true,
      artworkId: _id,
      title,
      oldUrl: imageUrl,
      newUrl,
      s3Key,
    }
  } catch (error) {
    console.error(`    ✗ Error: ${error.message}`)
    return {
      success: false,
      artworkId: _id,
      title,
      oldUrl: imageUrl,
      error: error.message,
    }
  }
}

/**
 * Main upload function
 */
const uploadImagesToS3 = async () => {
  let client
  const results = {
    total: 0,
    successful: 0,
    failed: 0,
    details: [],
  }

  try {
    console.log('='.repeat(60))
    console.log('Image Upload to S3')
    console.log('='.repeat(60))
    console.log(`Bucket: ${BUCKET_NAME}`)
    console.log(`Region: ${REGION}`)
    console.log(`Dry Run: ${DRY_RUN ? 'YES (no changes will be made)' : 'NO'}`)
    console.log('='.repeat(60))
    console.log()

    // Create bucket if needed (skip in dry run)
    if (!DRY_RUN) {
      await createBucketIfNeeded()
      console.log()
    } else {
      console.log(`[DRY RUN] Skipping bucket creation check`)
      console.log()
    }

    // Connect to MongoDB
    console.log('Connecting to MongoDB...')
    client = new MongoClient(MONGODB_URI)
    await client.connect()
    console.log('Connected to MongoDB')
    console.log()

    const db = client.db('sandycalhounv2')
    const collection = db.collection('arts')

    // Get all artworks
    console.log('Fetching artworks from database...')
    const artworks = await collection.find({}).toArray()
    results.total = artworks.length
    console.log(`Found ${artworks.length} artworks`)
    console.log()

    if (artworks.length === 0) {
      console.log('No artworks to upload.')
      return results
    }

    // Upload each image
    console.log('Starting upload...')
    console.log()

    for (let i = 0; i < artworks.length; i++) {
      const result = await uploadImage(artworks[i], i)
      results.details.push(result)

      if (result.success) {
        results.successful++
      } else {
        results.failed++
      }

      console.log()

      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    // Print summary
    console.log('='.repeat(60))
    console.log('Upload Summary')
    console.log('='.repeat(60))
    console.log(`Total: ${results.total}`)
    console.log(`Successful: ${results.successful}`)
    console.log(`Failed: ${results.failed}`)
    console.log('='.repeat(60))

    // Save detailed report
    const reportPath = path.join(__dirname, 'upload-report.json')
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2))
    console.log(`\nDetailed report saved to: ${reportPath}`)
    console.log('\nNext step: Run updateDatabaseUrls.mjs to update database with new URLs')

    return results
  } catch (error) {
    console.error('Fatal error during upload:', error)
    throw error
  } finally {
    if (client) {
      await client.close()
      console.log('\nMongoDB connection closed')
    }
  }
}

// Run upload
uploadImagesToS3()
  .then(() => {
    console.log('\nUpload completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\nUpload failed:', error)
    process.exit(1)
  })

