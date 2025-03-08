/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: [
    '@uiw/react-codemirror',
    '@uiw/codemirror-extensions-basic-setup',
    '@codemirror/state',
    '@codemirror/view',
    '@codemirror/language',
    '@codemirror/commands',
    '@codemirror/theme-one-dark'
  ],
  webpack: (config, { isServer }) => {
    // Fix for CodeMirror ESM/CJS interoperability
    config.resolve.extensionAlias = {
      '.js': ['.js', '.ts', '.tsx']
    }
    return config
  },
  
  // Subdomain configuration
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self' design.onlycodez.com *.design.onlycodez.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' design.onlycodez.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https://lkszdjgdyichfwbkxjwt.supabase.co;",
          },
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
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          }
        ],
      },
    ];
  },
}

module.exports = nextConfig 