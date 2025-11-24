import { NextResponse } from 'next/server'
import { getEmailDomainConfig } from '@/lib/auth/email-domain-filter'

export async function GET() {
  // Only show in development or with auth
  const config = getEmailDomainConfig()

  return NextResponse.json({
    allowedDomains: config.allowedDomains,
    hasConfiguration: config.hasConfiguration,
    env: {
      ALLOWED_EMAIL_DOMAINS: process.env.ALLOWED_EMAIL_DOMAINS || 'NOT SET',
      NODE_ENV: process.env.NODE_ENV,
    },
  })
}
