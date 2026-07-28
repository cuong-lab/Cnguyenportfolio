import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'homePage',
  title: 'Home Page Builder',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
    }),
    defineField({
      name: 'pageBuilder',
      title: 'Page Builder (Manual Blocks)',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'heroSection',
          title: 'Hero Section',
          fields: [
            { name: 'eyebrow', type: 'string', title: 'Eyebrow Text' },
            { name: 'heading', type: 'string', title: 'Main Heading' },
            { name: 'description', type: 'text', title: 'Description' },
            { name: 'backgroundVideo', type: 'url', title: 'Background Video URL' },
          ],
        },
        {
          type: 'object',
          name: 'richTextSection',
          title: 'Rich Text / Content Block',
          fields: [
            { name: 'title', type: 'string', title: 'Section Title' },
            { name: 'content', type: 'blockContent', title: 'Content' },
          ],
        },
      ],
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Home Page Configuration',
      };
    },
  },
});
