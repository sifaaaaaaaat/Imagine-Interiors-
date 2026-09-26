// Project types + data loader.
// Data lives in projects.json so the /admin CMS can read and write it at runtime.
import projectsData from "./projects.json";

export interface ProjectImage {
  id: string;
  src: string;
  originalUrl: string;
  title: string;
  room: string;
  width: number;
  height: number;
  aspectRatio: string;
}

export interface StructuredSpace {
  roomName: string;
  imageCount: number;
  images: ProjectImage[];
}

export type ProjectCategory = "RESIDENTIAL" | "COMMERCIAL" | "HOSPITALITY";

export interface RealProject {
  id: string;
  number: string;
  title: string;
  client: string;
  location: string;
  category: ProjectCategory;
  year: string;
  area: string;
  synopsis: string;
  quote: string;
  tags: string[];
  heroImage: string;
  allImages: ProjectImage[];
  structuredSpaces: StructuredSpace[];
}

export const REAL_PROJECTS: RealProject[] =
  projectsData as RealProject[];
