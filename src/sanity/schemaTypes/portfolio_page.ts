import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'portfolio_page',
  title: 'Trang Portfolio (Giới thiệu dự án)',
  type: 'document',
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow Tag',
      type: 'string',
      description: 'Nhãn nhỏ phía trên tiêu đề chính. Mặc định: [ PORTFOLIO ]',
      initialValue: '[ PORTFOLIO ]',
    }),
    defineField({
      name: 'heading',
      title: 'Tiêu đề chính',
      type: 'string',
      description: 'Tiêu đề chính của trang. Mặc định: Toàn bộ dự án quay dựng và chụp ảnh.',
      initialValue: 'Toàn bộ dự án quay dựng và chụp ảnh.',
    }),
    defineField({
      name: 'description',
      title: 'Đoạn mô tả ngắn',
      type: 'text',
      description: 'Đoạn giới thiệu phong cách làm việc dưới tiêu đề.',
      initialValue: 'Với lăng kính thẩm mỹ tinh tế và kỹ năng hậu kỳ sắc bén, mỗi dự án là một câu chuyện thị giác được kể bằng sự chỉn chu và đam mê. Từ vẻ đẹp sang trọng, đẳng cấp của các thương hiệu làm đẹp cho đến nhịp độ nghẹt thở của các giải đấu thể thao chuyên nghiệp, tôi luôn nỗ lực biến mọi khoảnh khắc thành những thước phim mang đậm dấu ấn cá nhân và giá trị nguyên bản.',
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Cấu hình Trang Portfolio',
      };
    },
  },
});
