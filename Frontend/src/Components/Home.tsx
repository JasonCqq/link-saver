import React from "react";
import "../Styles/Home.scss";
import { AiOutlineCheck, AiFillPicture, AiFillFilter } from "react-icons/ai";
import { Link } from "react-router-dom";

function Home() {
  return (
    <main className="home-page">
      <nav>
        <ul className="nav-bar">
          <li id="logo">LinkSaver</li>

          <div className="nav-mid">
            <a href="#home-features">About</a>
            <a href="#home-contact">Contact</a>
            <a href="#home-faq">FAQ</a>
          </div>

          <div className="nav-right">
            <a>Log in</a>
            <Link to="register" id="getStarted">
              Get Started
            </Link>
          </div>
        </ul>
      </nav>

      <header className="landing-page">
        <div className="landing-heading">
          <section>Keep all your links in one place</section>
        </div>
        <div id="placeholder"></div>
      </header>

      <section id="home-features">
        <h1>Why Us?</h1>
        <div className="home-features-flex">
          <div className="home-features-item">
            <AiFillFilter color={"#f77a4a"} size={75} />
            <h2>Filtering</h2>
            <p>
              Quickly find your links. With a few clicks, you can locate your
              links, making it simple.
            </p>
          </div>
          <div className="home-features-item">
            <AiFillPicture color={"#f77a4a"} size={75} />
            <h2>Visualization</h2>
            <p>
              Every saved link comes with a thumbnail, allowing you to identify
              your content at a glance.
            </p>
          </div>
          <div className="home-features-item">
            <AiOutlineCheck color={"#f77a4a"} size={75} />
            <h2>Simplified</h2>
            <p>
              Hassle-free link saving with our user-friendly interface, making
              it easy to stay organized
            </p>
          </div>
        </div>
      </section>

      <section id="home-faq">
        <h1>Frequently Asked Questions</h1>

        <div className="landing-tutorial-container"></div>
      </section>

      <footer id="home-contact">
        <h1>CONTACT</h1>
        <form className="contact-form">
          <div>
            <label htmlFor="name">NAME</label>
            <input type="text" id="name" name="name" required></input>
          </div>

          <div>
            <label htmlFor="email">EMAIL</label>
            <input type="email" id="email" name="email" required></input>
          </div>

          <div>
            <label htmlFor="subject">SUBJECT</label>
            <input type="text" id="subject" name="subject" required></input>
          </div>

          <label htmlFor="message">MESSAGE</label>
          <textarea id="message" name="message" required></textarea>

          <button type="submit">SUBMIT</button>
        </form>
      </footer>
    </main>
  );
}

export default Home;
