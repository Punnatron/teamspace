
import {
  ArrowUpRight,
  Code2,
  ExternalLink
} from "lucide-react";

import { FaGithub } from "react-icons/fa";

import type { TeamProject } from "../../types/portfolio";

interface ProjectCardProps {
  project: TeamProject;
}

export default function ProjectCard({
  project
}: ProjectCardProps) {

  return (
    <article className="project-card">

      {/* PROJECT COVER */}
      <div className="project-preview">

        {project.image ? (

          <img
            src={project.image}
            alt={`${project.title} project preview`}
            className="project-preview-image"
            loading="lazy"
          />

        ) : (

          <div className="project-preview-placeholder">

            <div className="preview-orbit preview-orbit-one"></div>
            <div className="preview-orbit preview-orbit-two"></div>

            <div className="preview-icon">
              <Code2 size={42} />
            </div>

            <span>PROJECT PREVIEW</span>

          </div>

        )}

      </div>


      {/* PROJECT INFORMATION */}
      <div className="project-card-content">

        {/* CATEGORY AND STATUS */}
        <div className="project-card-meta">

          <span className="project-category">
            {project.category}
          </span>

          <span className="project-status-badge">
            <span className="status-dot"></span>
            {project.status}
          </span>

        </div>


        {/* PROJECT TITLE */}
        <h3>{project.title}</h3>


        {/* DESCRIPTION */}
        <p className="project-description">
          {project.description}
        </p>


        {/* TECHNOLOGIES */}
        <div className="project-technologies">

          {project.technologies.map((technology) => (

            <span key={technology}>
              {technology}
            </span>

          ))}

        </div>


        {/* PROJECT LINKS */}
        {(project.github || project.demo) && (

          <div className="project-card-links">

            {project.github && (

              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="project-link"
              >
                <FaGithub size={17} />
                <span>GitHub</span>
                <ArrowUpRight size={14} />
              </a>

            )}

            {project.demo && (

              <a
                href={project.demo}
                target="_blank"
                rel="noopener noreferrer"
                className="project-link project-demo-link"
              >
                <ExternalLink size={16} />
                <span>Live Demo</span>
                <ArrowUpRight size={14} />
              </a>

            )}

          </div>

        )}

      </div>

    </article>
  );
}
