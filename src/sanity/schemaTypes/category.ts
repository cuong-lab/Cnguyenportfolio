import { defineField, defineType } from 'sanity';
import { orderRankField, orderRankOrdering } from '@sanity/orderable-document-list';

export default defineType({
  name: 'category',
  title: 'Thể loại dự án',
  type: 'document',
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: 'category' }),
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
