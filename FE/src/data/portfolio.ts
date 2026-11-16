
import type {
  TeamMember,
  TeamProject,
  TeamProfile
} from "../types/portfolio";

// ======================================
// 1. TEAM PROFILE
// ข้อมูลโดยรวมของกลุ่ม
// ======================================

export const teamInfo: TeamProfile = {
  name: "TEAMSPACE",

  tagline: "Different minds. One direction.",

  description:
    "We are a team of students who combine " +
    "creativity, technology and teamwork to build " +
    "meaningful digital experiences.",

  // Add real contact information later
  email: "",
  github: "",
  instagram: "",
  linkedin: "",
  location: ""
};

// ======================================
// 2. TEAM MEMBERS
// ข้อมูลสมาชิกทั้งหมด 3 คน
// ======================================

export const members: TeamMember[] = [

  // MEMBER 01
  {
    id: 1,

    name: "ชื่อสมาชิกคนที่ 1",

    role: "Frontend Developer & UI/UX",

    initials: "M1",

    // Profile has not been verified yet
    isPlaceholder: true,

    bio:
      "Responsible for designing and developing " +
      "the user interface and user experience " +
      "of the TeamSpace AI project.",

    skills: [
      "React",
      "TypeScript",
      "CSS",
      "UI/UX Design"
    ],

    contribution:
      "Portfolio Website and Chat UI",

    avatar: "",

    personalProjects: [
      "Personal Portfolio Website",
      "UI Design Project"
    ]
  },

  // MEMBER 02
  {
    id: 2,

    name: "ชื่อสมาชิกคนที่ 2",

    role: "กรอกบทบาทจริง",

    initials: "M2",

    isPlaceholder: true,

    bio:
      "กรอกคำแนะนำตัวและความสามารถของสมาชิกคนที่ 2",

    skills: [
      "กรอกทักษะที่ 1",
      "กรอกทักษะที่ 2",
      "กรอกทักษะที่ 3"
    ],

    contribution:
      "กรอกหน้าที่ที่รับผิดชอบในโปรเจกต์"
  },

  // MEMBER 03
  {
    id: 3,

    name: "ชื่อสมาชิกคนที่ 3",

    role: "กรอกบทบาทจริง",

    initials: "M3",

    isPlaceholder: true,

    bio:
      "กรอกคำแนะนำตัวและความสามารถของสมาชิกคนที่ 3",

    skills: [
      "กรอกทักษะที่ 1",
      "กรอกทักษะที่ 2",
      "กรอกทักษะที่ 3"
    ],

    contribution:
      "กรอกหน้าที่ที่รับผิดชอบในโปรเจกต์"
  }

];

// ======================================
// 3. TEAM PROJECTS
// ผลงานของกลุ่ม
// ======================================

export const projects: TeamProject[] = [

  {
    id: 1,

    title: "TeamSpace AI",

    category: "AI WEB APPLICATION",

    description:
      "An interactive team portfolio website " +
      "that allows visitors to explore team members, " +
      "skills and projects through an AI assistant.",

    technologies: [
      "React",
      "TypeScript",
      "Express",
      "PostgreSQL"
    ],

    status: "IN DEVELOPMENT"
  }

];
