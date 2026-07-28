import project from './project';
import service from './service';
import resumeExperience from './resume_experience';
import siteSettings from './site_settings';

// Registered on the embedded Studio (sanity.config.ts) and used to type GROQ
// results in src/sanity/api.js.
export const schemaTypes = [project, service, resumeExperience, siteSettings];
