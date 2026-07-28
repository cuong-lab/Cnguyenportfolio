import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'site_settings',
  title: 'Cấu hình Trang chủ & Hệ thống',
  type: 'document',
  fields: [
    defineField({ name: 'seoTitle', title: 'SEO Title Trang chủ', type: 'string' }),
    defineField({
      name: 'metaDescription',
      title: 'Meta Description',
      type: 'text',
      rows: 2,
    }),

    // 1. Hero Section
    defineField({
      name: 'hero',
      title: '1. Cụm Hero (Netflix Style)',
      type: 'object',
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({ name: 'eyebrow', title: 'Tiêu đề nhỏ (Eyebrow)', type: 'string' }),
        defineField({ name: 'title', title: 'Tiêu đề chính (Main Title)', type: 'string' }),
        defineField({ name: 'description', title: 'Mô tả ngắn', type: 'text', rows: 2 }),
        defineField({ 
          name: 'videoUrl', 
          title: 'Link Video nền Hero (Link YouTube, Vimeo, MP4/WebM)', 
          type: 'string',
          description: 'Dán link YouTube (ví dụ: https://youtu.be/xxx hoặc https://www.youtube.com/watch?v=xxx) hoặc link file .mp4',
        }),
        defineField({ 
          name: 'videoFile', 
          title: 'Hoặc Tải Video File trực tiếp (MP4/WebM)', 
          type: 'file',
          options: { accept: 'video/*' },
        }),
        defineField({ name: 'posterImage', title: 'Ảnh Poster nền', type: 'image', options: { hotspot: true } }),
      ],
    }),

    // 2. Stats Section
    defineField({
      name: 'stats',
      title: '2. Thanh Thống kê (Có hiệu ứng đếm số)',
      type: 'object',
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({ name: 'stat1_value', title: 'Số thứ 1 (Ví dụ: 50)', type: 'number', initialValue: 50 }),
        defineField({ name: 'stat1_prefix', title: 'Tiền tố thứ 1 (Ví dụ: +)', type: 'string', initialValue: '' }),
        defineField({ name: 'stat1_suffix', title: 'Hậu tố thứ 1 (Ví dụ: +)', type: 'string', initialValue: '' }),
        defineField({ name: 'stat1_label', title: 'Nhãn thứ 1', type: 'string', initialValue: 'Dự án hoàn thành' }),

        defineField({ name: 'stat2_value', title: 'Số thứ 2 (Ví dụ: 8)', type: 'number', initialValue: 8 }),
        defineField({ name: 'stat2_prefix', title: 'Tiền tố thứ 2 (Ví dụ: +)', type: 'string', initialValue: '' }),
        defineField({ name: 'stat2_suffix', title: 'Hậu tố thứ 2 (Ví dụ: +)', type: 'string', initialValue: '+' }),
        defineField({ name: 'stat2_label', title: 'Nhãn thứ 2', type: 'string', initialValue: 'Năm kinh nghiệm' }),

        defineField({ name: 'stat3_value', title: 'Số thứ 3 (Ví dụ: 365)', type: 'number', initialValue: 365 }),
        defineField({ name: 'stat3_prefix', title: 'Tiền tố thứ 3 (Ví dụ: +)', type: 'string', initialValue: '' }),
        defineField({ name: 'stat3_suffix', title: 'Hậu tố thứ 3 (Ví dụ: +)', type: 'string', initialValue: '' }),
        defineField({ name: 'stat3_label', title: 'Nhãn thứ 3', type: 'string', initialValue: 'Ngày sáng tạo' }),
      ],
    }),

    // 3. Portfolio Teaser
    defineField({
      name: 'portfolioTeaser',
      title: '3. Khối Dự án Nổi bật',
      type: 'object',
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({ name: 'tag', title: 'Section Tag', type: 'string', initialValue: '[ 01 / PORTFOLIO ]' }),
        defineField({ name: 'title', title: 'Tiêu đề', type: 'string' }),
      ],
    }),

    // 4. Services Teaser
    defineField({
      name: 'servicesTeaser',
      title: '4. Khối Dịch vụ & Năng lực',
      type: 'object',
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({ name: 'tag', title: 'Section Tag', type: 'string', initialValue: '[ 02 / SERVICES ]' }),
        defineField({ name: 'title', title: 'Tiêu đề', type: 'string' }),
      ],
    }),

    // 5. Contact Banner
    defineField({
      name: 'contactBanner',
      title: '5. Khung Kêu gọi Liên hệ ở Cuối trang',
      type: 'object',
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({ name: 'tag', title: 'Section Tag', type: 'string', initialValue: '[ 03 / CONTACT ]' }),
        defineField({ name: 'title', title: 'Tiêu đề', type: 'string' }),
        defineField({ name: 'text', title: 'Mô tả', type: 'text', rows: 2 }),
      ],
    }),

    // 6. Contact Info
    defineField({
      name: 'contact',
      title: '6. Thông tin liên hệ Footer',
      type: 'object',
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({ name: 'email', title: 'Email', type: 'string' }),
        defineField({ name: 'phone', title: 'Số điện thoại', type: 'string' }),
        defineField({ name: 'address', title: 'Địa chỉ', type: 'string' }),
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Cấu hình Trang chủ & Hệ thống' }),
  },
});
