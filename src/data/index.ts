// Typed barrel over the sample content JSON. Pages import from here rather than
// reaching into individual .json files, so when Sanity replaces these files the
// swap happens in one place (these consts become CMS queries) and every page
// keeps its existing typed shape.
import homeData from './home.json';
import servicesData from './services.json';
import projectsData from './projects.json';
import aboutData from './about.json';
import contactData from './contact.json';
import type {
  HomeContent,
  ServicesContent,
  ProjectsContent,
  AboutContent,
  ContactContent,
} from './types';

export const home = homeData as HomeContent;
export const services = servicesData as ServicesContent;
export const projects = projectsData as ProjectsContent;
export const about = aboutData as AboutContent;
export const contact = contactData as ContactContent;

export * from './types';
