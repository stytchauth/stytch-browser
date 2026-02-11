#!/bin/bash

################################################################################
# This script runs a simplified set of checks similar to those in CI. 
# It avoids passing through output if the command is successful to avoid wasting context.
################################################################################

# Don't exit on error immediately - we want to capture all outputs first
set +e

echo "Running checks..."

# Create temporary files for buffering outputs
YARN_OUTPUT=$(mktemp)
BUILD_OUTPUT=$(mktemp)
TYPECHECK_OUTPUT=$(mktemp)
PRETTIER_OUTPUT=$(mktemp)
ESLINT_OUTPUT=$(mktemp)
STRINGS_OUTPUT=$(mktemp)
TEST_OUTPUT=$(mktemp)

# Cleanup function
cleanup() {
    rm -f "$YARN_OUTPUT" "$BUILD_OUTPUT" "$TYPECHECK_OUTPUT" "$PRETTIER_OUTPUT" "$ESLINT_OUTPUT" "$STRINGS_OUTPUT" "$TEST_OUTPUT"
}
trap cleanup EXIT

# Run yarn and yarn build in series, capturing outputs
echo "Installing dependencies..."
yarn > "$YARN_OUTPUT" 2>&1
YARN_EXIT=$?

if [ $YARN_EXIT -ne 0 ]; then
    echo "Yarn install failed:"
    cat "$YARN_OUTPUT"
    exit 1
fi

echo "Building..."
yarn build > "$BUILD_OUTPUT" 2>&1
BUILD_EXIT=$?

if [ $BUILD_EXIT -ne 0 ]; then
    echo "Build failed:"
    cat "$BUILD_OUTPUT"
    exit 1
fi

echo "Running strings verification, typecheck, prettier, eslint, and test in parallel..."

# Run strings, typecheck, prettier, eslint, and test in parallel, capturing outputs
yarn strings > "$STRINGS_OUTPUT" 2>&1 &
STRINGS_PID=$!

yarn typecheck > "$TYPECHECK_OUTPUT" 2>&1 &
TYPECHECK_PID=$!

# Prettier outputs all checked files to stderr, so discard stdout and keep stderr
yarn prettier --write "**/*" >/dev/null 2> "$PRETTIER_OUTPUT" &
PRETTIER_PID=$!

yarn eslint '*/**/*.{js,jsx,ts,tsx}' --fix --max-warnings=0 > "$ESLINT_OUTPUT" 2>&1 &
ESLINT_PID=$!

yarn test > "$TEST_OUTPUT" 2>&1 &
TEST_PID=$!

# Wait for all parallel jobs to complete and check their exit codes
wait $STRINGS_PID
STRINGS_EXIT=$?

wait $TYPECHECK_PID
TYPECHECK_EXIT=$?

wait $PRETTIER_PID
PRETTIER_EXIT=$?

wait $ESLINT_PID
ESLINT_EXIT=$?

wait $TEST_PID
TEST_EXIT=$?

# Check for errors and display buffered output if any command failed
ERRORS_FOUND=0

if [ $STRINGS_EXIT -ne 0 ]; then
    echo "String extraction failed:"
    cat "$STRINGS_OUTPUT"
    echo "\n\n"
    ERRORS_FOUND=1
fi

if [ $TYPECHECK_EXIT -ne 0 ]; then
    echo "Typecheck failed:"
    cat "$TYPECHECK_OUTPUT"
    echo "\n\n"
    ERRORS_FOUND=1
fi

if [ $PRETTIER_EXIT -ne 0 ]; then
    echo "Prettier failed:"
    cat "$PRETTIER_OUTPUT"
    echo "\n\n"
    ERRORS_FOUND=1
fi

if [ $ESLINT_EXIT -ne 0 ]; then
    echo "ESLint failed:"
    cat "$ESLINT_OUTPUT"
    echo "\n\n"
    ERRORS_FOUND=1
fi

if [ $TEST_EXIT -ne 0 ]; then
    echo "Tests failed:"
    cat "$TEST_OUTPUT"
    echo "\n\n"
    ERRORS_FOUND=1
fi

if [ $ERRORS_FOUND -eq 1 ]; then
    exit 1
fi

echo "All checks passed!"
