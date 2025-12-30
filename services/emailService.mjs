import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'
import dotenv from 'dotenv'

dotenv.config()

// Validate AWS credentials are set
if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
  console.warn('WARNING: AWS credentials not found in environment variables.')
  console.warn('Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in your .env file.')
  console.warn('Email sending will fail until credentials are configured.')
}

// Initialize SES client
// If credentials are not provided, AWS SDK will try to use default credential chain
// (IAM roles, AWS CLI config, etc.) but for local dev, env vars are required
const getSESClient = () => {
  const config = {
    region: process.env.AWS_REGION || 'us-west-2',
  }

  // Only add credentials if they're explicitly provided
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    config.credentials = {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
  }

  return new SESClient(config)
}

const sesClient = getSESClient()

/**
 * Creates an HTML email template for contact form submissions
 * Matches the minimalist aesthetic of sandycalhoun.com
 */
const createEmailTemplate = (name, email, subject, message) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      color: #000;
      max-width: 600px;
      margin: 0 auto;
      padding: 0;
      background-color: #ffffff;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    .email-container {
      padding: 40px 20px;
    }
    .header {
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid rgba(34, 36, 38, 0.1);
    }
    .header h1 {
      font-family: 'Source Sans Pro', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 28px;
      font-weight: 400;
      letter-spacing: 2px;
      margin: 0 0 10px 0;
      color: #000;
      text-transform: uppercase;
    }
    .sender-info {
      font-size: 14px;
      color: #666;
      margin-top: 8px;
    }
    .sender-info a {
      color: #000;
      text-decoration: none;
    }
    .message-content {
      margin-top: 25px;
      white-space: pre-wrap;
      font-size: 15px;
      line-height: 1.8;
      color: #000;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid rgba(34, 36, 38, 0.1);
      font-size: 12px;
      color: #999;
      text-align: center;
    }
    .footer-note {
      margin-top: 8px;
      font-style: italic;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>${escapeHtml(subject)}</h1>
      <div class="sender-info">
        From: <strong>${escapeHtml(name)}</strong> &lt;<a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a>&gt;
      </div>
    </div>
    <div class="message-content">
${escapeHtml(message)}
    </div>
    <div class="footer">
      <p>sandycalhoun.com</p>
      <p class="footer-note">Reply to this email to respond directly to ${escapeHtml(name)}</p>
    </div>
  </div>
</body>
</html>
  `.trim()
}

/**
 * Escapes HTML to prevent XSS attacks
 */
const escapeHtml = (text) => {
  if (!text) return ''
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, (m) => map[m])
}

/**
 * Sends a contact form email using AWS SES
 * @param {Object} contactData - Contact form data
 * @param {string} contactData.name - Sender's name
 * @param {string} contactData.email - Sender's email (used for Reply-To)
 * @param {string} contactData.subject - Email subject
 * @param {string} contactData.message - Email message body
 * @returns {Promise<Object>} SES response with MessageId
 * @throws {Error} If email sending fails
 */
export const sendContactEmail = async ({ name, email, subject, message }) => {
  // Validate required fields
  if (!name || !email || !subject || !message) {
    throw new Error('Missing required fields: name, email, subject, and message are required')
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format')
  }

  // Get configuration from environment variables
  const fromEmail = process.env.CONTACT_EMAIL_FROM || 'sandy@sandycalhoun.com'
  const toEmails = (process.env.CONTACT_EMAIL_TO || 'sandycalhounart@gmail.com').split(',').map(e => e.trim())
  const ccEmails = process.env.CONTACT_EMAIL_CC 
    ? process.env.CONTACT_EMAIL_CC.split(',').map(e => e.trim()).filter(e => e)
    : []

  // Create HTML email body
  const htmlBody = createEmailTemplate(name, email, subject, message)
  
  // Create plain text fallback
  const textBody = `${subject}

From: ${name} <${email}>

${message}

---
sandycalhoun.com
Reply to this email to respond directly to ${name}.`

  // Prepare email parameters
  const params = {
    Source: fromEmail,
    Destination: {
      ToAddresses: toEmails,
      ...(ccEmails.length > 0 && { CcAddresses: ccEmails }),
    },
    Message: {
      Subject: {
        Data: subject,
        Charset: 'UTF-8',
      },
      Body: {
        Html: {
          Data: htmlBody,
          Charset: 'UTF-8',
        },
        Text: {
          Data: textBody,
          Charset: 'UTF-8',
        },
      },
    },
    ReplyToAddresses: [email], // Set Reply-To to user's email
  }

  try {
    // Check if credentials are missing before attempting to send
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      throw new Error('AWS credentials are not configured. Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in your .env file.')
    }

    const command = new SendEmailCommand(params)
    const response = await sesClient.send(command)
    return response
  } catch (error) {
    console.error('Error sending email:', error)
    
    // Provide more helpful error messages
    if (error.name === 'InvalidClientTokenId' || error.Code === 'InvalidClientTokenId') {
      throw new Error('Invalid AWS credentials. Please check your AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in your .env file.')
    }
    
    if (error.name === 'InvalidParameterValue' || error.Code === 'InvalidParameterValue') {
      throw new Error(`Invalid email configuration: ${error.message}`)
    }
    
    throw new Error(`Failed to send email: ${error.message || error.Error?.Message || 'Unknown error'}`)
  }
}

