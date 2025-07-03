#!/usr/bin/env

# Prompt the user which folder to upload
FOLDER_NAME="./_site"
AWS_BUCKET_URL="s3://gofranz.com"
PROFILE_NAME="f-a.nz"
CLOUDFRONT_ID="E39BB7KBN2R6LQ"

# Gulp
guix shell node pnpm imagemagick graphicsmagick -- pnpm run build:assets || exit 1

# Site
guix shell ruby@3.1 make gcc-toolchain -- sh -c "export BUNDLE_PATH=.bundle && bundle install && bundle exec jekyll build -d $FOLDER_NAME" || exit 1

echo "Using AWS profile: $PROFILE_NAME"
echo "Uploading folder: $FOLDER_NAME"
echo "Destination: $AWS_BUCKET_URL"

# Upload the folder to S3 using AWS CLI
guix shell awscli -- aws s3 sync $FOLDER_NAME $AWS_BUCKET_URL --profile $PROFILE_NAME --content-type "text/html; charset=utf-8" --exclude "*" --include "*.html"
guix shell awscli -- aws s3 sync $FOLDER_NAME $AWS_BUCKET_URL --profile $PROFILE_NAME --delete

# Invalidate CloudFront (Uncomment if you need this)
guix shell awscli -- aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_ID --paths "/*" --profile $PROFILE_NAME

echo "Deployment complete! CloudFront invalidation is in progress."