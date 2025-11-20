/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    const id = process.env.HOSTED_MANIFEST_ID
    if (!id) return []
    return [
      {
        source: '/.well-known/farcaster.json',
        destination: `https://api.farcaster.xyz/miniapps/hosted-manifest/${id}`,
        permanent: false,
      },
    ]
  },
}

module.exports = nextConfig

