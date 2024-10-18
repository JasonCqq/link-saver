const { SitemapStream, streamToPromise } = require("sitemap");
const { createWriteStream } = require("fs");

const links = [
  { url: "/", changefreq: "weekly", priority: 0.8 },
  { url: "/user", changefreq: "weekly", priority: 0.8 },
  { url: "/folders", changefreq: "daily", priority: 0.8 },
  { url: "/link", changefreq: "daily", priority: 1.0 },
  { url: "/url", changefreq: "daily", priority: 1.0 },
  { url: "/preferences", changefreq: "monthly", priority: 0.6 },
];

const sitemapFile = createWriteStream("./sitemap.xml");

const sitemapStream = new SitemapStream({
  hostname: "https://linkstorage.net",
});

sitemapStream.pipe(sitemapFile);

links.forEach((link) => {
  sitemapStream.write(link);
});

sitemapStream.end();
