module.exports = {
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
};
