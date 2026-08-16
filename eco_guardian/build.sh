#!/usr/bin/env bash
# exit on error
set -o errexit

pip install -r requirements.txt

python manage.py collectstatic --no-input
python manage.py migrate

# Auto-create a default superuser for the Free Tier since Shell access is disabled
python manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.filter(email='admin@example.com').exists() or User.objects.create_superuser('admin@example.com', 'Admin', 'admin123')"
