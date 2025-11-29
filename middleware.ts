import process from 'node:process'
import { clerkClient, clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

/**
 * Email Domain Filter - Best Practice Implementation
 *
 * This middleware handles authentication AND email domain filtering.
 * Uses Clerk Client to fetch user data for email domain validation.
 */

// Define public routes
const isPublicRoute = createRouteMatcher([
  '/p/(.*)',
  '/api/flowcharts/(.*)/(.*)',
  '/api/debug/env',
  '/access-denied',
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
])

function getAllowedDomains(): string[] {
  const domainsEnv = process.env.ALLOWED_EMAIL_DOMAINS || ''
  return domainsEnv
    .split(',')
    .map(domain => domain.trim())
    .filter(domain => domain.length > 0)
}

function extractDomain(email: string): string {
  const parts = email.split('@')
  return parts.length === 2 ? parts[1].toLowerCase() : ''
}

function isPaidUser(metadata: any): boolean {
  return (
    metadata?.subscriptionTier === 'paid'
    || metadata?.subscriptionTier === 'pro'
    || metadata?.subscriptionTier === 'premium'
    || metadata?.isPaid === true
    || metadata?.plan === 'pro'
    || metadata?.plan === 'premium'
  )
}

export default clerkMiddleware(async (auth, request) => {
  // Allow public routes
  if (isPublicRoute(request)) {
    return NextResponse.next()
  }

  // Require authentication
  await auth.protect()

  // Get userId from auth
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.next() // protect() should have handled this
  }

  try {
    // Fetch user data from Clerk
    const client = await clerkClient()
    const user = await client.users.getUser(userId)

    if (!user) {
      console.error('[EmailDomainFilter] User not found')
      return NextResponse.redirect(new URL('/access-denied?reason=not_allowed', request.url))
    }

    // Get primary email
    const primaryEmail = user.emailAddresses.find(
      email => email.id === user.primaryEmailAddressId,
    )

    if (!primaryEmail) {
      console.error('[EmailDomainFilter] No primary email')
      return NextResponse.redirect(new URL('/access-denied?reason=not_allowed', request.url))
    }

    const email = primaryEmail.emailAddress
    const userDomain = extractDomain(email)

    // Check if paid user
    if (isPaidUser(user.publicMetadata)) {
      console.error('[EmailDomainFilter] Paid user granted:', email)
      return NextResponse.next()
    }

    // Check domain
    const allowedDomains = getAllowedDomains()

    if (allowedDomains.length === 0) {
      // No restrictions
      return NextResponse.next()
    }

    const isAllowed = allowedDomains.includes(userDomain)

    console.error('[EmailDomainFilter] Domain check:', {
      email,
      userDomain,
      allowedDomains,
      isAllowed,
    })

    if (!isAllowed) {
      const params = new URLSearchParams({
        reason: 'not_allowed',
        email,
      })
      return NextResponse.redirect(new URL(`/access-denied?${params.toString()}`, request.url))
    }

    // Access granted
    return NextResponse.next()
  }
  catch (error) {
    console.error('[EmailDomainFilter] Error:', error)
    // On error, deny access to be safe
    return NextResponse.redirect(new URL('/access-denied?reason=not_allowed', request.url))
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
