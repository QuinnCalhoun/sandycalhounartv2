import { MongoClient } from 'mongodb'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
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
const CLOUDFRONT_DOMAIN = process.env.CLOUDFRONT_DOMAIN || ''
const MONGODB_URI = process.env.MONGODB_URI
const DRY_RUN = process.env.DRY_RUN === 'true' // Set to 'true' to test without making changes

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
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: 'max-age=31536000', // 1 year cache
    })

    if (!DRY_RUN) {
      await s3Client.send(command)
    }

    // Construct the URL
    const baseUrl = CLOUDFRONT_DOMAIN 
      ? `https://${CLOUDFRONT_DOMAIN}`
      : `https://${BUCKET_NAME}.s3.${process.env.AWS_S3_REGION || process.env.AWS_REGION || 'us-west-2'}.amazonaws.com`
    
    return `${baseUrl}/${key}`
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
 * Migrates a single image
 */
const migrateImage = async (artwork, index) => {
  const { imageUrl, title, _id } = artwork
  const slug = createSlug(title)
  const extension = path.extname(imageUrl) || '.jpg'
  const s3Key = `artwork/${slug}${extension}`
  
  console.log(`[${index + 1}] Processing: ${title}`)
  console.log(`    From: ${imageUrl}`)
  console.log(`    To: s3://${BUCKET_NAME}/${s3Key}`)

  try {
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
      oldUrl: imageUrl,
      newUrl,
      s3Key,
    }
  } catch (error) {
    console.error(`    ✗ Error: ${error.message}`)
    return {
      success: false,
      artworkId: _id,
      oldUrl: imageUrl,
      error: error.message,
    }
  }
}

/**
 * Main migration function
 */
const migrateImages = async () => {
  let client
  const results = {
    total: 0,
    successful: 0,
    failed: 0,
    details: [],
  }

  try {
    console.log('='.repeat(60))
    console.log('Image Migration Script')
    console.log('='.repeat(60))
    console.log(`Bucket: ${BUCKET_NAME}`)
    console.log(`Dry Run: ${DRY_RUN ? 'YES (no changes will be made)' : 'NO'}`)
    console.log('='.repeat(60))
    console.log()

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
      console.log('No artworks to migrate.')
      return results
    }

    // Migrate each image
    console.log('Starting migration...')
    console.log()

    for (let i = 0; i < artworks.length; i++) {
      const result = await migrateImage(artworks[i], i)
      results.details.push(result)

      if (result.success) {
        results.successful++
        
        // Update database with new URL (if not dry run)
        if (!DRY_RUN) {
          try {
            await collection.updateOne(
              { _id: result.artworkId },
              { $set: { imageUrl: result.newUrl } }
            )
            console.log(`    Database updated`)
          } catch (error) {
            console.error(`    ✗ Database update failed: ${error.message}`)
          }
        }

        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500))
      } else {
        results.failed++
      }

      console.log()
    }

    // Print summary
    console.log('='.repeat(60))
    console.log('Migration Summary')
    console.log('='.repeat(60))
    console.log(`Total: ${results.total}`)
    console.log(`Successful: ${results.successful}`)
    console.log(`Failed: ${results.failed}`)
    console.log('='.repeat(60))

    // Save detailed report
    const reportPath = path.join(__dirname, 'migration-report.json')
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2))
    console.log(`\nDetailed report saved to: ${reportPath}`)

    return results
  } catch (error) {
    console.error('Fatal error during migration:', error)
    throw error
  } finally {
    if (client) {
      await client.close()
      console.log('\nMongoDB connection closed')
    }
  }
}

// Run migration
migrateImages()
  .then(() => {
    console.log('\nMigration completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\nMigration failed:', error)
    process.exit(1)
  })

