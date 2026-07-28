import { defineArrayMember, defineField, defineType } from 'sanity';

export default defineType({
  name: 'resume_experience',
  title: 'Kinh nghiệm',
  type: 'document',
  fields: [
    defineField({
      name: 'company',
      title: 'Công ty',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'role', title: 'Vai trò', type: 'string' }),
    defineField({
      name: 'timeframe',
      title: 'Thời gian',
      type: 'string',
      description: 'Ví dụ: 2021 — 2023',
    }),
    defineField({
      name: 'skills',
      title: 'Kỹ năng',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      options: { layout: 'tags' },
    }),
    defineField({ name: 'outcomes', title: 'Thành tựu', type: 'text', rows: 3 }),
    defineField({ name: 'description', title: 'Mô tả', type: 'text', rows: 4 }),
    defineField({
      name: 'order',
      title: 'Thứ tự (mới nhất = số nhỏ nhất)',
      type: 'number',
    }),
  ],
  preview: { select: { title: 'company', subtitle: 'role' } },
});
