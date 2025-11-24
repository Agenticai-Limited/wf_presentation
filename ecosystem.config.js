const fs = require('node:fs')
const path = require('node:path')

// Read .env.local file
const envLocalPath = path.join(__dirname, '.env.local')
const envVars = {}

if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf8')
  envContent.split('\n').forEach((line) => {
    line = line.trim()
    if (line && !line.startsWith('#')) {
      const equalIndex = line.indexOf('=')
      if (equalIndex > 0) {
        const key = line.substring(0, equalIndex).trim()
        const value = line.substring(equalIndex + 1).trim()
        if (key && value) {
          envVars[key] = value
        }
      }
    }
  })
}

console.log('Loaded env vars from .env.local:', Object.keys(envVars))

module.exports = {
  apps: [{
    name: 'wf-presentation',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/wf_presentation',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      // Load from .env.local file
      DATABASE_URL: envVars.DATABASE_URL || 'file:/var/www/wf_presentation/data/db.sqlite',
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: envVars.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || 'pk_test_ZXhjaXRlZC1iaXJkLTkxLmNsZXJrLmFjY291bnRzLmRldiQ',
      CLERK_SECRET_KEY: envVars.CLERK_SECRET_KEY || 'sk_test_jwgUVpokOUWv8G2AeoC5lMlDmkP2sbisCquAFb1A82',
      ALLOWED_EMAIL_DOMAINS: envVars.ALLOWED_EMAIL_DOMAINS || 'agenticai.nz',
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
  }],
}
