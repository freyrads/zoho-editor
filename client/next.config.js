/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: process.env.BASE_PATH === '/' ? '' : (process.env.BASE_PATH || '/home'),
}

module.exports = nextConfig
