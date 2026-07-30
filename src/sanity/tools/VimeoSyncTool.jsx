import React, { useState, useEffect } from 'react';
import { Card, Stack, Text, TextInput, Button, Box, Heading, Spinner, TabList, Tab, TabPanel } from '@sanity/ui';

export function VimeoSyncTool() {
  const [mode, setMode] = useState('username'); // 'username' | 'urls'
  const [username, setUsername] = useState('');
  const [urls, setUrls] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('vimeo_sync_username');
      if (savedUser) setUsername(savedUser);
    } catch (e) {
      /* ignore */
    }
  }, []);

  const handleSync = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    let payload = {};
    if (mode === 'username') {
      if (!username.trim()) {
        setError('Vui lòng nhập Tên tài khoản hoặc link Kênh Vimeo.');
        setLoading(false);
        return;
      }
      payload = { username: username.trim() };
      try {
        localStorage.setItem('vimeo_sync_username', username.trim());
      } catch (e) {
        /* ignore */
      }
    } else {
      const urlList = urls
        .split('\n')
        .map((u) => u.trim())
        .filter(Boolean);

      if (!urlList.length) {
        setError('Vui lòng dán ít nhất 1 đường dẫn Vimeo.');
        setLoading(false);
        return;
      }
      payload = { urls: urlList };
    }

    try {
      const res = await fetch('/api/sync-vimeo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Đồng bộ thất bại');
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box padding={5}>
      <Card padding={4} radius={3} shadow={2} style={{ maxWidth: '800px', margin: '0 auto' }}>
        <Stack space={4}>
          <Heading as="h2" size={3}>
            🎬 Công cụ Đồng bộ Video Vimeo vào Sanity CMS
          </Heading>
          <Text size={2} muted>
            Tự động bóc tách tiêu đề, tỉ lệ khung hình (ngang/dọc) và ảnh thumbnail từ Vimeo sang bài viết dự án trong Sanity.
          </Text>

          <TabList space={2}>
            <Tab
              id="username-tab"
              aria-controls="username-panel"
              label="⚡ ĐỒNG BỘ THEO KÊNH VIMEO (USERNAME)"
              selected={mode === 'username'}
              onClick={() => setMode('username')}
            />
            <Tab
              id="urls-tab"
              aria-controls="urls-panel"
              label="📋 DÁN LINK THỦ CÔNG"
              selected={mode === 'urls'}
              onClick={() => setMode('urls')}
            />
          </TabList>

          {mode === 'username' && (
            <TabPanel id="username-panel" aria-labelledby="username-tab">
              <Stack space={3}>
                <Text size={2} weight="bold">
                  Tên tài khoản hoặc URL Kênh Vimeo của bạn:
                </Text>
                <TextInput
                  placeholder="Ví dụ: cuongnguyen hoặc https://vimeo.com/cuongnguyen"
                  value={username}
                  onChange={(e) => setUsername(e.currentTarget.value)}
                />
                <Text size={1} muted>
                  💡 Hệ thống sẽ tự động quét danh sách 20 video mới nhất trên Kênh của bạn và tự tạo bài viết trong Sanity mà không cần tạo API token của Vimeo.
                </Text>
              </Stack>
            </TabPanel>
          )}

          {mode === 'urls' && (
            <TabPanel id="urls-panel" aria-labelledby="urls-tab">
              <Stack space={3}>
                <Text size={2} weight="bold">
                  Dán danh sách đường dẫn Vimeo (mỗi link 1 dòng):
                </Text>
                <TextInput
                  rows={5}
                  multiline
                  placeholder="https://vimeo.com/8323232&#10;https://vimeo.com/12345678"
                  value={urls}
                  onChange={(e) => setUrls(e.currentTarget.value)}
                />
              </Stack>
            </TabPanel>
          )}

          <Button
            tone="primary"
            size={3}
            text={loading ? 'Đang quét & Đồng bộ...' : '🚀 Bắt đầu Đồng bộ vào Sanity'}
            onClick={handleSync}
            disabled={loading}
          />

          {loading && (
            <Stack space={3} align="center" padding={4}>
              <Spinner />
              <Text size={2}>Đang kết nối Vimeo và trích xuất thông tin video...</Text>
            </Stack>
          )}

          {error && (
            <Card padding={3} radius={2} tone="critical">
              <Text size={2}>❌ {error}</Text>
            </Card>
          )}

          {result && (
            <Card padding={4} radius={2} tone="positive">
              <Stack space={3}>
                <Heading as="h3" size={1}>
                  ✅ {result.message}
                </Heading>
                <Text size={1} weight="bold">
                  Số video đã xử lý: {result.count}
                </Text>
                <Stack space={2}>
                  {result.results.map((res, idx) => (
                    <Card key={idx} padding={3} radius={2} border>
                      <Text size={1} weight="bold">
                        🎥 {res.vimeoInfo.title}
                      </Text>
                      <Text size={0} muted>
                        URL: {res.vimeoInfo.vimeoUrl} | Khung hình: {res.vimeoInfo.aspectRatio}
                      </Text>
                      {res.sanityDocument?.status === 'already_exists' ? (
                        <Text size={0} tone="caution">
                          (Ví dụ này đã tồn tại sẵn trong Sanity, tự động bỏ qua để tránh trùng lặp)
                        </Text>
                      ) : res.sanityDocument ? (
                        <Text size={0} tone="positive">
                          ✨ Đã tạo bài viết mới thành công!
                        </Text>
                      ) : null}
                    </Card>
                  ))}
                </Stack>
              </Stack>
            </Card>
          )}
        </Stack>
      </Card>
    </Box>
  );
}
