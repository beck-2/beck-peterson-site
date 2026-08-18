// ABOUTME: The site's single scrolling page — About, Travel, Favorites, and Stats/FrogChart are real;
// ABOUTME: Projects/Fun Facts/Thoughts are still placeholder shells awaiting real content.
import Image from "next/image";
import Nav from "@/components/Nav";
import FrogChart from "@/components/FrogChart";
import TravelSnake from "@/components/TravelSnake";
import Favorites from "@/components/Favorites";

const FUN_FACTS = [
  { label: "randomness", href: "https://www.random.org/analysis/" },
  { label: "parachutes don’t work", href: "https://www.bmj.com/content/363/bmj.k5094" },
  { label: "life", href: "https://playgameoflife.com/" },
  { label: "isochrone map", href: "http://emptypipes.org/2015/05/20/europe-isochrone-map/" },
  { label: "qualia", href: "https://qri.org/oscilleditor/" },
];

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <section className="hero" id="about">
          <div className="hero-doodle">
            <Image
              src="/images/bluecat.png"
              alt="A little blue line-drawing of a cat"
              fill
              sizes="150px"
              style={{ objectFit: "cover", objectPosition: "top" }}
              priority
            />
          </div>
          <h1 className="stamp">Beck Peterson</h1>
          <p className="tagline">A little observer of a big universe.</p>
          <details className="dropdown">
            <summary>more</summary>
            <p>
              Studying the human brain to improve our knowledge of artificial intelligence and vice
              versa. Exploring consciousness with no answers yet (let me know if you have some!)
            </p>
          </details>
        </section>

        <section className="block" id="projects">
          <div className="section-head">
            <h2 className="stamp">Projects</h2>
          </div>
          <p className="quiet-note">[GitHub projects and physical art land here.]</p>
        </section>

        <section className="block" id="facts">
          <div className="section-head">
            <h2 className="stamp">Fun Facts</h2>
          </div>
          <div className="jumble">
            {FUN_FACTS.map((fact) => (
              <a
                href={fact.href}
                target="_blank"
                rel="noopener noreferrer"
                className="fact"
                key={fact.label}
              >
                {fact.label}
              </a>
            ))}
          </div>
        </section>

        <TravelSnake />

        <Favorites />

        <section className="block" id="stats">
          <div className="section-head">
            <h2 className="stamp">Stats</h2>
          </div>
          <p className="quiet-note">[Hevy links land here.]</p>
          <FrogChart />
        </section>

        <section className="block" id="thoughts">
          <div className="section-head">
            <h2 className="stamp">Thoughts</h2>
          </div>
          <p className="quiet-note">[Blog posts land here.]</p>
        </section>

        <footer className="site-footer" id="contact">
          <div className="contact-box">
            [ send me a note ]
            <br />
            &gt; ________________
          </div>
          <div className="links">
            <a href="#">[Email]</a>
            <a href="#">[GitHub]</a>
            <a href="#">[Goodreads]</a>
            <a href="#">[More]</a>
          </div>
        </footer>
      </main>
    </>
  );
}
