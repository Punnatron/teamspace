
import {
  teamInfo,
  members,
  projects
} from "../data/portfolio";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "";

const USE_MOCK_API =
  import.meta.env.VITE_USE_MOCK_API !== "false";


// ======================================
// VERIFIED MEMBER DATA
// ======================================

// Only use member profiles that have been verified.
const verifiedMembers = members.filter(
  (member) => !member.isPlaceholder
);


// ======================================
// MOCK RESPONSE GENERATOR
// ======================================

function generateMockReply(question: string): string {

  const q = question.toLowerCase();

  // ======================================
  // QUESTION ABOUT TEAM MEMBERS
  // ======================================

  if (
    /member|team member|who|สมาชิก|ใคร/.test(q)
  ) {

    // Prevent unverified member information from being exposed.
    if (verifiedMembers.length === 0) {
      return (
        "Our team member profiles are currently " +
        "being prepared. Names and roles will be " +
        "available once the information has been verified."
      );
    }

    const memberList = verifiedMembers
      .map(
        (member) =>
          `${member.name} - ${member.role}`
      )
      .join("\n");

    return (
      `Our team is ${teamInfo.name}.\n\n` +
      `We currently have ${verifiedMembers.length} ` +
      `verified member profiles:\n\n` +
      memberList
    );
  }


  // ======================================
  // QUESTION ABOUT TECH STACK
  // ======================================

  if (
    /tech stack|technology|technologies|เทคโนโลยี/.test(q)
  ) {

    const memberSkills = verifiedMembers.length > 0
      ? verifiedMembers
          .map(
            (member) =>
              `${member.name}: ${member.skills.join(", ")}`
          )
          .join("\n\n")
      : "No verified team member skill information is available yet.";

    const projectTechnologies = projects.length > 0
      ? projects
          .map(
            (project) =>
              `${project.title}: ${project.technologies.join(", ")}`
          )
          .join("\n\n")
      : "No project technology information is available yet.";

    return (
      "Verified team member skills:\n\n" +
      memberSkills +
      "\n\nTechnologies listed for our projects:\n\n" +
      projectTechnologies
    );
  }


  // ======================================
  // QUESTION ABOUT SKILLS
  // ======================================

  if (
    /skill|ทักษะ|ความสามารถ/.test(q)
  ) {

    // Do not return placeholder skills.
    if (verifiedMembers.length === 0) {
      return (
        "Our team's skill information is currently " +
        "being verified. Detailed member skills " +
        "will be available once the profiles are confirmed."
      );
    }

    return verifiedMembers
      .map(
        (member) =>
          `${member.name}: ${member.skills.join(", ")}`
      )
      .join("\n\n");
  }


  // ======================================
  // QUESTION ABOUT PROJECTS
  // ======================================

  if (
    /project|work|ผลงาน|โปรเจกต์|โครงการ/.test(q)
  ) {

    if (projects.length === 0) {
      return (
        "Our project information is currently being prepared."
      );
    }

    return projects
      .map(
        (project) =>
          `${project.title}\n` +
          `${project.description}\n` +
          `Technologies listed: ${project.technologies.join(", ")}`
      )
      .join("\n\n");
  }


  // ======================================
  // GENERAL QUESTION
  // ======================================

  return (
    `${teamInfo.name}\n\n` +
    `${teamInfo.description}\n\n` +
    "You can ask me about our team members, " +
    "skills and projects."
  );
}


// ======================================
// MOCK API
// ======================================

async function mockSendMessage(
  text: string
): Promise<string> {

  // Simulate network delay
  await new Promise((resolve) =>
    setTimeout(resolve, 1000)
  );

  return generateMockReply(text);
}


// ======================================
// REAL BACKEND API
// ======================================

async function realSendMessage(
  text: string
): Promise<string> {

  if (!API_BASE_URL) {
    throw new Error("API URL is not configured.");
  }

  const response = await fetch(
    `${API_BASE_URL}/messages`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({ text })
    }
  );

  if (!response.ok) {
    throw new Error(
      `Server error: ${response.status}`
    );
  }

  const data: unknown = await response.json();

  if (
    typeof data !== "object" ||
    data === null ||
    !("reply" in data) ||
    typeof data.reply !== "string"
  ) {
    throw new Error(
      "Invalid response format from backend."
    );
  }

  return data.reply;
}


// ======================================
// PUBLIC FUNCTION
// ======================================

export async function sendChatMessage(
  text: string
): Promise<string> {

  if (USE_MOCK_API) {
    return mockSendMessage(text);
  }

  return realSendMessage(text);
}
