import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'category',
  title: 'Thể loại dự án',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Tên thể loại (Ví dụ: Phim ngắn, TVC, Quảng bá văn hóa...)',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
    }),
  ],
  preview: {
    select: { title: 'title' },
  },
});
