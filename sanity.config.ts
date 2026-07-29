import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { orderableDocumentListDeskItem } from '@sanity/orderable-document-list';
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
      structure: (S, context) =>
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
            S.listItem()
              .title('Trang chủ (Page Builder)')
              .id('homePage')
              .child(
                S.document().schemaType('homePage').documentId('homePage')
              ),
            S.listItem()
              .title('Trang Resume (Về tôi & Kỹ năng)')
              .id('resume_page')
              .child(
                S.document().schemaType('resume_page').documentId('resume_page')
              ),
            S.divider(),
            orderableDocumentListDeskItem({
              type: 'project',
              title: '🎬 Sắp xếp vị trí Video (Kéo thả nút :::)',
              id: 'orderable-projects',
              S,
              context,
            }),
            S.documentTypeListItem('project').title('Tất cả dự án'),
            S.documentTypeListItem('category').title('Thể loại dự án'),
            S.documentTypeListItem('service').title('Dịch vụ'),
            S.documentTypeListItem('resume_experience').title('Kinh nghiệm'),
          ]),
    }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
  schema: {
    types: schemaTypes,
    // Hide the singletons from the global "create new" menu.
    templates: (templates) => templates.filter((t) => !['site_settings', 'homePage', 'resume_page'].includes(t.schemaType)),
  },
  document: {
    // Prevent duplicating / creating extra singleton documents.
    actions: (actions, context) =>
      ['site_settings', 'homePage', 'resume_page'].includes(context.schemaType)
        ? actions.filter(({ action }) => action !== 'duplicate' && action !== 'delete')
        : actions,
  },
});
