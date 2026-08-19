// ABOUTME: The site's single scrolling page — About, Travel, Favorites, and Stats/FrogChart are real;
// ABOUTME: Projects/fun links are still placeholder shells awaiting real content; Thoughts is paused until there are posts.
import Image from "next/image";
import Nav from "@/components/Nav";
import FrogChart from "@/components/FrogChart";
import TravelSnake from "@/components/TravelSnake";
import Favorites from "@/components/Favorites";
import Logbook from "@/components/Logbook";
import PhotoSidebar from "@/components/PhotoSidebar";
import Projects from "@/components/Projects";

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
      <main className="page-grid">
        <PhotoSidebar />

        <section className="hero" id="about">
          <h1 className="stamp">Beck Peterson</h1>
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
          <p className="tagline">a little observer in a big universe!</p>
          <p className="hero-intro">
            Studying the human brain to improve our knowledge of artificial intelligence and vice
            versa. Exploring consciousness with no answers yet — let me know if you have some
          </p>
          <details className="dropdown">
            <summary>more</summary>
            <p>you thought there would be more? I am but a one dimensional being</p>
            <details className="dropdown">
              <summary>more</summary>
              <p>[more info goes here]</p>
            </details>
          </details>
        </section>

        <Projects />

        <TravelSnake />

        <Favorites />

        <section className="block" id="stats">
          <div className="section-head">
            <h2 className="stamp">stats</h2>
          </div>
          <FrogChart />
        </section>

        <div className="logbook-slot">
          <Logbook />
        </div>

        <section className="block" id="facts">
          <div className="section-head">
            <h2 className="stamp">fun links</h2>
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

        <footer className="site-footer" id="contact">
          <div className="contact-box">
            [ send me a note ]
            <br />
            &gt; ________________
          </div>
          <div className="links">
            <a href="mailto:beckjpeterson@gmail.com">Email</a>
            <a href="https://github.com/beck-2" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/beckjpeterson/"
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>
          </div>
        </footer>

        <p className="site-disclaimer">
          I love AI (and I'm scared of it) but all images and words on this website are my own
        </p>
      </main>
    </>
  );
}
