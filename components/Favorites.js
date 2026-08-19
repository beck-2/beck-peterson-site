// ABOUTME: Favorites — collections that each link out to the tracker they mirror.
// ABOUTME: Bookshelf, movie posters, and song discs are static placeholder grids; the recipe notebook is click-through.
"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

// Sized so ten spines + gaps roughly fill the shelf's width, tall enough for
// each title to fit the bigger spine text without truncating. Index 5 is the
// one Beck's currently reading, marked with an arrow (no more leaning).
const BOOKS = [
  { title: "Circe", width: 55, height: 175 },
  { title: "1Q84", width: 70, height: 195 },
  { title: "The Poppy War", width: 50, height: 188 },
  { title: "Cloud Cuckoo Land", width: 66, height: 232 },
  { title: "The Hunger Games", width: 58, height: 214 },
  { title: "The Dark Forest", width: 75, height: 200, leaning: true },
  { title: "Terre Des Hommes", width: 52, height: 216 },
  { title: "Educated", width: 68, height: 178 },
  { title: "The Silent Patient", width: 60, height: 238 },
  { title: "Death Valley", width: 64, height: 180 },
];

const MOVIES = [
  { title: "Jujutsu Kaisen", src: "/images/posters/jujutsu-kaisen-0.png", rotation: -3 },
  { title: "One Battle After Another", src: "/images/posters/one-battle-after-another.jpg", rotation: 2 },
  { title: "Heretic", src: "/images/posters/heretic.jpg", rotation: -1.5 },
  { title: "Dazed and Confused", src: "/images/posters/dazed-and-confused.jpg", rotation: 3 },
  { title: "Zoolander", src: "/images/posters/zoolander.jpg", rotation: -2.5 },
  { title: "Taking Guns From Boys", src: "/images/posters/taking-guns-from-boys.jpg", rotation: 2.5 },
];

const RECIPES = [
  { title: "[recipe title]", body: "[Beck's recipe goes here — ingredients, steps, notes.]" },
];

const LINKS = {
  goodreads: "https://www.goodreads.com/user/show/193950155-beck",
  letterboxd: "https://letterboxd.com/_beck/",
  spotify:
    "https://open.spotify.com/user/u8b2v9hwtndu3090va18c0azh?si=ObvGbs7rQbmXXt7Cdnw9sQ&utm_source=copy-link",
  beli: "https://beliapp.co/app/beckalicious",
};

// Sizes/offsets are just for the scattered layout; uri is what the Spotify
// iFrame API controller plays, src is the cover art pulled via oEmbed.
const SONGS = [
  { title: "So Cold", artist: "Balu Brigada", uri: "spotify:track:2SGyf0hCuB81F85cHXuRjl", src: "/images/song-covers/so-cold.jpg" },
  { title: "De Madrugá", artist: "Rosalía", uri: "spotify:track:3h64Lbm3TXMBSByfnRQyZE", src: "/images/song-covers/de-madruga.jpg" },
  { title: "When I'm Small", artist: "Phantogram", uri: "spotify:track:3498wF96LsgVgMkGmJzJOC", src: "/images/song-covers/when-im-small.jpg" },
  { title: "Me & Mr Jones", artist: "Amy Winehouse", uri: "spotify:track:5RqIM2vv5nw2PGJBqPD8Rg", src: "/images/song-covers/me-and-mr-jones.jpg" },
  { title: "Down By The Water", artist: "PJ Harvey", uri: "spotify:track:48mJX8glOrQkrSdVBjc0Wb", src: "/images/song-covers/down-by-the-water.jpg" },
  { title: "Ring of Fire", artist: "Johnny Cash", uri: "spotify:track:6YffUZJ2R06kyxyK6onezL", src: "/images/song-covers/ring-of-fire.jpg" },
  { title: "California", artist: "beabadoobee", uri: "spotify:track:6GDd1lZ0zp5pB6JleN5Xzx", src: "/images/song-covers/california.jpg" },
  { title: "E85", artist: "Don Toliver", uri: "spotify:track:3B4cjvGlPvyBLNG3AzEgkZ", src: "/images/song-covers/e85.jpg" },
  { title: "Fitzpleasure", artist: "alt-J", uri: "spotify:track:7DdXf9x75iEVCHWfoRwRuR", src: "/images/song-covers/fitzpleasure.jpg" },
  { title: "Broken Clocks", artist: "SZA", uri: "spotify:track:2fXwCWkh6YG5zU1IyvQrbs", src: "/images/song-covers/broken-clocks.jpg" },
  { title: "Tin Tin Deo", artist: "James Moody", uri: "spotify:track:2ufjlHIUWm3FkLj9xekOVZ", src: "/images/song-covers/tin-tin-deo.jpg" },
  { title: "Feelings", artist: "PinkPantheress", uri: "spotify:track:6MNSwUUjWSDUhuCZaTezAn", src: "/images/song-covers/feelings.jpg" },
].map((song, i) => ({
  ...song,
  size: 84 + ((i * 11) % 20),
  offset: [0, 20, 6, 24, 2, 16, 10, 22, 4, 18, 8, 26][i],
}));

export default function Favorites() {
  const [recipeIndex, setRecipeIndex] = useState(0);
  const recipe = RECIPES[recipeIndex];

  const [playingIndex, setPlayingIndex] = useState(null);
  const embedHostRefs = useRef([]);
  const controllersRef = useRef([]);
  const interactedRef = useRef(new Set());

  // Loads Spotify's iFrame Player API once and creates a hidden, controllable
  // embed per song. Our own disc button never touches audio directly — it
  // just calls controller.togglePlay(), and the spin animation is driven by
  // real playback_update events rather than the click itself.
  useEffect(() => {
    let cancelled = false;

    function setup(IFrameAPI) {
      if (cancelled) return;
      window.__spotifyIFrameAPI = IFrameAPI;
      SONGS.forEach((song, i) => {
        const element = embedHostRefs.current[i];
        if (!element || controllersRef.current[i]) return;
        IFrameAPI.createController(element, { uri: song.uri, width: "1", height: "1" }, (controller) => {
          controllersRef.current[i] = controller;
          controller.addListener("playback_update", (e) => {
            // Ignore state announcements from before the visitor has ever
            // clicked this disc — the embed can fire an early update that
            // isn't real playback.
            if (!interactedRef.current.has(i)) return;
            const isPaused = e?.data?.isPaused;
            setPlayingIndex((prev) => {
              if (isPaused === false) return i;
              return prev === i ? null : prev;
            });
          });
        });
      });
    }

    if (window.__spotifyIFrameAPI) {
      setup(window.__spotifyIFrameAPI);
    } else {
      window.onSpotifyIframeApiReady = setup;
      if (!document.getElementById("spotify-iframe-api")) {
        const script = document.createElement("script");
        script.id = "spotify-iframe-api";
        script.src = "https://open.spotify.com/embed/iframe-api/v1";
        script.async = true;
        document.body.appendChild(script);
      }
    }

    return () => {
      cancelled = true;
    };
  }, []);

  function handleDiscClick(i) {
    const controller = controllersRef.current[i];
    if (!controller) return;
    interactedRef.current.add(i);
    if (playingIndex !== null && playingIndex !== i) {
      controllersRef.current[playingIndex]?.pause();
    }
    controller.togglePlay();
  }

  return (
    <section className="block" id="favorites">
      <div className="section-head">
        <h2 className="stamp">favorites</h2>
      </div>

      <div className="favorites-group">
        <div className="favorites-group-head">
          <a href={LINKS.goodreads} target="_blank" rel="noopener noreferrer" className="mono-label">
            goodreads →
          </a>
        </div>
        <div className="bookshelf">
          {BOOKS.map((book, i) => (
            <div className="book-spine-col" key={i}>
              {book.leaning && (
                <div className="book-marker">
                  <span className="book-marker-label">currently reading</span>
                  <span className="book-marker-glyph">↓</span>
                </div>
              )}
              <div className="book-spine" style={{ width: book.width, height: book.height }}>
                <span className="book-spine-label">{book.title}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="favorites-group">
        <div className="favorites-group-head">
          <a href={LINKS.letterboxd} target="_blank" rel="noopener noreferrer" className="mono-label">
            letterboxd →
          </a>
        </div>
        <div className="poster-jumble">
          {MOVIES.map((movie, i) => (
            <div
              className="poster"
              key={i}
              style={{ transform: `rotate(${movie.rotation}deg)` }}
            >
              <div className="poster-frame">
                {movie.src && (
                  <Image
                    src={movie.src}
                    alt={`${movie.title} poster`}
                    fill
                    sizes="100px"
                    style={{ objectFit: "cover" }}
                  />
                )}
              </div>
              <div className="poster-cap">{movie.title}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="favorites-group">
        <div className="favorites-group-head">
          <a href={LINKS.spotify} target="_blank" rel="noopener noreferrer" className="mono-label">
            spotify →
          </a>
        </div>
        <div className="disc-jumble">
          {SONGS.map((song, i) => (
            <div className="disc-item" key={i} style={{ marginTop: song.offset }}>
              <button
                type="button"
                className={"disc" + (playingIndex === i ? " disc-spinning" : "")}
                style={{ width: song.size, height: song.size }}
                onClick={() => handleDiscClick(i)}
                aria-label={(playingIndex === i ? "Pause " : "Play ") + song.title + " by " + song.artist}
              >
                <Image src={song.src} alt="" fill sizes="105px" style={{ objectFit: "cover" }} />
                <span className="disc-hole" />
              </button>
              <div ref={(el) => (embedHostRefs.current[i] = el)} className="disc-embed-host" />
              <div className="disc-cap">
                {song.title}
                <br />
                {song.artist}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="favorites-group">
        <div className="favorites-group-head">
          <a href={LINKS.beli} target="_blank" rel="noopener noreferrer" className="mono-label">
            beli →
          </a>
        </div>
        <button
          type="button"
          className="recipe-notebook"
          onClick={() => setRecipeIndex((i) => (i + 1) % RECIPES.length)}
          aria-label="Next recipe"
        >
          <span className="notebook-page-behind notebook-page-behind-2" />
          <span className="notebook-page-behind notebook-page-behind-1" />
          <span className="recipe-page">
            <span className="recipe-title">{recipe.title}</span>
            <span className="recipe-body">{recipe.body}</span>
            <span className="mono-label recipe-page-count">
              pg. {recipeIndex + 1}/{RECIPES.length}
            </span>
          </span>
        </button>
      </div>
    </section>
  );
}
