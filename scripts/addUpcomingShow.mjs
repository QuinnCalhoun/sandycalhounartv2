import { MongoClient, ObjectId } from 'mongodb'
import { S3Client, PutObjectCommand, HeadBucketCommand } from '@aws-sdk/client-s3'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import readline from 'readline'

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
 * Gets content type from file extension
 */
const getContentType = (filePath) => {
  const ext = path.extname(filePath).toLowerCase()
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
 * Uploads an image file to S3
 */
const uploadImageToS3 = async (filePath) => {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`)
  }

  const fileName = path.basename(filePath)
  const extension = path.extname(fileName)
  const slug = createSlug(path.basename(fileName, extension))
  const s3Key = `shows/${slug}${extension}`
  
  const baseUrl = CLOUDFRONT_DOMAIN 
    ? `https://${CLOUDFRONT_DOMAIN}`
    : `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com`
  
  const newUrl = `${baseUrl}/${s3Key}`

  if (DRY_RUN) {
    console.log(`[DRY RUN] Would upload: ${filePath}`)
    console.log(`[DRY RUN] Would save to: s3://${BUCKET_NAME}/${s3Key}`)
    console.log(`[DRY RUN] Would result in URL: ${newUrl}`)
    return newUrl
  }

  try {
    const fileBuffer = fs.readFileSync(filePath)
    const contentType = getContentType(filePath)

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
      Body: fileBuffer,
      ContentType: contentType,
      CacheControl: 'max-age=31536000', // 1 year cache
    })

    await s3Client.send(command)
    console.log(`✓ Image uploaded to S3: ${newUrl}`)
    return newUrl
  } catch (error) {
    throw new Error(`Failed to upload to S3: ${error.message}`)
  }
}

/**
 * Parses a date string (YYYY-MM-DD or MM/DD/YYYY)
 */
const parseDate = (dateString) => {
  if (!dateString) return null
  
  // Try ISO format first (YYYY-MM-DD)
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return new Date(dateString + 'T00:00:00')
  }
  
  // Try MM/DD/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
    const [month, day, year] = dateString.split('/')
    return new Date(year, month - 1, day)
  }
  
  // Try Date.parse
  const date = new Date(dateString)
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date format: ${dateString}. Use YYYY-MM-DD or MM/DD/YYYY`)
  }
  
  return date
}

/**
 * Validates show data
 */
const validateShowData = (showData) => {
  const errors = []
  
  if (!showData.title || showData.title.trim() === '') {
    errors.push('Title is required')
  }
  
  if (!showData.location || showData.location.trim() === '') {
    errors.push('Location is required')
  }
  
  if (!showData.startDate) {
    errors.push('Start date is required')
  } else {
    const startDate = parseDate(showData.startDate)
    if (isNaN(startDate.getTime())) {
      errors.push('Invalid start date format')
    }
  }
  
  if (!showData.endDate) {
    errors.push('End date is required')
  } else {
    const endDate = parseDate(showData.endDate)
    if (isNaN(endDate.getTime())) {
      errors.push('Invalid end date format')
    } else if (showData.startDate) {
      const startDate = parseDate(showData.startDate)
      if (endDate < startDate) {
        errors.push('End date must be after start date')
      }
    }
  }
  
  if (showData.imagePath && !fs.existsSync(showData.imagePath)) {
    errors.push(`Image file not found: ${showData.imagePath}`)
  }
  
  return errors
}

/**
 * Creates show document for MongoDB
 */
const createShowDocument = (showData, imageUrl) => {
  const startDate = parseDate(showData.startDate)
  const endDate = parseDate(showData.endDate)
  
  const document = {
    title: showData.title.trim(),
    location: showData.location.trim(),
    startDate,
    endDate,
    isUpcoming: true,
  }
  
  if (imageUrl) {
    document.imageUrl = imageUrl
  }
  
  if (showData.description && showData.description.trim() !== '') {
    document.description = showData.description.trim()
  }
  
  if (showData.address && showData.address.trim() !== '') {
    document.address = showData.address.trim()
  }
  
  if (showData.mapLink && showData.mapLink.trim() !== '') {
    document.mapLink = showData.mapLink.trim()
  }
  
  return document
}

/**
 * Adds show to MongoDB
 */
const addShowToDatabase = async (client, showDocument) => {
  if (DRY_RUN) {
    console.log('\n[DRY RUN] Would insert show document:')
    console.log(JSON.stringify(showDocument, null, 2))
    return { insertedId: 'DRY_RUN_ID' }
  }
  
  const db = client.db('sandycalhounv2')
  const collection = db.collection('shows')
  
  const result = await collection.insertOne(showDocument)
  console.log(`✓ Show added to database with ID: ${result.insertedId}`)
  return result
}

/**
 * Prompts user for input
 */
const prompt = (rl, question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim())
    })
  })
}

/**
 * Interactive mode - prompts for all fields
 */
const interactiveMode = async () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })
  
  const showData = {}
  
  console.log('\n=== Add Upcoming Show ===\n')
  
  showData.title = await prompt(rl, 'Show Title (required): ')
  showData.location = await prompt(rl, 'Location (required): ')
  showData.startDate = await prompt(rl, 'Start Date (YYYY-MM-DD or MM/DD/YYYY, required): ')
  showData.endDate = await prompt(rl, 'End Date (YYYY-MM-DD or MM/DD/YYYY, required): ')
  showData.imagePath = await prompt(rl, 'Image file path (optional, press Enter to skip): ')
  showData.description = await prompt(rl, 'Description (optional, press Enter to skip): ')
  showData.address = await prompt(rl, 'Address (optional, press Enter to skip): ')
  showData.mapLink = await prompt(rl, 'Map link (Google Maps/Apple Maps URL, optional, press Enter to skip): ')
  
  rl.close()
  
  return showData
}

/**
 * Parses command-line arguments
 */
const parseArgs = () => {
  const args = process.argv.slice(2)
  const showData = {}
  
  for (let i = 0; i < args.length; i += 2) {
    const flag = args[i]
    const value = args[i + 1]
    
    switch (flag) {
      case '--title':
      case '-t':
        showData.title = value
        break
      case '--location':
      case '-l':
        showData.location = value
        break
      case '--start-date':
      case '-s':
        showData.startDate = value
        break
      case '--end-date':
      case '-e':
        showData.endDate = value
        break
      case '--image':
      case '-i':
        showData.imagePath = value
        break
      case '--description':
      case '-d':
        showData.description = value
        break
      case '--address':
      case '-a':
        showData.address = value
        break
      case '--map-link':
      case '-m':
        showData.mapLink = value
        break
      default:
        if (flag && !flag.startsWith('-')) {
          console.warn(`Unknown argument: ${flag}`)
        }
    }
  }
  
  return showData
}

/**
 * Main function
 */
const addUpcomingShow = async () => {
  let client
  
  try {
    console.log('='.repeat(60))
    console.log('Add Upcoming Show')
    console.log('='.repeat(60))
    console.log(`Bucket: ${BUCKET_NAME}`)
    console.log(`Region: ${REGION}`)
    console.log(`Dry Run: ${DRY_RUN ? 'YES (no changes will be made)' : 'NO'}`)
    console.log('='.repeat(60))
    console.log()
    
    // Get show data from command line or interactive mode
    let showData
    const args = parseArgs()
    
    if (Object.keys(args).length === 0) {
      // No arguments provided, use interactive mode
      showData = await interactiveMode()
    } else {
      showData = args
    }
    
    // Validate show data
    console.log('\nValidating show data...')
    const errors = validateShowData(showData)
    if (errors.length > 0) {
      console.error('\n✗ Validation errors:')
      errors.forEach(error => console.error(`  - ${error}`))
      process.exit(1)
    }
    console.log('✓ Validation passed')
    
    // Upload image if provided
    let imageUrl = null
    if (showData.imagePath) {
      console.log('\nUploading image to S3...')
      imageUrl = await uploadImageToS3(showData.imagePath)
    }
    
    // Connect to MongoDB
    console.log('\nConnecting to MongoDB...')
    client = new MongoClient(MONGODB_URI)
    await client.connect()
    console.log('✓ Connected to MongoDB')
    
    // Create show document
    const showDocument = createShowDocument(showData, imageUrl)
    
    // Add to database
    console.log('\nAdding show to database...')
    const result = await addShowToDatabase(client, showDocument)
    
    // Summary
    console.log('\n' + '='.repeat(60))
    console.log('Summary')
    console.log('='.repeat(60))
    console.log(`Title: ${showDocument.title}`)
    console.log(`Location: ${showDocument.location}`)
    console.log(`Start Date: ${showDocument.startDate.toLocaleDateString()}`)
    console.log(`End Date: ${showDocument.endDate.toLocaleDateString()}`)
    if (imageUrl) {
      console.log(`Image: ${imageUrl}`)
    }
    if (showDocument.description) {
      console.log(`Description: ${showDocument.description.substring(0, 50)}...`)
    }
    if (!DRY_RUN) {
      console.log(`Database ID: ${result.insertedId}`)
    }
    console.log('='.repeat(60))
    console.log('\n✓ Show added successfully!')
    
  } catch (error) {
    console.error('\n✗ Error:', error.message)
    process.exit(1)
  } finally {
    if (client) {
      await client.close()
      console.log('\nMongoDB connection closed')
    }
  }
}

// Run script
addUpcomingShow()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error('\nFatal error:', error)
    process.exit(1)
  })
