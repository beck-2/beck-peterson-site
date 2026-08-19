// ABOUTME: Site navigation bar, sticky at the top of every page.
import ThemeToggle from "@/components/ThemeToggle";

export default function Nav() {
  return (
    <header className="site-header">
      <div className="name stamp">Beck Peterson</div>
      <nav>
        <a href="#about" className="current">about</a>
        <a href="#projects">projects</a>
        <a href="#travel">travel</a>
        <a href="#favorites">favorites</a>
        <a href="#stats">stats</a>
        <a href="#facts">fun links</a>
        <a href="#contact">contact</a>
        <ThemeToggle />
      </nav>
    </header>
  );
}
