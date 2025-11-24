/**
 * Test script to verify email domain filter logic
 * Run with: npx tsx scripts/test-email-filter-logic.ts
 */

import { resolve } from 'node:path'
import { config as dotenvConfig } from 'dotenv'

import { checkEmailDomainAccessForUser } from '../lib/auth/email-domain-filter'

// Load .env.local
dotenvConfig({ path: resolve(process.cwd(), '.env.local') })

console.log('=== Email Domain Filter Logic Test ===\n')

// Mock Clerk user objects for testing
function createMockUser(email: string, metadata: any = {}) {
  return {
    id: 'test-user-id',
    primaryEmailAddressId: 'email-1',
    emailAddresses: [
      {
        id: 'email-1',
        emailAddress: email,
      },
    ],
    publicMetadata: metadata,
  }
}

// Test cases
const testCases = [
  {
    name: 'Free user with allowed domain (@agenticai.nz)',
    user: createMockUser('user@agenticai.nz'),
    expectedAllowed: true,
    expectedReason: 'allowed_domain',
  },
  {
    name: 'Free user with disallowed domain (@gmail.com)',
    user: createMockUser('user@gmail.com'),
    expectedAllowed: false,
    expectedReason: 'not_allowed',
  },
  {
    name: 'Paid user with allowed domain (@agenticai.nz)',
    user: createMockUser('paid@agenticai.nz', { subscriptionTier: 'paid' }),
    expectedAllowed: true,
    expectedReason: 'paid_user',
  },
  {
    name: 'Paid user with disallowed domain (@gmail.com)',
    user: createMockUser('paid@gmail.com', { subscriptionTier: 'paid' }),
    expectedAllowed: true,
    expectedReason: 'paid_user',
  },
  {
    name: 'Pro user with any domain',
    user: createMockUser('pro@example.com', { subscriptionTier: 'pro' }),
    expectedAllowed: true,
    expectedReason: 'paid_user',
  },
  {
    name: 'User with isPaid=true flag',
    user: createMockUser('user@random.com', { isPaid: true }),
    expectedAllowed: true,
    expectedReason: 'paid_user',
  },
]

let passed = 0
let failed = 0

console.log('Running test cases...\n')
console.log('-'.repeat(70))

testCases.forEach((testCase, index) => {
  const result = checkEmailDomainAccessForUser(testCase.user as any)

  const success
    = result.allowed === testCase.expectedAllowed
      && result.reason === testCase.expectedReason

  if (success) {
    console.log(`[PASS] Test ${index + 1}: ${testCase.name}`)
    console.log(`   Result: ${result.reason} (allowed: ${result.allowed})`)
    passed++
  }
  else {
    console.log(`[FAIL] Test ${index + 1}: ${testCase.name}`)
    console.log(`   Expected: ${testCase.expectedReason} (allowed: ${testCase.expectedAllowed})`)
    console.log(`   Got: ${result.reason} (allowed: ${result.allowed})`)
    failed++
  }
  console.log('-'.repeat(70))
})

// Test null user
console.log('\nEdge case: null user')
const nullResult = checkEmailDomainAccessForUser(null)
if (!nullResult.allowed && nullResult.reason === 'not_allowed') {
  console.log('[PASS] Null user correctly denied access')
  passed++
}
else {
  console.log('[FAIL] Null user test failed')
  failed++
}

// Summary
console.log('\nTest Summary:')
console.log('-'.repeat(70))
console.log(`Total Tests: ${testCases.length + 1}`)
console.log(`Passed: ${passed}`)
console.log(`Failed: ${failed}`)
console.log('-'.repeat(70))

if (failed === 0) {
  console.log('\nAll tests passed!')
  process.exit(0)
}
else {
  console.log('\nSome tests failed!')
  process.exit(1)
}
