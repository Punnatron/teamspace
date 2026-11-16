
import {
  ArrowUpRight,
  UserRound,
  FolderKanban
} from "lucide-react";

import {
  FaGithub,
  FaLinkedinIn
} from "react-icons/fa";

import type { TeamMember } from "../../types/portfolio";

interface MemberCardProps {
  member: TeamMember;
  index: number;
}

export default function MemberCard({
  member,
  index
}: MemberCardProps) {

  return (
    <article className="member-card">

      {/* CARD HEADER */}
      <div className="member-card-top">

        <span className="member-number">
          0{index + 1} / TEAM MEMBER
        </span>

        <ArrowUpRight size={20} />

      </div>

      {/* ======================================
          PLACEHOLDER MEMBER
      ====================================== */}

      {member.isPlaceholder ? (

        <>

          {/* GENERIC PROFILE IMAGE */}
          <div className="member-avatar">

            <UserRound size={36} />

          </div>

          {/* PLACEHOLDER INFORMATION */}
          <div className="member-info">

            <span className="member-role">
              PROFILE PENDING
            </span>

            <h3>Team Member</h3>

            <p>
              Profile information will be
              available soon.
            </p>

          </div>

          {/* PLACEHOLDER STATUS */}
          <div className="member-contribution">

            <span>PROFILE STATUS</span>

            <strong>Coming Soon</strong>

          </div>

        </>

      ) : (

        <>

          {/* ======================================
              VERIFIED MEMBER
          ====================================== */}

          {/* PROFILE IMAGE */}
          <div className="member-avatar">

            {member.avatar ? (
              <img
                src={member.avatar}
                alt={`${member.name} profile`}
                className="member-avatar-image"
              />
            ) : (
              <>
                <UserRound size={36} />
                <span>{member.initials}</span>
              </>
            )}

          </div>

          {/* MEMBER INFORMATION */}
          <div className="member-info">

            <span className="member-role">
              {member.role}
            </span>

            <h3>{member.name}</h3>

            <p>{member.bio}</p>

          </div>

          {/* SKILLS */}
          <div className="member-skills">

            {member.skills.map((skill) => (
              <span
                className="skill-tag"
                key={skill}
              >
                {skill}
              </span>
            ))}

          </div>

          {/* CONTRIBUTION */}
          <div className="member-contribution">

            <span>MAIN CONTRIBUTION</span>

            <strong>{member.contribution}</strong>

          </div>

          {/* PERSONAL PROJECTS */}
          {member.personalProjects &&
            member.personalProjects.length > 0 && (

            <div className="member-projects">

              <div className="member-section-title">
                <FolderKanban size={15} />
                <span>PERSONAL PROJECTS</span>
              </div>

              <ul>
                {member.personalProjects.map((project) => (
                  <li key={project}>
                    {project}
                  </li>
                ))}
              </ul>

            </div>

          )}

          {/* SOCIAL LINKS */}
          {(member.github || member.linkedin) && (

            <div className="member-social-links">

              {member.github && (
                <a
                  href={member.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${member.name} GitHub`}
                >
                  <FaGithub size={17} />
                  <span>GitHub</span>
                  <ArrowUpRight size={13} />
                </a>
              )}

              {member.linkedin && (
                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${member.name} LinkedIn`}
                >
                  <FaLinkedinIn size={17} />
                  <span>LinkedIn</span>
                  <ArrowUpRight size={13} />
                </a>
              )}

            </div>

          )}

        </>
      )}

    </article>
  );
}
