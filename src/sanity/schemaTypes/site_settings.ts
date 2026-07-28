import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'site_settings',
  title: 'Cấu hình chung',
  type: 'document',
  // Managed as a singleton — see the structure definition in sanity.config.ts.
  fields: [
    defineField({ name: 'seoTitle', title: 'SEO Title', type: 'string' }),
    defineField({
      name: 'metaDescription',
      title: 'Meta Description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'contact',
      title: 'Thông tin liên hệ',
      type: 'object',
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({
          name: 'email',
          title: 'Email',
          type: 'string',
          validation: (rule) => rule.email(),
        }),
        defineField({ name: 'phone', title: 'Số điện thoại', type: 'string' }),
      ],
    }),
    defineField({
      name: 'stats',
      title: 'Con số thống kê',
      type: 'object',
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({ name: 'projects', title: 'Số dự án', type: 'number' }),
        defineField({
          name: 'experienceYears',
          title: 'Số năm kinh nghiệm',
          type: 'number',
        }),
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Cấu hình chung' }),
  },
});
