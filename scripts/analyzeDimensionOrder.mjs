import { MongoClient, ObjectId } from 'mongodb'
import dotenv from 'dotenv'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error('ERROR: MONGODB_URI environment variable is required')
  process.exit(1)
}

/**
 * Analyzes dimension order inconsistencies in artwork data
 * The issue: dimensions may have been entered in different orders (H×W×L vs W×H×L vs L×H×W)
 * but all stored in the same structure { width, height, length }, causing display confusion
 */
const analyzeDimensionOrder = async () => {
  let client

  try {
    console.log('='.repeat(60))
    console.log('Dimension Order Analysis')
    console.log('='.repeat(60))
    console.log()

    // Connect to MongoDB
    client = new MongoClient(MONGODB_URI)
    await client.connect()
    const db = client.db('sandycalhounv2')
    const collection = db.collection('arts')

    // Get all artworks (excluding deleted)
    const artworks = await collection.find({ deleted: { $ne: true } }).toArray()

    console.log(`Analyzing ${artworks.length} artworks...`)
    console.log()

    const issues = []
    const patterns = {
      typical: [], // height is largest (typical for sculptures)
      wide: [],    // width is largest (wide pieces)
      long: [],    // length is largest (long pieces)
      square: [],  // all dimensions similar
      suspicious: [], // dimensions seem inconsistent
      missing: [], // missing size data
    }

    for (const artwork of artworks) {
      const { title, size } = artwork

      if (!size) {
        patterns.missing.push({ title, issue: 'Missing size object' })
        continue
      }

      const { width, height, length } = size

      // Check for missing fields
      if (width === undefined || height === undefined || length === undefined) {
        patterns.missing.push({ 
          title, 
          issue: `Missing field(s): ${!width ? 'width ' : ''}${!height ? 'height ' : ''}${!length ? 'length ' : ''}`.trim()
        })
        continue
      }

      // Check for non-numeric values
      if (typeof width === 'string' || typeof height === 'string' || typeof length === 'string') {
        patterns.missing.push({ 
          title, 
          issue: `Non-numeric values: width=${width}, height=${height}, length=${length}`
        })
        continue
      }

      // Convert to numbers for comparison
      const w = Number(width)
      const h = Number(height)
      const l = Number(length)

      // Find the largest dimension
      const max = Math.max(w, h, l)
      const min = Math.min(w, h, l)
      const mid = [w, h, l].sort((a, b) => a - b)[1]

      // Check for suspicious patterns
      // If height is smallest, it might be wrong (sculptures are usually tallest)
      // If width is much larger than height, might be a wall piece entered wrong
      const heightIsSmallest = h === min
      const widthIsLargest = w === max
      const lengthIsLargest = l === max
      const heightIsLargest = h === max

      // Suspicious: height is smallest (unusual for sculptures)
      if (heightIsSmallest && max / min > 2) {
        patterns.suspicious.push({
          title,
          current: { width: w, height: h, length: l },
          issue: `Height (${h}") is smallest dimension - may be misordered`,
          suggestion: `Could be: H=${max}", L=${mid}", W=${min}" or other combination`
        })
      }

      // Categorize by pattern
      if (heightIsLargest) {
        patterns.typical.push({ title, dimensions: { w, h, l } })
      } else if (widthIsLargest) {
        patterns.wide.push({ title, dimensions: { w, h, l } })
      } else if (lengthIsLargest) {
        patterns.long.push({ title, dimensions: { w, h, l } })
      }

      // Check if all dimensions are similar (square/cube-like)
      const range = max - min
      if (range / max < 0.3) { // within 30% of each other
        patterns.square.push({ title, dimensions: { w, h, l } })
      }
    }

    // Print results
    console.log('='.repeat(60))
    console.log('ANALYSIS RESULTS')
    console.log('='.repeat(60))
    console.log()

    console.log(`Total artworks analyzed: ${artworks.length}`)
    console.log(`Typical (height largest): ${patterns.typical.length}`)
    console.log(`Wide (width largest): ${patterns.wide.length}`)
    console.log(`Long (length largest): ${patterns.long.length}`)
    console.log(`Square-like (similar dimensions): ${patterns.square.length}`)
    console.log(`Suspicious (potential misordering): ${patterns.suspicious.length}`)
    console.log(`Missing/Invalid: ${patterns.missing.length}`)
    console.log()

    if (patterns.suspicious.length > 0) {
      console.log('='.repeat(60))
      console.log('SUSPICIOUS DIMENSIONS (May need correction)')
      console.log('='.repeat(60))
      console.log()
      patterns.suspicious.forEach((item, index) => {
        console.log(`${index + 1}. "${item.title}"`)
        console.log(`   Current: W=${item.current.width}", H=${item.current.height}", L=${item.current.length}"`)
        console.log(`   Issue: ${item.issue}`)
        console.log(`   ${item.suggestion}`)
        console.log()
      })
    }

    if (patterns.missing.length > 0) {
      console.log('='.repeat(60))
      console.log('MISSING OR INVALID SIZE DATA')
      console.log('='.repeat(60))
      console.log()
      patterns.missing.forEach((item, index) => {
        console.log(`${index + 1}. "${item.title}"`)
        console.log(`   ${item.issue}`)
        console.log()
      })
    }

    // Show some examples of each pattern
    console.log('='.repeat(60))
    console.log('SAMPLE PATTERNS')
    console.log('='.repeat(60))
    console.log()

    if (patterns.typical.length > 0) {
      console.log('Typical (Height is largest - most common):')
      patterns.typical.slice(0, 3).forEach(item => {
        console.log(`  "${item.title}": W=${item.dimensions.w}", H=${item.dimensions.h}", L=${item.dimensions.l}"`)
      })
      console.log()
    }

    if (patterns.wide.length > 0) {
      console.log('Wide pieces (Width is largest):')
      patterns.wide.slice(0, 3).forEach(item => {
        console.log(`  "${item.title}": W=${item.dimensions.w}", H=${item.dimensions.h}", L=${item.dimensions.l}"`)
      })
      console.log()
    }

    if (patterns.long.length > 0) {
      console.log('Long pieces (Length is largest):')
      patterns.long.slice(0, 3).forEach(item => {
        console.log(`  "${item.title}": W=${item.dimensions.w}", H=${item.dimensions.h}", L=${item.dimensions.l}"`)
      })
      console.log()
    }

    console.log('='.repeat(60))
    console.log('RECOMMENDATIONS')
    console.log('='.repeat(60))
    console.log()
    console.log('1. Review the "SUSPICIOUS DIMENSIONS" list above')
    console.log('2. For each suspicious piece, check the actual artwork to verify correct dimensions')
    console.log('3. Standardize on a consistent order: Height × Length × Width (H × L × W)')
    console.log('4. Update database entries to match the standardized order')
    console.log()

  } catch (error) {
    console.error('Fatal error:', error)
    process.exit(1)
  } finally {
    if (client) {
      await client.close()
    }
  }
}

analyzeDimensionOrder()
