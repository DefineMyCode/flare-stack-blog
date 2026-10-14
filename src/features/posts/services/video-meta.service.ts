import type {
  VideoMeta,
  VideoSource,
} from "@/features/posts/utils/video-source";
import { videoMetaOf } from "@/features/posts/utils/video-source";

const BILIBILI_VIEW = "https://api.bilibili.com/x/web-interface/view";

interface BilibiliView {
  code: number;
  data?: {
    title?: unknown;
    pic?: unknown;
    duration?: unknown;
    pages?: Array<{ page?: unknown; duration?: unknown }>;
  };
}

/**
 * The title, cover and length of `source`, from the provider, or `null` when
 * the provider has none to give or cannot be reached. Only Bilibili is asked:
 * YouTube's thumbnail has a fixed URL already.
 *
 * Bilibili's video info endpoint is public but undocumented. A browser-like
 * User-Agent without Bilibili's cookies gets a 412 block page, so the request
 * sends none.
 */
export async function fetchVideoMeta(
  source: VideoSource,
): Promise<VideoMeta | null> {
  if (source.provider !== "bilibili") return null;
  const url = new URL(BILIBILI_VIEW);
  const av = /^av(\d+)$/i.exec(source.videoId);
  if (av) url.searchParams.set("aid", av[1]);
  else url.searchParams.set("bvid", source.videoId);

  let body: BilibiliView;
  try {
    const response = await fetch(url, {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) return null;
    body = (await response.json()) as BilibiliView;
  } catch {
    return null;
  }
  if (body.code !== 0 || !body.data) return null;

  const { data } = body;
  // A part of a multi-part video has a length of its own.
  const part = data.pages?.find((page) => page.page === (source.page ?? 1));
  const meta = videoMetaOf({
    title: data.title,
    cover: data.pic,
    duration: part?.duration ?? data.duration,
  });
  return meta.title || meta.cover ? meta : null;
}
