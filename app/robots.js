// ABOUTME: Generates /robots.txt — search engines and on-demand AI agents (the kind that
// ABOUTME: fetch a page because a user asked about it) are welcome; bulk AI-training crawlers are not.
export default function robots() {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      {
        // Crawlers whose stated purpose is harvesting content for model training
        // (as opposed to live retrieval on behalf of a user's own request).
        userAgent: [
          "GPTBot",
          "ClaudeBot",
          "anthropic-ai",
          "CCBot",
          "Google-Extended",
          "Applebot-Extended",
          "Bytespider",
          "Meta-ExternalAgent",
          "Diffbot",
          "Timpibot",
          "YouBot",
          "cohere-ai",
          "omgili",
          "omgilibot",
        ],
        disallow: "/",
      },
    ],
  };
}
