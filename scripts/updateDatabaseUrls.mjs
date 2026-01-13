import { MongoClient, ObjectId } from 'mongodb'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const MONGODB_URI = process.env.MONGODB_URI
const UPLOAD_REPORT_PATH = path.join(__dirname, 'upload-report.json')
const DRY_RUN = process.env.DRY_RUN === 'true'

if (!MONGODB_URI) {
  console.error('ERROR: MONGODB_URI environment variable is required')
  process.exit(1)
}

/**
 * Updates database with new S3 URLs from upload report
 */
const updateDatabaseUrls = async () => {
  let client
  const results = {
    total: 0,
    updated: 0,
    skipped: 0,
    failed: 0,
    details: [],
  }

  try {
    console.log('='.repeat(60))
    console.log('Database URL Update')
    console.log('='.repeat(60))
    console.log(`Dry Run: ${DRY_RUN ? 'YES (no changes will be made)' : 'NO'}`)
    console.log('='.repeat(60))
    console.log()

    // Load upload report
    if (!fs.existsSync(UPLOAD_REPORT_PATH)) {
      console.error(`ERROR: Upload report not found at ${UPLOAD_REPORT_PATH}`)
      console.error('Please run uploadImagesToS3.mjs first to generate the upload report.')
      process.exit(1)
    }

    console.log('Loading upload report...')
    const uploadReport = JSON.parse(fs.readFileSync(UPLOAD_REPORT_PATH, 'utf8'))
    console.log(`Loaded report with ${uploadReport.details.length} entries`)
    console.log()

    // Filter to only successful uploads
    const successfulUploads = uploadReport.details.filter(r => r.success)
    results.total = successfulUploads.length

    if (successfulUploads.length === 0) {
      console.log('No successful uploads found in report. Nothing to update.')
      return results
    }

    console.log(`Found ${successfulUploads.length} successful uploads to update`)
    console.log()

    // Connect to MongoDB
    console.log('Connecting to MongoDB...')
    client = new MongoClient(MONGODB_URI)
    await client.connect()
    console.log('Connected to MongoDB')
    console.log()

    const db = client.db('sandycalhounv2')
    const collection = db.collection('arts')

    // Update each artwork
    console.log('Updating database...')
    console.log()

    for (let i = 0; i < successfulUploads.length; i++) {
      const upload = successfulUploads[i]
      const { artworkId, title, oldUrl, newUrl } = upload

      console.log(`[${i + 1}/${successfulUploads.length}] Updating: ${title}`)
      console.log(`    Old URL: ${oldUrl}`)
      console.log(`    New URL: ${newUrl}`)

      try {
        // Convert string ID to ObjectId for querying
        let queryId
        try {
          queryId = typeof artworkId === 'string' ? new ObjectId(artworkId) : artworkId
        } catch (error) {
          console.error(`    ✗ Invalid artworkId format: ${artworkId}`)
          results.failed++
          results.details.push({
            artworkId,
            title,
            status: 'failed',
            error: `Invalid ID format: ${error.message}`,
          })
          continue
        }

        // Verify artwork still exists and has the old URL
        const artwork = await collection.findOne({ _id: queryId })
        
        if (!artwork) {
          console.log(`    ⚠️  Artwork not found in database, skipping`)
          results.skipped++
          results.details.push({
            artworkId,
            title,
            status: 'skipped',
            reason: 'Artwork not found',
          })
          continue
        }

        if (artwork.imageUrl !== oldUrl) {
          console.log(`    ⚠️  URL mismatch - artwork already has different URL, skipping`)
          console.log(`    Current URL: ${artwork.imageUrl}`)
          results.skipped++
          results.details.push({
            artworkId,
            title,
            status: 'skipped',
            reason: 'URL mismatch - already updated or changed',
            currentUrl: artwork.imageUrl,
          })
          continue
        }

        // Update the database
        if (!DRY_RUN) {
          const updateResult = await collection.updateOne(
            { _id: queryId },
            { $set: { imageUrl: newUrl } }
          )

          if (updateResult.matchedCount === 0) {
            throw new Error('Artwork not found during update')
          }

          if (updateResult.modifiedCount === 0) {
            console.log(`    ⚠️  No changes made (URL may already be updated)`)
            results.skipped++
          } else {
            console.log(`    ✓ Database updated`)
            results.updated++
          }
        } else {
          console.log(`    [DRY RUN] Would update database`)
          results.updated++
        }

        results.details.push({
          artworkId,
          title,
          status: DRY_RUN ? 'would_update' : 'updated',
          oldUrl,
          newUrl,
        })
      } catch (error) {
        console.error(`    ✗ Error: ${error.message}`)
        results.failed++
        results.details.push({
          artworkId,
          title,
          status: 'failed',
          error: error.message,
        })
      }

      console.log()
    }

    // Print summary
    console.log('='.repeat(60))
    console.log('Update Summary')
    console.log('='.repeat(60))
    console.log(`Total: ${results.total}`)
    console.log(`Updated: ${results.updated}`)
    console.log(`Skipped: ${results.skipped}`)
    console.log(`Failed: ${results.failed}`)
    console.log('='.repeat(60))

    // Save detailed report
    const reportPath = path.join(__dirname, 'update-report.json')
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2))
    console.log(`\nDetailed report saved to: ${reportPath}`)

    return results
  } catch (error) {
    console.error('Fatal error during update:', error)
    throw error
  } finally {
    if (client) {
      await client.close()
      console.log('\nMongoDB connection closed')
    }
  }
}

// Run update
updateDatabaseUrls()
  .then(() => {
    console.log('\nDatabase update completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\nDatabase update failed:', error)
    process.exit(1)
  })

