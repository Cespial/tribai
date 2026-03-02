#!/bin/bash
# Generates Xcode project from project.yml using XcodeGen
# Install: brew install xcodegen
# Usage: cd ios && ./generate-xcodeproj.sh

set -e

if ! command -v xcodegen &> /dev/null; then
    echo "XcodeGen not found. Installing..."
    brew install xcodegen
fi

echo "Generating Xcode project..."
xcodegen generate

echo "Resolving Swift Package Manager dependencies..."
xcodebuild -resolvePackageDependencies -project SuperAppTributaria.xcodeproj -scheme SuperAppTributaria

echo "Done! Open SuperAppTributaria.xcodeproj"
