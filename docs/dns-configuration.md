# DNS Configuration for chub.app

## Overview

This document describes the DNS configuration required for the multi-tenant subdomain setup using `chub.app`.

## Required DNS Records

### Wildcard A Record

Configure a wildcard DNS record to point all subdomains to your server:

```
Type: A
Name: *.chub.app
Value: <your-server-ip>
TTL: 3600
```

### Root Domain A Record

```
Type: A
Name: chub.app
Value: <your-server-ip>
TTL: 3600
```

### CNAME Record (Alternative for CDN/Hosting)

If using a CDN or cloud hosting provider:

```
Type: CNAME
Name: *.chub.app
Value: <your-cdn-or-hosting-domain>
TTL: 3600
```

## SSL Certificate

### For Vercel Deployment
SSL certificates are automatically provisioned for all subdomains when using Vercel. No additional configuration is needed.

### For Custom Server Deployment
Use Let's Encrypt or your SSL provider to obtain a wildcard certificate:

```bash
# Using certbot
sudo certbot certonly --manual --preferred-challenges dns -d "*.chub.app" -d "chub.app"
```

## Configuration in Application

The application is already configured to handle subdomain routing:

1. **Base Domain**: Set to `chub.app` in production mode
2. **Subdomain Detection**: Middleware extracts organization slug from subdomain
3. **Organization Lookup**: Maps subdomain to organization via `slug` field

### Environment Variables

Ensure these are set in production:

```env
NODE_ENV=production
BASE_URL=https://chub.app
```

## Testing

After DNS propagation, test subdomain routing:

```bash
# Test wildcard DNS resolution
nslookup grace-chapel.chub.app

# Test SSL certificate
openssl s_client -connect grace-chapel.chub.app:443 -servername grace-chapel.chub.app

# Test application routing
curl -H "Host: grace-chapel.chub.app" https://chub.app/api/auth/user
```

## Troubleshooting

### DNS Not Resolving
- Check DNS propagation: `dig *.chub.app`
- Verify A/CNAME records in DNS provider
- Wait for TTL expiration (up to 48 hours for full propagation)

### SSL Certificate Issues
- Ensure wildcard certificate covers `*.chub.app`
- Check certificate chain is complete
- Verify certificate is not expired

### Subdomain Not Detected
- Check `Host` header is correctly forwarded
- Verify organization exists with matching `slug`
- Check organization `isActive` status
