import "dotenv/config.js"
import jwt from 'jsonwebtoken'
import { ObjectId } from 'mongodb'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const DB_NAME = 'sandycalhounv2'
const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME
const REGION = process.env.AWS_S3_REGION || process.env.AWS_REGION || 'us-west-2'
const CLOUDFRONT_DOMAIN = process.env.CLOUDFRONT_DOMAIN || ''

const s3Client = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
})

// Mirrors the slug logic used by scripts/uploadImagesToS3.mjs so that admin
// uploads land at the same artwork/<slug>.<ext> key convention.
const createSlug = (title) => {
  return String(title || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const EXT_BY_CONTENT_TYPE = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
}

const getArtsCollection = (req) =>
  req.app.locals.db.db(DB_NAME).collection('arts')

const getShowsCollection = (req) =>
  req.app.locals.db.db(DB_NAME).collection('shows')

const toObjectId = (id) => {
  try {
    return new ObjectId(id)
  } catch {
    return null
  }
}

// Builds a validated `arts` document from request body. Returns { doc, errors }.
const buildArtDocument = (body, { partial = false } = {}) => {
  const errors = []
  const doc = {}

  const setString = (key, required) => {
    if (body[key] === undefined || body[key] === null || body[key] === '') {
      if (required && !partial) errors.push(`${key} is required`)
      return
    }
    if (typeof body[key] !== 'string') {
      errors.push(`${key} must be a string`)
      return
    }
    doc[key] = body[key].trim()
  }

  setString('imageUrl', true)
  setString('title', true)
  setString('author', true)

  if (body.year === undefined || body.year === null || body.year === '') {
    if (!partial) errors.push('year is required')
  } else {
    const year = Number(body.year)
    if (Number.isNaN(year)) {
      errors.push('year must be a number')
    } else {
      doc.year = year
    }
  }

  if (body.media === undefined || body.media === null) {
    if (!partial) errors.push('media is required')
  } else {
    let media = body.media
    if (typeof media === 'string') {
      media = media.split(',').map((m) => m.trim()).filter(Boolean)
    }
    if (!Array.isArray(media) || media.length === 0) {
      errors.push('media must be a non-empty array or comma-separated string')
    } else {
      doc.media = media
    }
  }

  // Dimensions are optional - pieces added post-sale often have no size.
  // The Mongo schema requires `size` to be an object, so default to {} on
  // create and only include dimensions that were actually provided.
  if (body.size === undefined || body.size === null) {
    if (!partial) doc.size = {}
  } else if (typeof body.size !== 'object' || Array.isArray(body.size)) {
    errors.push('size must be an object')
  } else {
    const size = {}
    for (const dim of ['height', 'length', 'width']) {
      if (body.size[dim] !== undefined && body.size[dim] !== '') {
        const v = Number(body.size[dim])
        if (Number.isNaN(v)) {
          errors.push(`size.${dim} must be a number`)
        } else {
          size[dim] = v
        }
      }
    }
    doc.size = size
  }

  // Price is optional - unavailable/sold pieces may not have one.
  if (body.price !== undefined && body.price !== '') {
    const price = Number(body.price)
    if (Number.isNaN(price)) {
      errors.push('price must be a number')
    } else {
      doc.price = price
    }
  }

  if (body.shows !== undefined) {
    let shows = body.shows
    if (typeof shows === 'string') {
      shows = shows.split(',').map((s) => s.trim()).filter(Boolean)
    }
    if (Array.isArray(shows)) doc.shows = shows
  }

  if (body.wallPiece !== undefined) {
    doc.wallPiece = body.wallPiece === true || body.wallPiece === 'true'
  }

  if (body.deleted !== undefined) {
    doc.deleted = body.deleted === true || body.deleted === 'true'
  }

  return { doc, errors }
}

// Builds a `shows` document from request body. Returns { doc, errors }.
const buildShowDocument = (body, { partial = false } = {}) => {
  const errors = []
  const doc = {}

  if (body.title === undefined || body.title === '') {
    if (!partial) errors.push('title is required')
  } else {
    doc.title = String(body.title).trim()
  }

  if (body.location === undefined || body.location === '') {
    if (!partial) errors.push('location is required')
  } else {
    doc.location = String(body.location).trim()
  }

  if (body.year !== undefined && body.year !== '') {
    const year = Number(body.year)
    if (Number.isNaN(year)) {
      errors.push('year must be a number')
    } else {
      doc.year = year
    }
  }

  if (body.juror !== undefined && body.juror !== '') {
    doc.juror = String(body.juror).trim()
  }

  if (body.awards !== undefined) {
    let awards = body.awards
    if (typeof awards === 'string') {
      awards = awards.split(',').map((a) => a.trim()).filter(Boolean)
    }
    if (Array.isArray(awards)) doc.awards = awards
  }

  if (body.soloShow !== undefined && body.soloShow !== '') {
    doc.soloShow = body.soloShow === true || body.soloShow === 'true'
  }

  if (body.isUpcoming !== undefined && body.isUpcoming !== '') {
    doc.isUpcoming = body.isUpcoming === true || body.isUpcoming === 'true'
  }

  for (const dateField of ['startDate', 'endDate']) {
    if (body[dateField] !== undefined && body[dateField] !== '') {
      const d = new Date(body[dateField])
      if (Number.isNaN(d.getTime())) {
        errors.push(`${dateField} must be a valid date`)
      } else {
        doc[dateField] = d
      }
    }
  }

  for (const strField of ['imageUrl', 'description', 'address', 'mapLink']) {
    if (body[strField] !== undefined && body[strField] !== '') {
      doc[strField] = String(body[strField]).trim()
    }
  }

  return { doc, errors }
}

export const adminController = {
  login: async (req, res) => {
    const { password } = req.body || {}
    const expected = process.env.ADMIN_PASSWORD
    const secret = process.env.JWT_SECRET

    if (!expected || !secret) {
      return res.status(500).json({
        error: 'Server misconfiguration',
        message: 'ADMIN_PASSWORD or JWT_SECRET is not configured',
      })
    }

    if (!password || password !== expected) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid password',
      })
    }

    const token = jwt.sign({ role: 'admin' }, secret, { expiresIn: '12h' })
    return res.json({ token })
  },

  // Returns a presigned PUT URL plus the final public image URL.
  getUploadUrl: async (req, res) => {
    try {
      if (!BUCKET_NAME) {
        return res.status(500).json({
          error: 'Server misconfiguration',
          message: 'AWS_S3_BUCKET_NAME is not configured',
        })
      }

      const { title, contentType, folder } = req.body || {}
      if (!title) {
        return res.status(400).json({
          error: 'Validation failed',
          message: 'title is required to derive the file name',
        })
      }

      const type = contentType || 'image/jpeg'
      const extension = EXT_BY_CONTENT_TYPE[type]
      if (!extension) {
        return res.status(400).json({
          error: 'Validation failed',
          message: `Unsupported content type: ${type}`,
        })
      }

      // Restrict to a known set of folders so callers can't write anywhere.
      const ALLOWED_FOLDERS = ['artwork', 'shows']
      const targetFolder = ALLOWED_FOLDERS.includes(folder) ? folder : 'artwork'

      const slug = createSlug(title)
      if (!slug) {
        return res.status(400).json({
          error: 'Validation failed',
          message: 'title must contain at least one alphanumeric character',
        })
      }

      const key = `${targetFolder}/${slug}${extension}`

      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        ContentType: type,
        CacheControl: 'max-age=31536000',
      })

      const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 })

      const base = CLOUDFRONT_DOMAIN
        ? `https://${CLOUDFRONT_DOMAIN}`
        : `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com`
      const imageUrl = `${base}/${key}`

      return res.json({ uploadUrl, imageUrl, key })
    } catch (error) {
      console.error('Error generating upload URL:', error)
      return res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to generate upload URL',
      })
    }
  },

  listArt: async (req, res) => {
    try {
      const data = await getArtsCollection(req)
        .find({}, { sort: { year: -1, title: 1 } })
        .toArray()
      return res.json(data)
    } catch (error) {
      console.error('Error listing art:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  },

  createArt: async (req, res) => {
    try {
      const { doc, errors } = buildArtDocument(req.body || {})
      if (errors.length > 0) {
        return res.status(400).json({ error: 'Validation failed', messages: errors })
      }
      const result = await getArtsCollection(req).insertOne(doc)
      return res.status(201).json({ _id: result.insertedId, ...doc })
    } catch (error) {
      console.error('Error creating art:', error)
      return res.status(500).json({ error: 'Internal server error', message: error.message })
    }
  },

  updateArt: async (req, res) => {
    try {
      const _id = toObjectId(req.params.id)
      if (!_id) {
        return res.status(400).json({ error: 'Validation failed', message: 'Invalid id' })
      }
      const { doc, errors } = buildArtDocument(req.body || {}, { partial: true })
      if (errors.length > 0) {
        return res.status(400).json({ error: 'Validation failed', messages: errors })
      }
      if (Object.keys(doc).length === 0) {
        return res.status(400).json({ error: 'Validation failed', message: 'No valid fields to update' })
      }
      const result = await getArtsCollection(req).findOneAndUpdate(
        { _id },
        { $set: doc },
        { returnDocument: 'after' }
      )
      const updated = result?.value ?? result
      if (!updated) {
        return res.status(404).json({ error: 'Not found' })
      }
      return res.json(updated)
    } catch (error) {
      console.error('Error updating art:', error)
      return res.status(500).json({ error: 'Internal server error', message: error.message })
    }
  },

  // Soft delete by default; pass ?hard=true to permanently remove.
  deleteArt: async (req, res) => {
    try {
      const _id = toObjectId(req.params.id)
      if (!_id) {
        return res.status(400).json({ error: 'Validation failed', message: 'Invalid id' })
      }
      const hard = req.query.hard === 'true'
      if (hard) {
        const result = await getArtsCollection(req).deleteOne({ _id })
        if (result.deletedCount === 0) {
          return res.status(404).json({ error: 'Not found' })
        }
        return res.json({ success: true, hardDeleted: true })
      }
      const result = await getArtsCollection(req).updateOne(
        { _id },
        { $set: { deleted: true } }
      )
      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Not found' })
      }
      return res.json({ success: true, deleted: true })
    } catch (error) {
      console.error('Error deleting art:', error)
      return res.status(500).json({ error: 'Internal server error', message: error.message })
    }
  },

  restoreArt: async (req, res) => {
    try {
      const _id = toObjectId(req.params.id)
      if (!_id) {
        return res.status(400).json({ error: 'Validation failed', message: 'Invalid id' })
      }
      const result = await getArtsCollection(req).updateOne(
        { _id },
        { $set: { deleted: false } }
      )
      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Not found' })
      }
      return res.json({ success: true, restored: true })
    } catch (error) {
      console.error('Error restoring art:', error)
      return res.status(500).json({ error: 'Internal server error', message: error.message })
    }
  },

  listShows: async (req, res) => {
    try {
      const data = await getShowsCollection(req)
        .find({}, { sort: { year: -1, title: 1 } })
        .toArray()
      return res.json(data)
    } catch (error) {
      console.error('Error listing shows:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  },

  createShow: async (req, res) => {
    try {
      const { doc, errors } = buildShowDocument(req.body || {})
      if (errors.length > 0) {
        return res.status(400).json({ error: 'Validation failed', messages: errors })
      }
      const result = await getShowsCollection(req).insertOne(doc)
      return res.status(201).json({ _id: result.insertedId, ...doc })
    } catch (error) {
      console.error('Error creating show:', error)
      return res.status(500).json({ error: 'Internal server error', message: error.message })
    }
  },

  updateShow: async (req, res) => {
    try {
      const _id = toObjectId(req.params.id)
      if (!_id) {
        return res.status(400).json({ error: 'Validation failed', message: 'Invalid id' })
      }
      const { doc, errors } = buildShowDocument(req.body || {}, { partial: true })
      if (errors.length > 0) {
        return res.status(400).json({ error: 'Validation failed', messages: errors })
      }
      if (Object.keys(doc).length === 0) {
        return res.status(400).json({ error: 'Validation failed', message: 'No valid fields to update' })
      }
      const result = await getShowsCollection(req).findOneAndUpdate(
        { _id },
        { $set: doc },
        { returnDocument: 'after' }
      )
      const updated = result?.value ?? result
      if (!updated) {
        return res.status(404).json({ error: 'Not found' })
      }
      return res.json(updated)
    } catch (error) {
      console.error('Error updating show:', error)
      return res.status(500).json({ error: 'Internal server error', message: error.message })
    }
  },

  deleteShow: async (req, res) => {
    try {
      const _id = toObjectId(req.params.id)
      if (!_id) {
        return res.status(400).json({ error: 'Validation failed', message: 'Invalid id' })
      }
      const result = await getShowsCollection(req).deleteOne({ _id })
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Not found' })
      }
      return res.json({ success: true })
    } catch (error) {
      console.error('Error deleting show:', error)
      return res.status(500).json({ error: 'Internal server error', message: error.message })
    }
  },
}
