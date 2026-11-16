
import {
  ArrowUpRight,
  Sparkles,
  Users
} from "lucide-react";

import { Link } from "react-router-dom";

import {
  teamInfo,
  members,
  projects
} from "../data/portfolio";

import MemberCard from "../components/portfolio/MemberCard";
import ProjectCard from "../components/portfolio/ProjectCard";
import ContactSection from "../components/portfolio/ContactSection";
import { useScrollReveal } from "../hooks/useScrollReveal";

export default function PortfolioPage() {
  // Hero Content Reveal
  const {
    ref: heroContentRef,
    isVisible: isHeroContentVisible
  } = useScrollReveal<HTMLDivElement>();

  // Hero Visual Reveal
  const {
    ref: heroVisualRef,
    isVisible: isHeroVisualVisible
  } = useScrollReveal<HTMLDivElement>();

  // Team Section Reveal
  const {
    ref: teamRef,
    isVisible: isTeamVisible
  } = useScrollReveal<HTMLElement>();

  // Project Section Reveal
  const {
    ref: projectRef,
    isVisible: isProjectVisible
  } = useScrollReveal<HTMLElement>();

  return (
    <div className="portfolio-page">

      {/* ===========================
          HERO SECTION
      =========================== */}

      <section className="hero-section">

        <div
          ref={heroContentRef}
          className={`hero-content scroll-reveal ${
            isHeroContentVisible ? "is-visible" : ""
          }`}
        >

          <div className="eyebrow">
            <span className="status-dot"></span>
            THE PEOPLE BEHIND THE IDEAS
          </div>

          <h1>
            We turn ideas
            <br />
            into <span>impact.</span>
          </h1>

          <p className="hero-description">
            {teamInfo.description}
          </p>

          <div className="hero-actions">

            <a href="#team" className="primary-button">
              Discover Our Team
              <ArrowUpRight size={18} />
            </a>

            <Link to="/chat" className="secondary-button">
              Talk to Our AI
              <Sparkles size={17} />
            </Link>

          </div>

        </div>

        <div
          ref={heroVisualRef}
          className={`hero-visual scroll-reveal scroll-reveal-delay ${
            isHeroVisualVisible ? "is-visible" : ""
          }`}
        >

          <div className="visual-top">
            <span>TEAM / PROFILE</span>
            <span>2026</span>
          </div>

          <div className="visual-center">

            <div className="visual-orbit orbit-one"></div>
            <div className="visual-orbit orbit-two"></div>

            <div className="visual-symbol">
              <Sparkles size={48} />
            </div>

          </div>

          <div className="visual-bottom">
            <span>CREATIVE MINDS.</span>
            <span>SHARED PURPOSE.</span>
          </div>

        </div>

      </section>

      {/* ===========================
          TEAM INTRODUCTION
      =========================== */}

      <section
        ref={teamRef}
        className={`section-block scroll-reveal ${
          isTeamVisible ? "is-visible" : ""
        }`}
        id="team"
      >

        <div className="section-heading">

          <span className="section-label">
            01 / THE TEAM
          </span>

          <h2>
            {teamInfo.name}
            <br />
            <span>{teamInfo.tagline}</span>
          </h2>

          <p>
            Meet the people behind our ideas.
            Every member brings different strengths
            and expertise to our team.
          </p>

        </div>

        <div className="team-summary">

          <div>
            <Users size={25} />
            <strong>{members.length}</strong>
            <span>TEAM MEMBERS</span>
          </div>

          <div>
            <Sparkles size={25} />
            <strong>{projects.length}</strong>
            <span>PROJECTS</span>
          </div>

        </div>

        <div className="member-grid">

          {members.map((member, index) => (
            <MemberCard
              key={member.id}
              member={member}
              index={index}
            />
          ))}

        </div>

      </section>

      {/* ===========================
          PROJECT SHOWCASE
      =========================== */}

      <section
        ref={projectRef}
        className={`section-block scroll-reveal ${
          isProjectVisible ? "is-visible" : ""
        }`}
        id="projects"
      >

        <div className="section-heading">

          <span className="section-label">
            02 / SELECTED WORK
          </span>

          <h2>
            Ideas become
            <br />
            <span>real projects.</span>
          </h2>

          <p>
            Explore the projects and technologies
            that represent our team's capabilities.
          </p>

        </div>

        <div
          className={`project-grid ${
            projects.length === 1 ? "project-grid-single" : ""
          }`}
        >

          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
            />
          ))}

        </div>

      </section>

      {/* ===========================
          CONTACT SECTION
      =========================== */}

      <ContactSection />

    </div>
  );
}
