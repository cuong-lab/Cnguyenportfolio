import React, { useState } from 'react';
import { Card, Stack, Text, TextInput, Button, Box, Heading, Spinner } from '@sanity/ui';

export function VimeoSyncTool() {
  const [urls, setUrls] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSync = async () => {
    if (!urls.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    const urlList = urls
      .split('\n')
      .map((u) => u.trim())
      .filter(Boolean);

    try {
      const res = await fetch('/api/sync-vimeo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: urlList }),
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
      <Card padding={4} radius={3} shadow={2}>
        <Stack space={4}>
          <Heading as="h2" size={3}>
            🎬 Đồng bộ Video từ Vimeo vào Sanity CMS
          </Heading>
          <Text size={2} muted>
            Dán một hoặc nhiều đường dẫn Vimeo (mỗi link 1 dòng, ví dụ: <code>https://vimeo.com/12345678</code>).
            Hệ thống sẽ tự động bóc tách tiêu đề, tỉ lệ khung hình (16:9 hoặc 9:16) và ảnh thumbnail tự động.
          </Text>

          <Box>
            <TextInput
              rows={4}
              multiline
              placeholder="https://vimeo.com/8323232&#10;https://vimeo.com/12345678"
              value={urls}
              onChange={(e) => setUrls(e.currentTarget.value)}
            />
          </Box>

          <Button
            tone="primary"
            text={loading ? 'Đang trích xuất & đồng bộ...' : '🚀 Bắt đầu Đồng bộ'}
            onClick={handleSync}
            disabled={loading || !urls.trim()}
          />

          {loading && (
            <Stack space={3} align="center" padding={4}>
              <Spinner />
              <Text size={2}>Đang gửi yêu cầu và trích xuất thông tin từ Vimeo...</Text>
            </Stack>
          )}

          {error && (
            <Card padding={3} radius={2} tone="critical">
              <Text size={2}>❌ Lỗi: {error}</Text>
            </Card>
          )}

          {result && (
            <Card padding={4} radius={2} tone="positive">
              <Stack space={3}>
                <Heading as="h3" size={1}>
                  ✅ {result.message}
                </Heading>
                <Text size={1}>Số video đã xử lý: {result.count}</Text>
                <Stack space={2}>
                  {result.results.map((res, idx) => (
                    <Card key={idx} padding={2} radius={2} border>
                      <Text size={1} weight="bold">
                        🎥 {res.vimeoInfo.title}
                      </Text>
                      <Text size={0} muted>
                        URL: {res.vimeoInfo.vimeoUrl} | Tỷ lệ: {res.vimeoInfo.aspectRatio}
                      </Text>
                      {res.sanityDocument?.status === 'already_exists' && (
                        <Text size={0} tone="caution">
                          (Video này đã tồn tại trong Sanity CMS)
                        </Text>
                      )}
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
