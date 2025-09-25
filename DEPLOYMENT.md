# Cloudflare Pages Deployment Guide

## Prerequisites
Make sure you have Wrangler CLI installed:
```bash
npm install -g wrangler
```

## Authentication
First, authenticate with Cloudflare:
```bash
npx wrangler login
```

## Deployment Steps

### Option 1: Automated Deployment (Recommended)
```bash
npm run deploy
```

### Option 2: Manual Steps
1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy to Cloudflare Pages:
   ```bash
   npx wrangler pages deploy out
   ```

### Option 3: Direct Wrangler Deploy
```bash
npm run cf:deploy
```

## Configuration Notes

- **Static Export**: The app is configured for static export in `next.config.ts`
- **Output Directory**: Build outputs to `out/` directory
- **Images**: Unoptimized for static hosting compatibility
- **Build Command**: Uses `npm run build` which creates a static export

## Troubleshooting

### Common Issues:
1. **"No pages_build_output_dir specified"**: Make sure `wrangler.jsonc` exists with proper configuration
2. **Build failures**: Check that all dependencies are installed with `npm install`
3. **Authentication errors**: Run `npx wrangler login` to authenticate

### Environment Variables
If you need environment variables in production, add them to your Cloudflare Pages dashboard under Settings > Environment Variables.

## Alternative: GitHub Integration
You can also connect your GitHub repository to Cloudflare Pages for automatic deployments:
1. Go to Cloudflare Pages dashboard
2. Connect to Git
3. Select your repository
4. Set build command: `npm run build`
5. Set output directory: `out`
