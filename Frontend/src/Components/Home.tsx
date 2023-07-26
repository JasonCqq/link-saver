import React from "react";
import "../Styles/Home.scss";
import { BsClockHistory } from "react-icons/bs";
import { HiUserGroup } from "react-icons/hi";
import { AiOutlineCheck } from "react-icons/ai";

function Home() {
  return (
    <main className="home-page">
      <nav>
        <ul className="nav-bar">
          <li id="logo">CodePlanner</li>

          <div className="nav-right">
            <a>Home</a>
            <a>About</a>
            <a>Contact</a>
            <a>Login</a>
            <a id="getStarted">Get Started</a>
          </div>
        </ul>
      </nav>

      <header className="landing-page">
        <div className="landing-heading">
          <section>
            <strong>Creating</strong>, <strong>Planning</strong>, and{" "}
            <strong>Building</strong> projects should be <i>easy</i>. Start
            today with CodePlanner
          </section>
          <div id="placeholder"></div>
        </div>
      </header>

      <section className="landing-features">
        <h1 className="landing-features-heading">Why Us?</h1>
        <div className="landing-features-flex">
          <div className="landing-features-item">
            <BsClockHistory color={"#504eeb"} size={75} />
            <p className="landing-features-item-heading">Save Time</p>
            <p className="landing-features-item-text">
              Our platform simplifies the project planning process, and
              optimizes the workflow, allowing you to focus on coding and
              developing
            </p>
          </div>
          <div className="landing-features-item">
            <HiUserGroup color={"#504eeb"} size={75} />
            <p className="landing-features-item-heading">Collaboration</p>
            <p className="landing-features-item-text">
              Work seamlessly with your team, share ideas, and track progress
              together. Boosting productivity
            </p>
          </div>
          <div className="landing-features-item">
            <AiOutlineCheck color={"#504eeb"} size={75} />
            <p className="landing-features-item-heading">Simplified</p>
            <p className="landing-features-item-text">
              Hassle-free project planning with our user-friendly interface,
              making it easy to stay organized throughout development
            </p>
          </div>
        </div>
      </section>

      <section className="landing-tutorial">
        <h1 className="landing-tutorial-heading">How it works</h1>

        <div className="landing-tutorial-container">
          <div className="landing-tutorial-item">
            <h2 className="landing-tutorial-item-head">Create a Project</h2>
            <p style={{ width: "50%" }}>
              Effortlessly create new coding projects with deadlines, and a tech
              stack. No idea where to start? AI can help you.
            </p>
            <div className="vl"></div>
          </div>

          <div className="landing-tutorial-item">
            <h2 className="landing-tutorial-item-head">Invite Users</h2>
            <p style={{ width: "50%" }}>
              Collaborate easily by inviting team members to join your project
              and assigning roles to members.
            </p>
            <div className="vl"></div>
          </div>

          <div className="landing-tutorial-item">
            <h2 className="landing-tutorial-item-head">Adding Tasks</h2>
            <p style={{ width: "50%" }}>
              Streamline task management. Add tasks and organize your coding
              projects efficiently, ensuring a structured workflow and optimized
              development process.
            </p>
            <div className="vl"></div>
          </div>

          <div className="landing-tutorial-item">
            <h2 className="landing-tutorial-item-head">Finished Project</h2>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <p className="landing-footer-note">Begin creating with CodePlanner</p>
        <a className="landing-footer-button">Get Started for free</a>
      </footer>
    </main>
  );
}

export default Home;
