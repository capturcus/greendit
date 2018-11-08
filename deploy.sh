#!/bin/bash

# increment build number
buildnum=`cat buildnum.ts|head -2|tail -1`
newbuildnum=$((buildnum+1))
sed -i "2s/./${newbuildnum}/g" buildnum.ts

ng build --prod
rm -rf docs
mv dist docs

git add --all
git commit -m"<deploy>"
git push