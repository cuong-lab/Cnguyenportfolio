import type { APIRoute } from 'astro';
import { createClient } from '@sanity/client';

export const prerender = false;

const PROJECT_ID = import.meta.env.SANITY_PROJECT_ID || 'yrg3sjk0';
const DATASET = import.meta.env.SANITY_DATASET || 'production';
const WRITE_TOKEN = import.meta.env.SANITY_WRITE_TOKEN || import.meta.env.SANITY_API_TOKEN;

const client = WRITE_TOKEN
  ? createClient({
      projectId: PROJECT_ID,
      dataset: DATASET,
      token: WRITE_TOKEN,
      apiVersion: '2025-05-01',
      useCdn: false,
    })
  : null;

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

async function getVimeoInfo(url: string) {
  const cleanUrl = url.trim();
  const match = cleanUrl.match(/vimeo\.com\/(?:.*\/)?(\d+)/);
  if (!match || !match[1]) return null;
  const videoId = match[1];

  try {
    const res = await fetch(`https://vimeo.com/api/oembed.json?url=https%3A//vimeo.com/${videoId}`);
    if (res.ok) {
      const data = await res.json();
      const width = data.width || 16;
      const height = data.height || 9;
      return {
        videoId,
        title: data.title || `Vimeo Video ${videoId}`,
        vimeoUrl: `https://vimeo.com/${videoId}`,
        author: data.author_name || null,
        aspectRatio: height > width ? '9:16' : '16:9',
        thumbnailUrl: data.thumbnail_url || null,
      };
    }
  } catch (e) {
    // fallback
  }

  return {
    videoId,
    title: `Vimeo Video ${videoId}`,
    vimeoUrl: `https://vimeo.com/${videoId}`,
    author: null,
    aspectRatio: '16:9',
    thumbnailUrl: `https://vumbnail.com/${videoId}.jpg`,
  };
}

async function fetchUserVimeoVideos(username: string) {
  const cleanName = username.trim().replace(/^https?:\/\/(www\.)?vimeo\.com\//i, '').replace(/\/.*$/, '');
  try {
    const res = await fetch(`https://vimeo.com/api/v2/${cleanName}/videos.json`);
    if (res.ok) {
      const items = await res.json();
      if (Array.isArray(items)) {
        return items.map((item) => ({
          videoId: String(item.id),
          title: item.title || `Vimeo Video ${item.id}`,
          vimeoUrl: item.url || `https://vimeo.com/${item.id}`,
          author: item.user_name || null,
          aspectRatio: (item.height || 9) > (item.width || 16) ? '9:16' : '16:9',
          thumbnailUrl: item.thumbnail_large || item.thumbnail_medium || `https://vumbnail.com/${item.id}.jpg`,
        }));
      }
    }
  } catch (e) {
    // fallback
  }
  return [];
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { url, urls, username } = body;

    let targetVideoInfos = [];

    if (username && typeof username === 'string' && username.trim()) {
      targetVideoInfos = await fetchUserVimeoVideos(username);
      if (!targetVideoInfos.length) {
        return new Response(
          JSON.stringify({ error: `Không tìm thấy video công khai nào cho Kênh Vimeo "${username}". Vui lòng kiểm tra lại Tên tài khoản Vimeo!` }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    } else {
      const targetUrls: string[] = Array.isArray(urls) ? urls : url ? [url] : [];
      if (!targetUrls.length) {
        return new Response(
          JSON.stringify({ error: 'Vui lòng cung cấp Tên Kênh Vimeo (username) hoặc danh sách đường dẫn Vimeo (urls).' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      for (const rawUrl of targetUrls) {
        const info = await getVimeoInfo(rawUrl);
        if (info) targetVideoInfos.push(info);
      }
    }

    const importedResults = [];

    for (const info of targetVideoInfos) {
      let sanityDoc = null;

      if (client) {
        // Check if video already exists in Sanity
        const existing = await client.fetch(
          `*[_type == "project" && (mainVideoUrl match $videoId || mainVideoUrl == $fullUrl)][0]._id`,
          { videoId: `*${info.videoId}*`, fullUrl: info.vimeoUrl }
        );

        if (!existing) {
          const docSlug = `${slugify(info.title)}-${info.videoId}`;
          sanityDoc = await client.create({
            _type: 'project',
            title: info.title,
            slug: { _type: 'slug', current: docSlug },
            mainVideoUrl: info.vimeoUrl,
            aspectRatio: info.aspectRatio,
            client: info.author,
            featured: false,
          });
        } else {
          sanityDoc = { _id: existing, status: 'already_exists' };
        }
      }

      importedResults.push({
        vimeoInfo: info,
        sanityDocument: sanityDoc,
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        count: importedResults.length,
        results: importedResults,
        message: client
          ? 'Đã đồng bộ thành công các video Vimeo vào Sanity CMS!'
          : 'Đã trích xuất danh sách video Vimeo thành công! (Vui lòng cấu hình SANITY_WRITE_TOKEN để ghi trực tiếp vào Sanity)',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err?.message || 'Có lỗi xảy ra khi xử lý đồng bộ Vimeo.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
