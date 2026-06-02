/**
 * Verifies that every artwork in MongoDB has its `imageUrl` present in the
 * configured S3 bucket, and reports any orphan objects in the bucket that
 * are not referenced by the database.
 *
 * Usage:
 *   node scripts/verifyS3Images.mjs
 *
 * Env vars (loaded from .env):
 *   MONGODB_URI, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY,
 *   AWS_S3_BUCKET_NAME, AWS_S3_REGION (or AWS_REGION)
 */

import { MongoClient } from 'mongodb'
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3'
import dotenv from 'dotenv'

dotenv.config()

const BUCKET = process.env.AWS_S3_BUCKET_NAME
const REGION = process.env.AWS_S3_REGION || process.env.AWS_REGION || 'us-west-2'
const MONGODB_URI = process.env.MONGODB_URI
const DB_NAME = process.env.MONGODB_DB_NAME || 'sandycalhounv2'

if (!BUCKET) {
  console.error('ERROR: AWS_S3_BUCKET_NAME is required')
  process.exit(1)
}
if (!MONGODB_URI) {
  console.error('ERROR: MONGODB_URI is required')
  process.exit(1)
}

const s3 = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
})

const listAllObjects = async (bucket) => {
  const keys = []
  let ContinuationToken
  do {
    const res = await s3.send(
      new ListObjectsV2Command({ Bucket: bucket, ContinuationToken })
    )
    for (const obj of res.Contents || []) {
      keys.push({ key: obj.Key, size: obj.Size, lastModified: obj.LastModified })
    }
    ContinuationToken = res.IsTruncated ? res.NextContinuationToken : undefined
  } while (ContinuationToken)
  return keys
}

// Extract the S3 object key from a stored imageUrl.
// Supports:
//   https://<bucket>.s3.<region>.amazonaws.com/<key>
//   https://s3.<region>.amazonaws.com/<bucket>/<key>
//   https://<cloudfront-domain>/<key>
const keyFromUrl = (url) => {
  if (!url) return null
  try {
    const u = new URL(url)
    const host = u.hostname
    const path = decodeURIComponent(u.pathname.replace(/^\/+/, ''))

    if (host === `${BUCKET}.s3.${REGION}.amazonaws.com` || host === `${BUCKET}.s3.amazonaws.com`) {
      return path
    }
    if (host === `s3.${REGION}.amazonaws.com` || host === 's3.amazonaws.com') {
      // path is <bucket>/<key>
      const parts = path.split('/')
      if (parts[0] === BUCKET) return parts.slice(1).join('/')
      return null
    }
    // Unknown host (e.g. CloudFront, imgbb) — return path so we can still try to match
    return path || null
  } catch {
    return null
  }
}

const isS3Url = (url) => {
  if (!url) return false
  return url.includes(`${BUCKET}.s3.`) || url.includes(`s3.${REGION}.amazonaws.com/${BUCKET}`)
}

const main = async () => {
  console.log(`Bucket: ${BUCKET} (${REGION})`)
  console.log(`Mongo:  ${DB_NAME}.arts\n`)

  console.log('Listing S3 objects...')
  const objects = await listAllObjects(BUCKET)
  const s3Keys = new Set(objects.map((o) => o.key))
  console.log(`  found ${objects.length} object(s) in bucket\n`)

  console.log('Loading artworks from Mongo...')
  const client = new MongoClient(MONGODB_URI)
  await client.connect()
  const arts = await client
    .db(DB_NAME)
    .collection('arts')
    .find({}, { projection: { title: 1, imageUrl: 1, deleted: 1 } })
    .toArray()
  await client.close()
  console.log(`  found ${arts.length} artwork document(s) (incl. soft-deleted)\n`)

  const active = arts.filter((a) => a.deleted !== true)
  const deleted = arts.filter((a) => a.deleted === true)
  console.log(`  active: ${active.length}, soft-deleted: ${deleted.length}\n`)

  const referencedKeys = new Set()
  const missing = []
  const nonS3 = []

  for (const a of arts) {
    const key = keyFromUrl(a.imageUrl)
    if (!isS3Url(a.imageUrl)) {
      nonS3.push({ title: a.title, deleted: !!a.deleted, imageUrl: a.imageUrl })
      continue
    }
    if (key) referencedKeys.add(key)
    if (!key || !s3Keys.has(key)) {
      missing.push({ title: a.title, deleted: !!a.deleted, imageUrl: a.imageUrl, expectedKey: key })
    }
  }

  const orphans = objects
    .filter((o) => !referencedKeys.has(o.key))
    .map((o) => o.key)

  console.log('===== RESULTS =====\n')

  console.log(`Artworks pointing at non-S3 URLs: ${nonS3.length}`)
  for (const n of nonS3.slice(0, 20)) {
    console.log(`  - [${n.deleted ? 'deleted' : 'active '}] ${n.title} -> ${n.imageUrl}`)
  }
  if (nonS3.length > 20) console.log(`  ...and ${nonS3.length - 20} more`)
  console.log()

  console.log(`Artworks whose S3 object is MISSING: ${missing.length}`)
  for (const m of missing) {
    console.log(`  - [${m.deleted ? 'deleted' : 'active '}] ${m.title}`)
    console.log(`      url: ${m.imageUrl}`)
    console.log(`      key: ${m.expectedKey}`)
  }
  console.log()

  console.log(`Orphan S3 objects (in bucket, not referenced by DB): ${orphans.length}`)
  for (const k of orphans.slice(0, 30)) console.log(`  - ${k}`)
  if (orphans.length > 30) console.log(`  ...and ${orphans.length - 30} more`)
  console.log()

  const activeMissing = missing.filter((m) => !m.deleted).length
  console.log('===== SUMMARY =====')
  console.log(`  S3 objects:                 ${objects.length}`)
  console.log(`  Mongo artworks (all):       ${arts.length}`)
  console.log(`  Mongo artworks (active):    ${active.length}`)
  console.log(`  Non-S3 imageUrls:           ${nonS3.length}`)
  console.log(`  Missing from S3 (active):   ${activeMissing}`)
  console.log(`  Missing from S3 (deleted):  ${missing.length - activeMissing}`)
  console.log(`  Orphan S3 objects:          ${orphans.length}`)

  if (activeMissing > 0 || nonS3.some((n) => !n.deleted)) {
    process.exitCode = 1
  }
}

main().catch((err) => {
  console.error('Verification failed:', err)
  process.exit(1)
})
