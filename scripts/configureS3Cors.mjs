/**
 * Configures CORS on the S3 bucket so the admin page can upload artwork
 * directly from the browser using presigned PUT URLs, and reports whether
 * objects under artwork/* are publicly readable.
 *
 * Usage:
 *   node scripts/configureS3Cors.mjs            # apply CORS
 *   DRY_RUN=true node scripts/configureS3Cors.mjs  # show what would change
 *
 * Allowed origins can be overridden via ADMIN_ALLOWED_ORIGINS (comma-separated).
 */

import {
  S3Client,
  PutBucketCorsCommand,
  GetBucketCorsCommand,
  GetBucketPolicyStatusCommand,
} from '@aws-sdk/client-s3'
import dotenv from 'dotenv'

dotenv.config()

const BUCKET = process.env.AWS_S3_BUCKET_NAME
const REGION = process.env.AWS_S3_REGION || process.env.AWS_REGION || 'us-west-2'
const DRY_RUN = process.env.DRY_RUN === 'true'

const DEFAULT_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://sandycalhounart.herokuapp.com',
  'https://www.sandycalhoun.com',
  'https://sandycalhoun.com',
]

const allowedOrigins = process.env.ADMIN_ALLOWED_ORIGINS
  ? process.env.ADMIN_ALLOWED_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean)
  : DEFAULT_ORIGINS

if (!BUCKET) {
  console.error('ERROR: AWS_S3_BUCKET_NAME is required')
  process.exit(1)
}

const s3 = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
})

const corsConfiguration = {
  CORSRules: [
    {
      AllowedHeaders: ['*'],
      AllowedMethods: ['PUT', 'GET', 'HEAD'],
      AllowedOrigins: allowedOrigins,
      ExposeHeaders: ['ETag'],
      MaxAgeSeconds: 3000,
    },
  ],
}

const main = async () => {
  console.log(`Bucket: ${BUCKET} (${REGION})`)
  console.log(`Allowed origins:\n  ${allowedOrigins.join('\n  ')}\n`)

  if (DRY_RUN) {
    console.log('[DRY RUN] Would apply this CORS configuration:')
    console.log(JSON.stringify(corsConfiguration, null, 2))
  } else {
    await s3.send(
      new PutBucketCorsCommand({ Bucket: BUCKET, CORSConfiguration: corsConfiguration })
    )
    console.log('CORS configuration applied.')

    const current = await s3.send(new GetBucketCorsCommand({ Bucket: BUCKET }))
    console.log('\nCurrent CORS rules:')
    console.log(JSON.stringify(current.CORSRules, null, 2))
  }

  console.log('\nChecking public-read status...')
  try {
    const status = await s3.send(new GetBucketPolicyStatusCommand({ Bucket: BUCKET }))
    const isPublic = status.PolicyStatus?.IsPublic
    console.log(`  Bucket policy reports IsPublic: ${isPublic}`)
    if (!isPublic) {
      console.log(
        '  WARNING: bucket is not marked public by policy. New uploads may not be\n' +
        '  publicly viewable. Ensure a bucket policy grants s3:GetObject on artwork/*.'
      )
    }
  } catch (err) {
    if (err.name === 'NoSuchBucketPolicy') {
      console.log(
        '  No bucket policy found. If objects are served via per-object ACLs today,\n' +
        '  add a bucket policy granting public s3:GetObject on artwork/* so presigned\n' +
        '  uploads remain viewable.'
      )
    } else {
      console.log(`  Could not determine policy status: ${err.message}`)
    }
  }
}

main().catch((err) => {
  console.error('Failed to configure CORS:', err)
  process.exit(1)
})
