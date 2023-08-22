const withMDX = require('@next/mdx')({
  extension: /\.md$/,
  options: {
    remarkPlugins: [async () => (await import('remark-react'))()],
  },
});

module.exports = withMDX({
  async rewrites() {
    return [
      {
        source: "/page/:pageNumber",
        destination: "/page/[pageNumber]",
      },
      {
        source: '/rss.xml',
        destination: '/api/rss',
      },
    ];
    },
});
