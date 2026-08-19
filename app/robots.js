// ABOUTME: Generates /robots.txt — search engines are welcome, known AI-training
// ABOUTME: crawlers are asked not to scrape. Voluntary by nature; well-behaved bots only.
export default function robots() {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      {
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "OAI-SearchBot",
          "ClaudeBot",
          "Claude-Web",
          "anthropic-ai",
          "CCBot",
          "Google-Extended",
          "Applebot-Extended",
          "Bytespider",
          "PerplexityBot",
          "Meta-ExternalAgent",
          "Meta-ExternalFetcher",
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
