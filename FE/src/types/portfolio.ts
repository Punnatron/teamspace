
export interface TeamMember {
  id: number;
  name: string;
  role: string;
  initials: string;
  bio: string;
  skills: string[];
  contribution: string;

  // Placeholder Protection
  isPlaceholder: boolean;

  // Additional profile information
  avatar?: string;
  github?: string;
  linkedin?: string;
  personalProjects?: string[];
}

export interface TeamProject {
  id: number;
  title: string;
  category: string;
  description: string;
  technologies: string[];
  status: string;

  image?: string;
  github?: string;
  demo?: string;
}

export interface TeamProfile {
  name: string;
  tagline: string;
  description: string;
  email: string;
  github: string;

  location?: string;
  instagram?: string;
  linkedin?: string;
}
