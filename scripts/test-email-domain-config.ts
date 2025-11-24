/**
 * Test script for email domain filtering configuration
 *
 * Run with: npx tsx scripts/test-email-domain-config.ts
 */

import { resolve } from 'node:path'
import { config as dotenvConfig } from 'dotenv'

import { getEmailDomainConfig } from '../lib/auth/email-domain-filter'

// Load .env.local
dotenvConfig({ path: resolve(process.cwd(), '.env.local') })

console.log('=== Email Domain Filtering Configuration Test ===\n')

// Get configuration
const config = getEmailDomainConfig()

console.log('Current Configuration:')
console.log('-'.repeat(50))
console.log(`Has Configuration: ${config.hasConfiguration ? '[YES]' : '[NO] (all domains allowed)'}`)
console.log(`Allowed Domains: ${config.allowedDomains.length > 0 ? config.allowedDomains.join(', ') : '(none - all allowed)'}`)
console.log('-'.repeat(50))

// Test email domain extraction
console.log('\nTesting Email Domain Extraction:\n')

const testEmails = [
  'user@agenticai.nz',
  'admin@example.com',
  'test@gmail.com',
  'invalid-email',
  'user@subdomain.agenticai.nz',
]

testEmails.forEach((email) => {
  const domain = email.split('@')[1]?.toLowerCase() || ''
  const isAllowed = config.allowedDomains.length === 0 || config.allowedDomains.includes(domain)
  const status = isAllowed ? '[ALLOWED]' : '[DENIED]'

  console.log(`${status} - ${email}`)
  if (domain) {
    console.log(`   Domain: ${domain}`)
  }
  else {
    console.log('   Invalid email format')
  }
})

console.log('\nNotes:')
console.log('- Paid Clerk users bypass domain filtering')
console.log('- Set ALLOWED_EMAIL_DOMAINS in .env.local to configure')
console.log('- Format: comma-separated domains (e.g., "agenticai.nz,example.com")')
console.log('- Leave empty to allow all domains\n')

// Environment variable check
console.log('Environment Variables:')
console.log('-'.repeat(50))
console.log(`ALLOWED_EMAIL_DOMAINS: ${process.env.ALLOWED_EMAIL_DOMAINS || '(not set)'}`)
console.log(`CLERK_SECRET_KEY: ${process.env.CLERK_SECRET_KEY ? '[Set]' : '[Not set]'}`)
console.log(`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: ${process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? '[Set]' : '[Not set]'}`)
console.log('-'.repeat(50))
