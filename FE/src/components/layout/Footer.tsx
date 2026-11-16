
import {
  ArrowUpRight,
  Sparkles
} from "lucide-react";

import { Link } from "react-router-dom";

import { teamInfo } from "../../data/portfolio";

export default function Footer() {
  return (
    <footer className="site-footer">

      {/* FOOTER MAIN */}
      <div className="footer-main">

        {/* BRAND */}
        <div className="footer-brand-section">

          <Link to="/" className="footer-brand">
            <span className="footer-brand-icon">
              <Sparkles size={19} />
            </span>

            <span>
              TEAM<span className="brand-highlight">SPACE.</span>
            </span>
          </Link>

          <p>
            {teamInfo.tagline}
          </p>

          <span className="footer-brand-description">
            A creative team building meaningful
            digital experiences.
          </span>

        </div>

        {/* FOOTER NAVIGATION */}
        <nav
          className="footer-navigation"
          aria-label="Footer navigation"
        >
          <h2 className="footer-column-title">
            EXPLORE
          </h2>

          <Link to="/">Portfolio</Link>

          <Link to="/chat">AI Chat</Link>

          <Link to="/#team">Our Team</Link>

          <Link to="/#projects">Our Projects</Link>

        </nav>

        {/* CONTACT */}
        <div className="footer-navigation">

          <h2 className="footer-column-title">
            CONNECT
          </h2>

          {teamInfo.email?.trim() && (
            <a href={`mailto:${teamInfo.email}`}>
              Email Us
            </a>
          )}

          {teamInfo.github?.trim() && (
            <a
              href={teamInfo.github}
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub <ArrowUpRight size={13} />
            </a>
          )}

          {teamInfo.instagram?.trim() && (
            <a
              href={teamInfo.instagram}
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram <ArrowUpRight size={13} />
            </a>
          )}

          {teamInfo.linkedin?.trim() && (
            <a
              href={teamInfo.linkedin}
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn <ArrowUpRight size={13} />
            </a>
          )}

          {!teamInfo.email?.trim() &&
            !teamInfo.github?.trim() &&
            !teamInfo.instagram?.trim() &&
            !teamInfo.linkedin?.trim() && (
              <span className="footer-pending">
                Coming Soon
              </span>
          )}

        </div>

      </div>

      {/* FOOTER BOTTOM */}
      <div className="footer-bottom">

        <span>
          © {new Date().getFullYear()} {teamInfo.name}.
          All rights reserved.
        </span>

        <span>
          BUILT WITH CREATIVITY & TECHNOLOGY
        </span>

        <Link to="/">
          Back to Home <ArrowUpRight size={13} />
        </Link>

      </div>

    </footer>
  );
}
