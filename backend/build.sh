#!/usr/bin/env bash
set -o errexit

npm install
npm run build


pip install -r requirements.txt

python manage.py collectstatic --no-input
python manage.py migrate
