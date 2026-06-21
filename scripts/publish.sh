#!/bin/bash

# Local publish script (for testing)
# Usage: ./scripts/publish.sh 0.3.0

VERSION=$1

if [ -z "$VERSION" ]; then
  echo "❌ Error: version not provided"
  echo "Usage: ./scripts/publish.sh <version>"
  echo "Example: ./scripts/publish.sh 0.3.0"
  exit 1
fi

# Validate version format
if ! [[ $VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "❌ Error: invalid version. Use the X.Y.Z format (e.g. 0.3.0)"
  exit 1
fi

echo "📦 Starting publish for version $VERSION..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci || exit 1

# Compile
echo "🔨 Compiling extension..."
npm run compile || exit 1

# Tests
echo "🧪 Running tests..."
npm run test || echo "⚠️  Tests failed, but continuing..."

# Update version
echo "📝 Updating version in package.json..."
npm version $VERSION --no-git-tag-version || exit 1

# Update launch.json
echo "📝 Syncing version to .vscode/launch.json..."
node .changeset/update-versions.js || exit 1

# Commit
echo "📤 Committing changes..."
git add package.json .vscode/launch.json
git commit -m "chore: bump version to $VERSION" || exit 1

# Tag
echo "🏷️  Creating tag..."
git tag -a v$VERSION -m "Release v$VERSION" || exit 1

echo ""
echo "✅ Local: publish prepared!"
echo ""
echo "Next steps:"
echo "1. Review the changes: git log -1 && git diff HEAD~1"
echo "2. Push: git push origin main && git push origin v$VERSION"
echo "3. Publish: vsce publish --pat <VSCE_TOKEN>"
echo ""
echo "Or use GitHub Actions to automate!"
