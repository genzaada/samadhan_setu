#!/bin/bash

# Base URL
BASE_URL="http://localhost:5001/api/auth"

# Random suffix to avoid duplicate email errors
RANDOM_SUFFIX=$((RANDOM % 10000))
EMAIL="verify_user${RANDOM_SUFFIX}@example.com"
PASSWORD="password123"

echo "Testing Registration with email: $EMAIL"
curl -v -X POST "$BASE_URL/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"Verify User\", \"email\": \"$EMAIL\", \"password\": \"$PASSWORD\", \"role\": \"citizen\"}"

echo -e "\n\nTesting Login with email: $EMAIL"
curl -v -X POST "$BASE_URL/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$EMAIL\", \"password\": \"$PASSWORD\"}"

echo -e "\n\nDone."
