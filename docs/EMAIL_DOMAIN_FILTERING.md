# Email Domain Filtering

This document explains the email domain filtering feature that restricts access based on user email domains and Clerk subscription status.

## Overview

The application implements a two-tier access control system:

1. **Paid Clerk Users**: Always have access regardless of their email domain
2. **Free Users**: Only have access if their email domain is in the allowed list

## Configuration

### Environment Variables

Configure allowed email domains in `.env.local`:

```bash
# Single domain
ALLOWED_EMAIL_DOMAINS=agenticai.nz

# Multiple domains (comma-separated)
ALLOWED_EMAIL_DOMAINS=agenticai.nz,example.com,mycompany.com

# Allow all domains (empty or not set)
ALLOWED_EMAIL_DOMAINS=
```

### Clerk Subscription Metadata

To mark a user as "paid" in Clerk, you need to set their `publicMetadata`. The system checks for any of these metadata patterns:

```json
{
  "subscriptionTier": "paid" | "pro" | "premium"
}
```

or

```json
{
  "isPaid": true
}
```

or

```json
{
  "plan": "pro" | "premium"
}
```

#### Setting Metadata via Clerk Dashboard

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Navigate to Users
3. Select a user
4. Go to "Metadata" tab
5. Add to "Public metadata":
   ```json
   {
     "subscriptionTier": "paid"
   }
   ```

#### Setting Metadata via Clerk API

```typescript
import { clerkClient } from '@clerk/nextjs/server';

await clerkClient.users.updateUserMetadata(userId, {
  publicMetadata: {
    subscriptionTier: 'paid'
  }
});
```

## How It Works

### Middleware Flow

1. User tries to access a protected route
2. Clerk middleware authenticates the user
3. Email domain filter checks:
   - Is user a paid subscriber? → ✅ Allow access
   - Is user's email domain in `ALLOWED_EMAIL_DOMAINS`? → ✅ Allow access
   - Otherwise → ❌ Redirect to `/access-denied`

### Code Structure

```
lib/auth/email-domain-filter.ts    # Core filtering logic
middleware.ts                       # Integration with Clerk
app/access-denied/page.tsx          # Access denied page
```

### Key Functions

#### `checkEmailDomainAccess()`

Main function that checks if a user has access:

```typescript
const result = await checkEmailDomainAccess();

// Result format:
{
  allowed: boolean,
  reason: 'paid_user' | 'allowed_domain' | 'not_allowed',
  userEmail?: string,
  userDomain?: string
}
```

#### `getEmailDomainConfig()`

Get current configuration (useful for debugging):

```typescript
const config = getEmailDomainConfig();
// Returns: { allowedDomains: string[], hasConfiguration: boolean }
```

## Testing

### Test Scenario 1: Paid User

1. Create a test user in Clerk
2. Set `publicMetadata.subscriptionTier = "paid"`
3. Login with any email domain
4. ✅ Should have access

### Test Scenario 2: Free User with Allowed Domain

1. Create a test user with email: `user@agenticai.nz`
2. Don't set any subscription metadata
3. Ensure `.env.local` has `ALLOWED_EMAIL_DOMAINS=agenticai.nz`
4. Login
5. ✅ Should have access

### Test Scenario 3: Free User with Disallowed Domain

1. Create a test user with email: `user@gmail.com`
2. Don't set any subscription metadata
3. Ensure `.env.local` has `ALLOWED_EMAIL_DOMAINS=agenticai.nz`
4. Login
5. ❌ Should be redirected to `/access-denied`

## Customization

### Adding More Subscription Tiers

Edit `lib/auth/email-domain-filter.ts` in the `isPaidUser()` function:

```typescript
function isPaidUser(user: any): boolean {
  const metadata = user.publicMetadata;

  return (
    // Add your custom logic here
    metadata?.customField === 'premium' ||
    metadata?.subscriptionLevel > 0
    // ...
  );
}
```

### Custom Access Denied Page

Edit `app/access-denied/page.tsx` to customize the UI and messaging.

### Different Domain Lists per Environment

```bash
# .env.local (development)
ALLOWED_EMAIL_DOMAINS=agenticai.nz,test.com

# .env.production (production)
ALLOWED_EMAIL_DOMAINS=agenticai.nz,mycompany.com
```

## Security Considerations

1. **Email Verification**: Ensure Clerk email verification is enabled to prevent domain spoofing
2. **Metadata Security**: `publicMetadata` is read-only for users but can be modified by admins via API
3. **Environment Variables**: Keep `.env.local` in `.gitignore` and use secure environment variable management in production

## Troubleshooting

### Issue: User has correct domain but still denied access

**Check:**
- Is `ALLOWED_EMAIL_DOMAINS` properly set in `.env.local`?
- Did you restart the dev server after changing `.env.local`?
- Is the email address verified in Clerk?

```bash
# Verify config
node -e "console.log(process.env.ALLOWED_EMAIL_DOMAINS)"
```

### Issue: Paid user is being denied access

**Check:**
- Verify user's `publicMetadata` in Clerk Dashboard
- Ensure one of the supported metadata patterns is set
- Check browser console for any errors

### Issue: Everyone is being allowed

**Check:**
- If `ALLOWED_EMAIL_DOMAINS` is empty or not set, all domains are allowed by default
- This is intended behavior for backwards compatibility

## Migration Notes

This feature replaced the old local user authentication system:
- ✅ User table removed from database
- ✅ All authentication now handled by Clerk
- ✅ Email domain filtering replaces old access control
- ✅ No user passwords stored locally

## API Integration

If you need to check access in API routes:

```typescript
import { checkEmailDomainAccess } from '@/lib/auth/email-domain-filter';

export async function GET() {
  const accessCheck = await checkEmailDomainAccess();

  if (!accessCheck.allowed) {
    return NextResponse.json(
      { error: 'Access denied', reason: accessCheck.reason },
      { status: 403 }
    );
  }

  // Continue with API logic
}
```

## Support

For issues or questions:
1. Check this documentation
2. Review middleware.ts and email-domain-filter.ts
3. Check Clerk Dashboard for user metadata
4. Verify environment variables are set correctly
