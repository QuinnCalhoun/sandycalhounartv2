import { MongoClient, ObjectId } from 'mongodb'
import dotenv from 'dotenv'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI
const DRY_RUN = process.env.DRY_RUN === 'true'

if (!MONGODB_URI) {
  console.error('ERROR: MONGODB_URI environment variable is required')
  process.exit(1)
}

/**
 * Manages artwork visibility by marking as deleted or restoring
 * Usage:
 *   node scripts/manageArtworkVisibility.mjs delete "Artwork Title"
 *   node scripts/manageArtworkVisibility.mjs restore "Artwork Title"
 *   node scripts/manageArtworkVisibility.mjs delete --id="6374f5dd1fff8f97fb38c2db"
 *   node scripts/manageArtworkVisibility.mjs list
 *   node scripts/manageArtworkVisibility.mjs search "Artwork Title"
 *   DRY_RUN=true node scripts/manageArtworkVisibility.mjs delete "Artwork Title"
 */
const manageArtworkVisibility = async () => {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    console.error('Usage:')
    console.error('  node scripts/manageArtworkVisibility.mjs <action> [identifier...]')
    console.error('  node scripts/manageArtworkVisibility.mjs <action> --id=<id>')
    console.error('')
    console.error('Actions:')
    console.error('  delete  - Mark artwork(s) as deleted (hidden from website)')
    console.error('  restore - Restore deleted artwork(s) (show on website)')
    console.error('  list    - List all deleted artworks')
    console.error('  search  - Search for artwork(s) and show their delete status')
    console.error('')
    console.error('Examples:')
    console.error('  node scripts/manageArtworkVisibility.mjs delete "Artwork Title"')
    console.error('  node scripts/manageArtworkVisibility.mjs restore "Artwork Title"')
    console.error('  node scripts/manageArtworkVisibility.mjs delete --id="6374f5dd1fff8f97fb38c2db"')
    console.error('  node scripts/manageArtworkVisibility.mjs list')
    console.error('  node scripts/manageArtworkVisibility.mjs search "Artwork Title"')
    console.error('  DRY_RUN=true node scripts/manageArtworkVisibility.mjs delete "Artwork Title"')
    process.exit(1)
  }

  const action = args[0].toLowerCase()
  const identifiers = args.slice(1).filter(arg => !arg.startsWith('--id='))
  const idArg = args.find(arg => arg.startsWith('--id='))
  const idFromArg = idArg ? idArg.split('=')[1] : null

  if (!['delete', 'restore', 'list', 'search'].includes(action)) {
    console.error(`ERROR: Invalid action "${action}". Must be one of: delete, restore, list, search`)
    process.exit(1)
  }

  let client
  const results = {
    found: 0,
    updated: 0,
    failed: 0,
    details: [],
  }

  try {
    console.log('='.repeat(60))
    console.log('Artwork Visibility Management')
    console.log('='.repeat(60))
    console.log(`Action: ${action.toUpperCase()}`)
    console.log(`Dry Run: ${DRY_RUN ? 'YES (no changes will be made)' : 'NO'}`)
    console.log('='.repeat(60))
    console.log()

    // Connect to MongoDB
    client = new MongoClient(MONGODB_URI)
    await client.connect()
    const db = client.db('sandycalhounv2')
    const collection = db.collection('arts')

    if (action === 'list') {
      // List all deleted artworks
      console.log('Finding deleted artworks...')
      console.log()
      
      const deletedArtworks = await collection.find({ deleted: true }).toArray()
      
      if (deletedArtworks.length === 0) {
        console.log('No deleted artworks found.')
      } else {
        console.log(`Found ${deletedArtworks.length} deleted artwork(s):`)
        console.log()
        deletedArtworks.forEach((artwork, index) => {
          console.log(`${index + 1}. ${artwork.title}`)
          console.log(`   ID: ${artwork._id}`)
          console.log(`   Author: ${artwork.author}`)
          console.log(`   Year: ${artwork.year}`)
          console.log()
        })
      }
      
      return
    }

    if (action === 'search') {
      // Search for artworks and show their status
      if (identifiers.length === 0 && !idFromArg) {
        console.error('ERROR: Must provide at least one artwork identifier (title or --id) to search')
        process.exit(1)
      }

      const allIdentifiers = [...identifiers]
      if (idFromArg) {
        allIdentifiers.push(idFromArg)
      }

      console.log(`Searching for ${allIdentifiers.length} artwork(s)...`)
      console.log()

      for (const identifier of allIdentifiers) {
        try {
          let query
          let isId = false
          
          try {
            const objectId = new ObjectId(identifier)
            query = { _id: objectId }
            isId = true
          } catch (error) {
            query = { title: identifier }
          }

          const artwork = await collection.findOne(query)
          
          if (!artwork) {
            console.log(`✗ ${isId ? 'ID' : 'Title'}: "${identifier}"`)
            console.log(`   Status: NOT FOUND`)
            console.log()
            continue
          }

          const isDeleted = artwork.deleted === true
          const status = isDeleted ? 'DELETED (hidden from website)' : 'ACTIVE (visible on website)'
          const statusIcon = isDeleted ? '🗑️' : '✓'

          console.log(`${statusIcon} "${artwork.title}"`)
          console.log(`   ID: ${artwork._id}`)
          console.log(`   Status: ${status}`)
          console.log(`   Author: ${artwork.author}`)
          console.log(`   Year: ${artwork.year}`)
          if (artwork.media && artwork.media.length > 0) {
            console.log(`   Media: ${artwork.media.join(', ')}`)
          }
          console.log()
        } catch (error) {
          console.error(`✗ Error searching for "${identifier}": ${error.message}`)
          console.log()
        }
      }

      return
    }

    // For delete/restore actions, need identifiers
    if (identifiers.length === 0 && !idFromArg) {
      console.error('ERROR: Must provide at least one artwork identifier (title or --id)')
      process.exit(1)
    }

    // Collect all identifiers (titles and IDs)
    const allIdentifiers = [...identifiers]
    if (idFromArg) {
      allIdentifiers.push(idFromArg)
    }

    if (allIdentifiers.length === 0) {
      console.error('ERROR: No artwork identifiers provided')
      process.exit(1)
    }

    console.log(`Processing ${allIdentifiers.length} identifier(s)...`)
    console.log()

    // Process each identifier
    for (const identifier of allIdentifiers) {
      try {
        // Try to parse as ObjectId first
        let query
        let isId = false
        
        try {
          const objectId = new ObjectId(identifier)
          query = { _id: objectId }
          isId = true
        } catch (error) {
          // Not a valid ObjectId, treat as title
          query = { title: identifier }
        }

        // Find the artwork
        const artwork = await collection.findOne(query)
        
        if (!artwork) {
          console.log(`✗ ${isId ? 'ID' : 'Title'}: "${identifier}" - Not found`)
          results.failed++
          results.details.push({
            identifier,
            status: 'not_found',
          })
          continue
        }

        results.found++

        // Check current state
        const isCurrentlyDeleted = artwork.deleted === true
        const shouldBeDeleted = action === 'delete'

        if (isCurrentlyDeleted === shouldBeDeleted) {
          console.log(`⚠  "${artwork.title}" - Already ${shouldBeDeleted ? 'deleted' : 'restored'}`)
          results.details.push({
            identifier,
            title: artwork.title,
            status: 'no_change',
            currentState: shouldBeDeleted ? 'deleted' : 'active',
          })
          continue
        }

        // Perform the update
        if (DRY_RUN) {
          console.log(`[DRY RUN] Would ${action} "${artwork.title}" (ID: ${artwork._id})`)
          results.updated++
          results.details.push({
            identifier,
            title: artwork.title,
            status: 'would_update',
            action,
          })
        } else {
          if (action === 'delete') {
            await collection.updateOne(
              { _id: artwork._id },
              { $set: { deleted: true } }
            )
            console.log(`✓ Deleted "${artwork.title}" (ID: ${artwork._id})`)
          } else {
            // restore - remove the deleted field or set to false
            await collection.updateOne(
              { _id: artwork._id },
              { $unset: { deleted: '' } }
            )
            console.log(`✓ Restored "${artwork.title}" (ID: ${artwork._id})`)
          }
          results.updated++
          results.details.push({
            identifier,
            title: artwork.title,
            status: 'updated',
            action,
          })
        }
      } catch (error) {
        console.error(`✗ Error processing "${identifier}": ${error.message}`)
        results.failed++
        results.details.push({
          identifier,
          status: 'error',
          error: error.message,
        })
      }
    }

    // Summary
    console.log()
    console.log('='.repeat(60))
    console.log('Summary')
    console.log('='.repeat(60))
    console.log(`Found: ${results.found}`)
    console.log(`${DRY_RUN ? 'Would update' : 'Updated'}: ${results.updated}`)
    console.log(`Failed: ${results.failed}`)
    console.log('='.repeat(60))

  } catch (error) {
    console.error('Fatal error:', error)
    process.exit(1)
  } finally {
    if (client) {
      await client.close()
    }
  }
}

manageArtworkVisibility()
