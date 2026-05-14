// frontend/src/components/LandingPage.jsx

import logo from "../assets/gradmap-logo.png";

export default function LandingPage({ onStart }) {
  return (
    <section className="landingPage">
      <div className="landingCard">

        <img
          src={logo}
          alt="GradMap Logo"
          className="landingLogo"
        />

        <h1>GradMap</h1>

        <p className="muted landingSubtitle">
          Your Roadmap to Graduation Success.
        </p>

        <button
          className="btn primary landingStartBtn"
          type="button"
          onClick={onStart}
        >
          Start
        </button>
      </div>
    </section>
  );
} 