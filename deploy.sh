#!/bin/bash

npx ts-node WriteLastUpdatedDate.ts

read -p "コミットメッセージを入力してください： " commitMsg
git add .
git commit -m "$commitMsg"
git push origin HEAD


