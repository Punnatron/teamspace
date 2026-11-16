
import {
  ArrowUpRight,
  Mail,
  MapPin,
  Sparkles
} from "lucide-react";

import {
  FaGithub,
  FaInstagram,
  FaLinkedinIn
} from "react-icons/fa";

import { Link } from "react-router-dom";

import { teamInfo } from "../../data/portfolio";

import { useScrollReveal } from "../../hooks/useScrollReveal";

export default function ContactSection() {
  const {
    ref: contactRef,
    isVisible: isContactVisible
  } = useScrollReveal<HTMLElement>();

  const hasSocialLinks =
    Boolean(teamInfo.github?.trim()) ||
    Boolean(teamInfo.instagram?.trim()) ||
    Boolean(teamInfo.linkedin?.trim());

  const hasContactInfo =
    Boolean(teamInfo.email?.trim()) ||
    Boolean(teamInfo.location?.trim()) ||
    hasSocialLinks;

  return (
    <section
      ref={contactRef}
      className={`contact-section scroll-reveal ${
        isContactVisible ? "is-visible" : ""
      }`}
      id="contact"
      aria-labelledby="contact-heading"
    >
      {/* HEADER */}
      <div className="contact-heading">
        <span className="section-label">
          03 / GET IN TOUCH
        </span>

        <h2 id="contact-heading">
          Let's create
          <br />
          <span>something great.</span>
        </h2>

        <p>
          Have a question or want to know more
          about our team? Feel free to connect with us.
          We would love to hear from you.
        </p>
      </div>

      {/* CONTACT INFORMATION */}
      <div className="contact-content">
        <div className="contact-info">
          <span className="contact-subtitle">
            CONTACT INFORMATION
          </span>

          {teamInfo.email?.trim() && (
            <a
              href={`mailto:${teamInfo.email}`}
              className="contact-item"
            >
              <div className="contact-item-icon">
                <Mail size={20} />
              </div>

              <div>
                <span>EMAIL</span>
                <strong>{teamInfo.email}</strong>
              </div>

              <ArrowUpRight size={17} />
            </a>
          )}

          {teamInfo.location?.trim() && (
            <div className="contact-item">
              <div className="contact-item-icon">
                <MapPin size={20} />
              </div>

              <div>
                <span>LOCATION</span>
                <strong>{teamInfo.location}</strong>
              </div>
            </div>
          )}

          {hasSocialLinks && (
            <div className="contact-socials">
              <span className="contact-subtitle">
                FOLLOW OUR TEAM
              </span>

              <div className="social-link-list">
                {teamInfo.github?.trim() && (
                  <a
                    href={teamInfo.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Team GitHub"
                  >
                    <FaGithub size={19} />
                  </a>
                )}

                {teamInfo.instagram?.trim() && (
                  <a
                    href={teamInfo.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Team Instagram"
                  >
                    <FaInstagram size={19} />
                  </a>
                )}

                {teamInfo.linkedin?.trim() && (
                  <a
                    href={teamInfo.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Team LinkedIn"
                  >
                    <FaLinkedinIn size={19} />
                  </a>
                )}
              </div>
            </div>
          )}

          {!hasContactInfo && (
            <p className="contact-pending">
              Team contact information will be
              available soon.
            </p>
          )}
        </div>

        {/* AI CONTACT CARD */}
        <div className="contact-ai-card">
          <div className="contact-ai-icon">
            <Sparkles size={29} />
          </div>

          <span>MEET OUR AI ASSISTANT</span>

          <h3>
            Curious about
            <br />
            our team?
          </h3>

          <p>
            Explore our members, discover our skills,
            and learn more about our projects
            through our AI assistant.
          </p>

          <Link
            to="/chat"
            className="primary-button"
          >
            Ask Our AI
            <ArrowUpRight size={17} />
          </Link>
        </div>
      </div>
    </section>
  );
}
