#!/bin/sh
RECAPTCHA_VERSION=$1
if [ -z "$RECAPTCHA_VERSION" ]
then
    echo "Must supply a recaptcha version to proceed"
    exit 1
fi

# Download, extract, and rename RecaptchaEnterprise library
XCFRAMEWORK_URL="https://dl.google.com/recaptchaenterprise/v$RECAPTCHA_VERSION/RecaptchaEnterprise_iOS_xcframework/recaptcha-xcframework.xcframework.zip"
echo "### Downloading XCFramework..."
curl $XCFRAMEWORK_URL -o recaptcha-enterprise.zip
echo "### Freshening files..."
unzip -u recaptcha-enterprise.zip
echo "### Cleaning up"
rm recaptcha-enterprise.zip
