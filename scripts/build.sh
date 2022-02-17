#!/usr/bin/env bash

PROJECT_DIRECTORY=$(pwd)
BUILD_DIRECTORY=$(pwd)/build

echo "Start building...."
echo "- project directory: $PROJECT_DIRECTORY"
echo "- build directory: $BUILD_DIRECTORY"

# Clean previous build
echo "Clean previous build...."
rm -rf $BUILD_DIRECTORY

# Build
echo "Build...."
yarn build

# Copy files
echo "Copying assets..."
cp $PROJECT_DIRECTORY/package.json $BUILD_DIRECTORY

echo "DONE"
ls -lfa $BUILD_DIRECTORY
