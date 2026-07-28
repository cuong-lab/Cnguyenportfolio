import { defineArrayMember, defineField, defineType } from 'sanity';

export default defineType({
  name: 'project',
  title: 'Dự án',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Tiêu đề',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'featured',
      title: 'Nổi bật (hiển thị teaser ở trang chủ)',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({ name: 'client', title: 'Khách hàng', type: 'string' }),
    defineField({ name: 'year', title: 'Năm', type: 'number' }),
    defineField({ name: 'role', title: 'Vai trò', type: 'string' }),
    defineField({
      name: 'categories',
      title: 'Thể loại',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      options: {
        layout: 'tags',
        list: [
          { title: 'Phim ngắn', value: 'Phim ngắn' },
          { title: 'Phóng sự doanh nghiệp', value: 'Phóng sự doanh nghiệp' },
          { title: 'Quảng bá văn hóa', value: 'Quảng bá văn hóa' },
          { title: 'TikTok / Reels', value: 'TikTok / Reels' },
          { title: 'Kiến trúc', value: 'Kiến trúc' },
        ],
      },
    }),
    defineField({
      name: 'aspectRatio',
      title: 'Tỷ lệ khung hình',
      type: 'string',
      description: 'Khung hình của video chính (9:16 cho clip dọc TikTok/Reels).',
      options: {
        layout: 'radio',
        list: [
          { title: '16:9 (ngang)', value: '16:9' },
          { title: '9:16 (dọc — TikTok/Reels)', value: '9:16' },
        ],
      },
      initialValue: '16:9',
    }),
    defineField({
      name: 'coverImage',
      title: 'Ảnh bìa',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'videoHoverUrl',
      title: 'Video hover (WebM/MP4 nhẹ)',
      type: 'url',
      description: 'Clip ngắn, nhẹ để preview khi rê chuột vào card.',
    }),
    defineField({
      name: 'mainVideoUrl',
      title: 'Video chính (Vimeo / YouTube)',
      type: 'url',
      description: 'Link video đầy đủ cho trang chi tiết dự án.',
    }),
    defineField({
      name: 'gallery',
      title: 'Thư viện ảnh',
      type: 'array',
      of: [defineArrayMember({ type: 'image', options: { hotspot: true } })],
    }),
    defineField({
      name: 'description',
      title: 'Mô tả',
      type: 'array',
      of: [defineArrayMember({ type: 'block' })],
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'client', media: 'coverImage' },
  },
});
