import { defineArrayMember, defineField, defineType } from 'sanity';

export default defineType({
  name: 'resume_page',
  title: 'Trang Resume',
  type: 'document',
  fields: [
    defineField({
      name: 'avatar',
      title: 'Ảnh Avatar đại diện',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'eyebrow',
      title: 'Tiêu đề nhỏ Về tôi (Eyebrow)',
      type: 'string',
      initialValue: 'VỀ TÔI',
    }),
    defineField({
      name: 'title',
      title: 'Tiêu đề Về tôi',
      type: 'string',
      initialValue: 'Tôi kể chuyện bằng ánh sáng, nhịp điệu và cảm xúc.',
    }),
    defineField({
      name: 'bioText',
      title: 'Nội dung giới thiệu (Block Editor)',
      type: 'blockContent',
    }),
    defineField({
      name: 'strengths',
      title: 'Danh sách Điểm mạnh',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
    }),
    defineField({
      name: 'skillsHeading',
      title: 'Tiêu đề Kỹ năng',
      type: 'string',
      initialValue: 'Công cụ làm việc hằng ngày.',
    }),
    defineField({
      name: 'skills',
      title: 'Danh sách Kỹ năng (Công cụ)',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
    }),
    defineField({
      name: 'experienceHeading',
      title: 'Tiêu đề Kinh nghiệm',
      type: 'string',
      initialValue: 'Hành trình nghề nghiệp qua từng vị trí.',
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Trang Resume' }),
  },
});
