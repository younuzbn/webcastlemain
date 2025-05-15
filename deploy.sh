#!/bin/bash

# Create temp directory if it doesn't exist
mkdir -p temp

# Move the problematic morphing demo to temp directory
mv public/morphing-2d-demo-main temp/

# Run build
npm run build

# Move the morphing demo back
mv temp/morphing-2d-demo-main public/

# Run deployment
npx gh-pages -d out

echo "Deployment completed!" 