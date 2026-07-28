import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'service',
  title: 'Dịch vụ',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Tiêu đề',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'description', title: 'Mô tả', type: 'text', rows: 4 }),
    defineField({
      name: 'icon',
      title: 'Icon / Ảnh',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'order',
      title: 'Thứ tự hiển thị',
      type: 'number',
      description: 'Số nhỏ hiển thị trước.',
    }),
  ],
  preview: { select: { title: 'title', media: 'icon' } },
});
