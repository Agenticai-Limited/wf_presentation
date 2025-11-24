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
      // Database
      DATABASE_URL: 'file:/var/www/wf_presentation/data/db.sqlite',
      // Clerk Authentication - REPLACE WITH YOUR PRODUCTION KEYS
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || 'pk_test_ZXhjaXRlZC1iaXJkLTkxLmNsZXJrLmFjY291bnRzLmRldiQ',
      CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY || 'sk_test_jwgUVpokOUWv8G2AeoC5lMlDmkP2sbisCquAFb1A82',
      // Email Domain Filtering
      ALLOWED_EMAIL_DOMAINS: process.env.ALLOWED_EMAIL_DOMAINS || 'agenticai.nz'
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true
  }]
};
