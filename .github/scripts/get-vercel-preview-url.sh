#!/bin/bash
set -e

# Script to get Vercel preview deployment URL
# Required ENV var: VERCEL_TOKEN
# Usage: ./get-vercel-preview-url.sh <PROJECT_ID> <BRANCH>

PROJECT_ID="$2"
BRANCH="$3"
MAX_ATTEMPTS=30  # 10 minutes max (30 attempts * 20 seconds)
ATTEMPT=0

if [ -z "$VERCEL_TOKEN" ]; then
  echo "Error: Missing VERCEL_TOKEN env"
  exit 1;
fi

if [ -z "$PROJECT_ID" ] || [ -z "$BRANCH" ]; then
  echo "Error: Missing required arguments" >&2
  echo "Usage: $0 <PROJECT_ID> <BRANCH>" >&2
  exit 1
fi

echo "Looking for deployment with ref: $BRANCH" >&2

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
  ATTEMPT=$((ATTEMPT + 1))
  echo "Attempt $ATTEMPT/$MAX_ATTEMPTS: Querying Vercel API..." >&2

  # Query Vercel API for deployments matching the branch, sorted by creation time (newest first)
  RESPONSE=$(curl -s -H "Authorization: Bearer $VERCEL_TOKEN" \
    "https://api.vercel.com/v6/deployments?projectId=$PROJECT_ID&branch=$BRANCH&limit=100")

  # Sort deployments by createdAt (descending) and extract the latest READY deployment
  DEPLOYMENT_URL=$(echo "$RESPONSE" | jq -r '
    .deployments
    | sort_by(.created)
    | reverse
    | map(select(.readyState == "READY"))
    | .[0].url // empty
  ')

  if [ -z "$DEPLOYMENT_URL" ]; then
    # Check if there are any deployments at all
    DEPLOYMENT_COUNT=$(echo "$RESPONSE" | jq -r '.deployments | length')
    if [ "$DEPLOYMENT_COUNT" -eq 0 ]; then
      echo "No deployment found yet for this branch" >&2
    else
      LATEST_STATE=$(echo "$RESPONSE" | jq -r '.deployments | sort_by(.created) | reverse | .[0].readyState // empty')
      echo "Latest deployment found with state: $LATEST_STATE (waiting for READY)" >&2
    fi
  else
    echo "Found READY deployment: https://$DEPLOYMENT_URL" >&2
    echo "https://$DEPLOYMENT_URL"
    exit 0
  fi

  if [ $ATTEMPT -lt $MAX_ATTEMPTS ]; then
    echo "Waiting 20 seconds before retry..." >&2
    sleep 20
  fi
done

echo "Error: Timeout waiting for Vercel deployment to be ready" >&2
exit 1
