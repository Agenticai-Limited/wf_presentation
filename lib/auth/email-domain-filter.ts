/**
 * Email Domain Filter Configuration
 *
 * This module handles email domain filtering for user access:
 * - Paid Clerk users can access regardless of domain
 * - Free users must have an email from allowed domains (configured via env)
 */

import type { User } from '@clerk/nextjs/server'
import { currentUser } from '@clerk/nextjs/server'

/**
 * Get allowed email domains from environment variable
 * Format: comma-separated list of domains (e.g., "agenticai.nz,example.com")
 */
function getAllowedDomains(): string[] {
  const domainsEnv = process.env.ALLOWED_EMAIL_DOMAINS || ''
  return domainsEnv
    .split(',')
    .map(domain => domain.trim())
    .filter(domain => domain.length > 0)
}

/**
 * Extract email domain from an email address
 * Example: "user@agenticai.nz" -> "agenticai.nz"
 */
function extractDomain(email: string): string {
  const parts = email.split('@')
  return parts.length === 2 ? parts[1].toLowerCase() : ''
}

/**
 * Check if user is a paid Clerk subscriber
 * This checks the user's publicMetadata for subscription status
 */
function isPaidUser(user: any): boolean {
  // Check if user has paid subscription in publicMetadata
  const metadata = user.publicMetadata

  // You can customize this based on your Clerk metadata structure
  // Common patterns:
  // - metadata.subscriptionTier === 'paid' | 'pro' | 'premium'
  // - metadata.isPaid === true
  // - metadata.plan === 'pro'

  return (
    metadata?.subscriptionTier === 'paid'
    || metadata?.subscriptionTier === 'pro'
    || metadata?.subscriptionTier === 'premium'
    || metadata?.isPaid === true
    || metadata?.plan === 'pro'
    || metadata?.plan === 'premium'
  )
}

/**
 * Check if user's email domain is in the allowed list
 */
function isEmailDomainAllowed(email: string, allowedDomains: string[]): boolean {
  if (allowedDomains.length === 0) {
    // If no domains configured, allow all
    return true
  }

  const userDomain = extractDomain(email)
  return allowedDomains.includes(userDomain)
}

export interface EmailDomainCheckResult {
  allowed: boolean
  reason: 'paid_user' | 'allowed_domain' | 'not_allowed'
  userEmail?: string
  userDomain?: string
}

/**
 * Core logic to check if user has access based on email domain filtering
 *
 * @param user - The Clerk user object
 * @returns EmailDomainCheckResult with access status and reason
 */
export function checkEmailDomainAccessForUser(user: User | null): EmailDomainCheckResult {
  try {
    if (!user) {
      return {
        allowed: false,
        reason: 'not_allowed',
      }
    }

    const primaryEmail = user.emailAddresses.find(
      email => email.id === user.primaryEmailAddressId,
    )

    if (!primaryEmail) {
      return {
        allowed: false,
        reason: 'not_allowed',
      }
    }

    const userEmail = primaryEmail.emailAddress
    const userDomain = extractDomain(userEmail)

    // Check if user is paid - paid users always have access
    if (isPaidUser(user)) {
      return {
        allowed: true,
        reason: 'paid_user',
        userEmail,
        userDomain,
      }
    }

    // Check if email domain is in allowed list
    const allowedDomains = getAllowedDomains()
    const domainAllowed = isEmailDomainAllowed(userEmail, allowedDomains)

    return {
      allowed: domainAllowed,
      reason: domainAllowed ? 'allowed_domain' : 'not_allowed',
      userEmail,
      userDomain,
    }
  }
  catch (error) {
    console.error('Error checking email domain access:', error)
    return {
      allowed: false,
      reason: 'not_allowed',
    }
  }
}

/**
 * Check email domain access for the current user (Server Component/Route Handler)
 * Note: This cannot be called from middleware - use checkEmailDomainAccessForUser instead
 *
 * @returns EmailDomainCheckResult with access status and reason
 */
export async function checkEmailDomainAccess(): Promise<EmailDomainCheckResult> {
  try {
    const user = await currentUser()
    return checkEmailDomainAccessForUser(user)
  }
  catch (error) {
    console.error('Error checking email domain access:', error)
    return {
      allowed: false,
      reason: 'not_allowed',
    }
  }
}

/**
 * Get configuration info (for debugging/admin purposes)
 */
export function getEmailDomainConfig() {
  return {
    allowedDomains: getAllowedDomains(),
    hasConfiguration: getAllowedDomains().length > 0,
  }
}
