// ABOUTME: Root layout for the site — wires up global styles and page metadata.
// ABOUTME: Every route renders inside this shell.
import "./globals.css";

export const metadata = {
  metadataBase: new URL("https://beckpeterson.me"),
  title: "Beck Peterson",
  description: "A little observer of a big universe.",
};

// Runs before first paint so an explicit light/dark choice from a previous
// visit applies immediately — otherwise the page would flash the OS-default
// theme before ThemeToggle's own effect could catch up.
const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem("theme");
    if (stored === "dark" || stored === "light") {
      document.documentElement.setAttribute("data-theme", stored);
    }
  } catch (e) {}
})();
`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
