import { projects } from "@/data/projects";
import { engineeringNotes } from "@/data/projects-notes";

const sections = [
  "about",
  "companies",
  "projects",
  "my-stack",
  "ui-playground",
  "services",
  "thoughts",
  "beyond-code",
  "contact",
  "playground",
];

// 한국어 기준 주소. 영문 주소는 각 경로 앞에 /en을 붙인다.
export const portfolioRoutes: string[][] = [
  [],
  ...sections.map((section) => [section]),
  ...projects.map((project) => ["projects", project.slug]),
  ...engineeringNotes.map((note) => ["thoughts", note.slug]),
];
