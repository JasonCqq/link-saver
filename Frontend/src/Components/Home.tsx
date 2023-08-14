import React, { useState } from "react";
import "../Styles/Home.scss";
import {
  AiOutlineCheck,
  AiFillPicture,
  AiFillFilter,
  AiOutlinePlus,
} from "react-icons/ai";
import { Link } from "react-router-dom";
import uniqid from "uniqid";

function Home() {
  const faqs = [
    {
      id: 1,
      question: "What is LinkStorage and how does it work?",
      answer:
        "Our website is a link saver tool that allows you to store and organize your favorite links all in one place. You can save URLs, filter and search through your collection, and even preview the content of the links directly on our platform.",
    },

    {
      id: 2,
      question: "Is my personal information or data shared with third parties?",
      answer:
        "No, your personal information or data will never be shared with third parties. We prioritize the security and privacy of your information.",
    },

    {
      id: 3,
      question: "Is there a browser extension for LinkStorage?",
      answer:
        "Not yet, but we're actively working on developing a browser extension to enhance your LinkStorage experience. Stay tuned for updates on this feature!",
    },

    {
      id: 4,
      question:
        "Do you offer a premium or paid version of LinkStorage with additional features?",
      answer:
        "No, every feature of LinkStorage is available for free. We believe in providing a comprehensive and valuable link-saving experience to all our users.",
    },

    {
      id: 5,
      question: "What features are available on LinkStorage?",
      answer:
        "LinkStorage offers a range of features to streamline your link-saving process, including filtering options like sorting and searching, thumbnail previews for easy identification, reminders to keep you organized, and the ability to create folders for efficient categorization.",
    },

    {
      id: 6,
      question: "What types of links can I save? Are there any restrictions?",
      answer:
        "There are no restrictions on the types of links you can save in LinkStorage. You can save links to websites, articles, videos, and more, making it a versatile tool for all your link-saving needs.",
    },

    {
      id: 7,
      question: "Can I share my folders/links to others?",
      answer:
        "Absolutely! You have the ability to generate shareable links for your folders, allowing you to easily share collections of links with others.",
    },

    {
      id: 8,
      question:
        "How can I suggest new features or improvements for LinkStorage?",
      answer:
        "We value your input! To suggest new features or improvements for LinkStorage, please visit our Contact Section below. We're always eager to hear your ideas and make our platform even better based on user feedback.",
    },
  ];

  const [activeID, setActiveID] = useState(0);

  const toggleFAQ = (id: number) => {
    setActiveID(activeID === id ? 0 : id);
  };

  return (
    <main className="home-page">
      <nav>
        <ul className="nav-bar">
          <a href="#" id="logo">
            LinkStorage
          </a>

          <div className="nav-mid">
            <a href="#home-features">About</a>
            <a href="#home-faq">FAQ</a>
            <a href="#home-contact">Contact</a>
          </div>

          <div className="nav-right">
            <Link to="login">Log in</Link>
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
        <p>125,258 links saved</p>
      </header>

      <section id="home-features">
        <h1>Why Us?</h1>
        <div className="home-features-flex">
          <div className="home-features-item">
            <AiFillFilter color={"#5b4dbe"} size={75} />
            <h2>Filtering</h2>
            <p>
              Quickly find your links. With a few clicks, you can locate your
              links, making it simple.
            </p>
          </div>
          <div className="home-features-item">
            <AiFillPicture color={"#5b4dbe"} size={75} />
            <h2>Visualization</h2>
            <p>
              Every saved link comes with a thumbnail, allowing you to identify
              your content at a glance.
            </p>
          </div>
          <div className="home-features-item">
            <AiOutlineCheck color={"#5b4dbe"} size={75} />
            <h2>Simplified</h2>
            <p>
              Hassle-free link saving with our user-friendly interface, making
              it easy to stay organized
            </p>
          </div>
        </div>
      </section>

      <section id="home-faq">
        <h1>FAQ</h1>

        <div className="home-faq-container">
          {faqs.map((faq) => {
            return (
              <div
                className="faq-item"
                key={uniqid()}
                onClick={() => toggleFAQ(faq.id)}
              >
                <div className="faq-flex">
                  <p>{faq.question}</p>
                  <AiOutlinePlus color={"#5b4dbe"} size={30} />
                </div>

                {activeID === faq.id && (
                  <p className="faq-answer">{faq.answer}</p>
                )}
              </div>
            );
          })}
        </div>
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

          <button type="submit">Send Message</button>
        </form>
      </footer>
    </main>
  );
}

export default Home;
