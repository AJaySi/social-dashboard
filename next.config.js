/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure output directory
  distDir: '.next',
  // Configure file tracing
  outputFileTracingIncludes: {
    '*': ['./build/**/*']
  },
  // Configure environment variables
  env: {  
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    FIRECRAWL_API_KEY: process.env.FIRECRAWL_API_KEY,
  },
  // Configure runtime config
  publicRuntimeConfig: {
    FIRECRAWL_API_KEY: process.env.FIRECRAWL_API_KEY,
  },
  // Configure images domains for profile pictures
  images: {
    domains: [
      'platform-lookaside.fbsbx.com', // Facebook profile images
      'lh3.googleusercontent.com',     // Google profile images
      'media.licdn.com'               // LinkedIn profile images
    ],
  },
  // Configure redirects
  async redirects() {
    return [
      {
        source: '/auth/error',
        destination: '/?error=true',
        permanent: false,
      },
    ];
  },
  // Configure headers for security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;