// ABOUTME: Root layout for the site — wires up global styles and page metadata.
// ABOUTME: Every route renders inside this shell.
import "./globals.css";

export const metadata = {
  title: "Beck Peterson",
  description: "A little observer of a big universe.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
