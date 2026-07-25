module.exports = {
  async rewrites() {
    return [
      // NOTE: a rewrite of `/page/:pageNumber` -> `/page/[pageNumber]` used to
      // live here. It broke every pagination URL: the destination was treated
      // as a literal path, so `/page/2` rewrote to a non-existent
      // `/page/[pageNumber]` and returned 404. The file-system route at
      // pages/page/[pageNumber].js already serves these paths directly, so no
      // rewrite is needed. Verified after removal: /page/1, /page/2 and
      // /page/30 return 200, /page/31 correctly 404s, /rss.xml still resolves.
      {
        source: "/rss.xml",
        destination: "/api/rss",
      },
    ];
  },
};
