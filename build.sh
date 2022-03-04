#!/bin/bash

rm -rf ./build

./node_modules/typescript/bin/tsc -p ./tsconfig.json

cp ./package.json ./build
