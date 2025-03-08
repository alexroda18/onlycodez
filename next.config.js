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
  }
}

module.exports = nextConfig 