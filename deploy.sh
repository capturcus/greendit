#!/bin/bash

set -e

# increment build number
buildnum=`cat buildnum.ts|head -2|tail -1`
newbuildnum=$((buildnum+1))
sed -i "2s/./${newbuildnum}/g" buildnum.ts

ng build --prod --base-href "/greendit/" --deploy-url "/greendit/"
rm -rf docs
mv dist docs
mv docs/greendit/* docs
rm -rf docs/greendit

git add --all
git commit -m"<deploy>"
git push