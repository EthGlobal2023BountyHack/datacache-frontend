/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: false,
  poweredByHeader: false,
  images: {
    domains: [
      'lh3.googleusercontent.com',
      's.gravatar.com',
      'dweb.link',
      'ipfs.io',
      'i.seadn.io',
      'openseauserdata.com',
      'upload.wikimedia.org',
      'res.cloudinary.com',
      'nft-cdn.alchemy.com',
      'allofthethings.s3.amazonaws.com',
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};
