import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './src/sanity/schemaTypes';

// projectId / dataset are injected into the client bundle via vite.define in
// astro.config.mjs (they read the SANITY_* env vars). Non-secret by nature.
const projectId = import.meta.env.SANITY_PROJECT_ID as string;
const dataset = (import.meta.env.SANITY_DATASET as string) || 'production';
const apiVersion = '2025-05-01';

export default defineConfig({
  name: 'nomonm-studio',
  title: 'Cường Nguyễn Showreel — CMS',
  projectId,
  dataset,
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Nội dung')
          .items([
            // site_settings is a singleton — one fixed document, not a list.
            S.listItem()
              .title('Cấu hình chung')
              .id('site_settings')
              .child(
                S.document().schemaType('site_settings').documentId('site_settings')
              ),
            S.divider(),
            S.documentTypeListItem('project').title('Dự án'),
            S.documentTypeListItem('service').title('Dịch vụ'),
            S.documentTypeListItem('resume_experience').title('Kinh nghiệm'),
          ]),
    }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
  schema: {
    types: schemaTypes,
    // Hide the singleton from the global "create new" menu.
    templates: (templates) => templates.filter((t) => t.schemaType !== 'site_settings'),
  },
  document: {
    // Prevent duplicating / creating extra site_settings documents.
    actions: (actions, context) =>
      context.schemaType === 'site_settings'
        ? actions.filter(({ action }) => action !== 'duplicate' && action !== 'delete')
        : actions,
  },
});
