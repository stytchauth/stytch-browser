// @ts-check

import generated from '@next/bundle-analyzer';

const withBundleAnalyzer = generated({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

export default withBundleAnalyzer(nextConfig);
