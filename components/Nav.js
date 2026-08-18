// ABOUTME: Site navigation bar, sticky at the top of every page.
export default function Nav() {
  return (
    <header className="site-header">
      <div className="name stamp">Beck Peterson</div>
      <nav>
        <a href="#about" className="current">About</a>
        <a href="#projects">Projects</a>
        <a href="#facts">Fun Facts</a>
        <a href="#travel">Travel</a>
        <a href="#stats">Stats</a>
        <a href="#thoughts">Thoughts</a>
        <a href="#contact">Contact</a>
      </nav>
    </header>
  );
}
