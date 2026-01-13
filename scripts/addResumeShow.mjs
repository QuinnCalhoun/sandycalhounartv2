import { MongoClient } from 'mongodb'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import readline from 'readline'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const MONGODB_URI = process.env.MONGODB_URI
const DRY_RUN = process.env.DRY_RUN === 'true'

if (!MONGODB_URI) {
  console.error('ERROR: MONGODB_URI environment variable is required')
  process.exit(1)
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
  
  if (!showData.year) {
    errors.push('Year is required')
  } else {
    const year = parseInt(showData.year, 10)
    if (isNaN(year) || year < 1900 || year > 2100) {
      errors.push('Year must be a valid number between 1900 and 2100')
    }
  }
  
  if (showData.soloShow !== undefined && showData.soloShow !== 'true' && showData.soloShow !== 'false' && showData.soloShow !== '') {
    errors.push('soloShow must be "true" or "false" (or empty for false)')
  }
  
  return errors
}

/**
 * Parses awards string (comma-separated) into array
 */
const parseAwards = (awardsString) => {
  if (!awardsString || awardsString.trim() === '') {
    return []
  }
  return awardsString.split(',').map(award => award.trim()).filter(award => award !== '')
}

/**
 * Creates show document for MongoDB
 */
const createShowDocument = (showData) => {
  const document = {
    title: showData.title.trim(),
    location: showData.location.trim(),
    year: parseInt(showData.year, 10),
  }
  
  // Handle soloShow - default to false if not provided
  if (showData.soloShow === 'true' || showData.soloShow === true) {
    document.soloShow = true
  } else if (showData.soloShow === 'false' || showData.soloShow === false) {
    document.soloShow = false
  }
  // If not provided, don't set it (will be undefined, treated as group show)
  
  if (showData.juror && showData.juror.trim() !== '') {
    document.juror = showData.juror.trim()
  }
  
  const awards = parseAwards(showData.awards)
  if (awards.length > 0) {
    document.awards = awards
  }
  
  // Explicitly set isUpcoming to false (or don't set it) for resume shows
  // This ensures they don't appear in the upcoming shows list
  document.isUpcoming = false
  
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
  
  console.log('\n=== Add Resume Show ===\n')
  
  showData.title = await prompt(rl, 'Show Title (required): ')
  showData.location = await prompt(rl, 'Location (required): ')
  showData.year = await prompt(rl, 'Year (required, e.g., 2024): ')
  showData.soloShow = await prompt(rl, 'Is this a solo show? (true/false, press Enter for false): ')
  showData.juror = await prompt(rl, 'Juror name (optional, press Enter to skip): ')
  showData.awards = await prompt(rl, 'Awards (comma-separated, optional, press Enter to skip): ')
  
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
      case '--year':
      case '-y':
        showData.year = value
        break
      case '--solo':
      case '-s':
        showData.soloShow = value
        break
      case '--juror':
      case '-j':
        showData.juror = value
        break
      case '--awards':
      case '-a':
        showData.awards = value
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
const addResumeShow = async () => {
  let client
  
  try {
    console.log('='.repeat(60))
    console.log('Add Resume Show')
    console.log('='.repeat(60))
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
    
    // Connect to MongoDB
    console.log('\nConnecting to MongoDB...')
    client = new MongoClient(MONGODB_URI)
    await client.connect()
    console.log('✓ Connected to MongoDB')
    
    // Create show document
    const showDocument = createShowDocument(showData)
    
    // Add to database
    console.log('\nAdding show to database...')
    const result = await addShowToDatabase(client, showDocument)
    
    // Summary
    console.log('\n' + '='.repeat(60))
    console.log('Summary')
    console.log('='.repeat(60))
    console.log(`Title: ${showDocument.title}`)
    console.log(`Location: ${showDocument.location}`)
    console.log(`Year: ${showDocument.year}`)
    console.log(`Solo Show: ${showDocument.soloShow ? 'Yes' : 'No'}`)
    if (showDocument.juror) {
      console.log(`Juror: ${showDocument.juror}`)
    }
    if (showDocument.awards && showDocument.awards.length > 0) {
      console.log(`Awards: ${showDocument.awards.join(', ')}`)
    }
    if (!DRY_RUN) {
      console.log(`Database ID: ${result.insertedId}`)
    }
    console.log('='.repeat(60))
    console.log('\n✓ Show added successfully!')
    console.log(`\nThis show will appear in the ${showDocument.soloShow ? 'Solo Shows' : 'Group Shows'} section of the resume.`)
    
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
addResumeShow()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error('\nFatal error:', error)
    process.exit(1)
  })
