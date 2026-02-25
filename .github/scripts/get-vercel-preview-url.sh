#!/bin/bash
set -e

# Script to get Vercel preview deployment URL
# Usage: ./get-vercel-preview-url.sh <VERCEL_TOKEN> <PROJECT_ID> <BRANCH>

VERCEL_TOKEN="$1"
PROJECT_ID="$2"
BRANCH="$3"
MAX_ATTEMPTS=30  # 10 minutes max (30 attempts * 20 seconds)
ATTEMPT=0

if [ -z "$VERCEL_TOKEN" ] || [ -z "$PROJECT_ID" ] || [ -z "$BRANCH" ]; then
  echo "Error: Missing required arguments" >&2
  echo "Usage: $0 <VERCEL_TOKEN> <PROJECT_ID> <BRANCH>" >&2
  exit 1
fi

echo "Looking for deployment with ref: $BRANCH" >&2

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
  ATTEMPT=$((ATTEMPT + 1))
  echo "Attempt $ATTEMPT/$MAX_ATTEMPTS: Querying Vercel API..." >&2

  # Query Vercel API for deployments matching the commit SHA
  RESPONSE=$(curl -s -H "Authorization: Bearer $VERCEL_TOKEN" \
    "https://api.vercel.com/v6/deployments?projectId=$PROJECT_ID&branch=$BRANCH&limit=1")

  # Use jq to extract state and URL in one pass
  DEPLOYMENT_STATE=$(echo "$RESPONSE" | jq -r '.deployments[0].readyState // empty')

  if [ -z "$DEPLOYMENT_STATE" ]; then
    echo "No deployment found yet for this commit" >&2
  elif [ "$DEPLOYMENT_STATE" = "READY" ]; then
    DEPLOYMENT_URL="https://$(echo "$RESPONSE" | jq -r '.deployments[0].url')"
    echo "Found READY deployment: $DEPLOYMENT_URL" >&2
    echo "$DEPLOYMENT_URL"
    exit 0
  else
    echo "Deployment found with state: $DEPLOYMENT_STATE (waiting for READY)"
  fi

  if [ $ATTEMPT -lt $MAX_ATTEMPTS ]; then
    echo "Waiting 20 seconds before retry..." >&2
    sleep 20
  fi
done

echo "Error: Timeout waiting for Vercel deployment to be ready" >&2
exit 1
