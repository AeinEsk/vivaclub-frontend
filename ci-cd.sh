#!/bin/bash

# Exit on any error
set -e
yarn install
echo "🏗️ Building React application..."
npm run build

echo "📂 Uploading build to S3..."
# Upload to S3 using viva-club profile
aws s3 sync dist/ s3://motor-cultures-hosting-origin --delete --profile viva-club

echo "🔄 Invalidating CloudFront cache..."
# Create invalidation for all files
aws cloudfront create-invalidation \
    --distribution-id EZWBE1J9CTF13 \
    --paths "/*" \
    --profile viva-club

echo "✅ Deployment complete!"
