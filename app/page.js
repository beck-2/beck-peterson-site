// ABOUTME: The site's single scrolling page — About, Travel, and Stats/FrogChart are real;
// ABOUTME: Projects/Fun Facts/Thoughts are still placeholder shells awaiting real content.
import Image from "next/image";
import Nav from "@/components/Nav";
import FrogChart from "@/components/FrogChart";
import TravelSnake from "@/components/TravelSnake";

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
          <p className="quiet-note">
            [GitHub projects, physical art, and a flip-through recipe book land here.]
          </p>
        </section>

        <section className="block" id="facts">
          <div className="section-head">
            <h2 className="stamp">Fun Facts</h2>
          </div>
          <div className="jumble">
            <div className="fact">[fun fact or link #1]</div>
            <div className="fact">[fun fact or link #2]</div>
            <div className="fact">[fun fact or link #3]</div>
            <div className="fact">[fun fact or link #4]</div>
            <div className="fact">[fun fact or link #5]</div>
          </div>
        </section>

        <TravelSnake />

        <section className="block" id="stats">
          <div className="section-head">
            <h2 className="stamp">Stats</h2>
          </div>
          <p className="quiet-note">[Goodreads · Letterboxd · Beli · Hevy links land here.]</p>
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
