import jwt from 'jsonwebtoken'

/**
 * Express middleware that protects admin routes.
 * Expects an `Authorization: Bearer <token>` header containing a JWT signed
 * with JWT_SECRET. Rejects with 401 when the token is missing or invalid.
 */
export const requireAuth = (req, res, next) => {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    return res.status(500).json({
      error: 'Server misconfiguration',
      message: 'JWT_SECRET is not configured',
    })
  }

  const header = req.headers.authorization || ''
  const [scheme, token] = header.split(' ')

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Missing or malformed Authorization header',
    })
  }

  try {
    const payload = jwt.verify(token, secret)
    req.admin = payload
    next()
  } catch (err) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired token',
    })
  }
}
