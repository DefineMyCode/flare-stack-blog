import { afterEach, expect, it, vi } from "vitest";
import { fetchVideoMeta } from "./video-meta.service";

const VIDEO = {
  provider: "bilibili",
  videoId: "BV1fK4y1s7Qf",
  page: null,
  start: null,
} as const;

function answer(body: unknown, status = 200) {
  const fetch = vi.fn(async (_url: URL, _init?: RequestInit) =>
    Response.json(body, { status }),
  );
  vi.stubGlobal("fetch", fetch);
  return fetch;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

it("asks Bilibili for the video by its BV ID, without a browser User-Agent", async () => {
  const fetch = answer({ code: 0, data: { title: "t", pic: null } });
  await fetchVideoMeta(VIDEO);

  const [url, init] = fetch.mock.calls[0];
  expect(url.toString()).toBe(
    "https://api.bilibili.com/x/web-interface/view?bvid=BV1fK4y1s7Qf",
  );
  expect(new Headers(init?.headers).has("user-agent")).toBe(false);
});

it("asks by aid for an av ID", async () => {
  const fetch = answer({ code: 0, data: { title: "t" } });
  await fetchVideoMeta({ ...VIDEO, videoId: "av170001" });
  expect(String(fetch.mock.calls[0]?.[0])).toBe(
    "https://api.bilibili.com/x/web-interface/view?aid=170001",
  );
});

it("returns the title, the cover over HTTPS, and the part's own length", async () => {
  answer({
    code: 0,
    data: {
      title: "稻葉曇『ラグトレイン』",
      pic: "http://i2.hdslb.com/bfs/archive/81192e94.jpg",
      duration: 600,
      pages: [
        { page: 1, duration: 252 },
        { page: 2, duration: 348 },
      ],
    },
  });
  expect(await fetchVideoMeta({ ...VIDEO, page: 2 })).toEqual({
    title: "稻葉曇『ラグトレイン』",
    cover: "https://i2.hdslb.com/bfs/archive/81192e94.jpg",
    duration: 348,
  });
});

it("drops a cover that is not on Bilibili's image CDN", async () => {
  answer({
    code: 0,
    data: { title: "t", pic: "https://evil.example/bfs/x.jpg", duration: 5 },
  });
  expect(await fetchVideoMeta(VIDEO)).toEqual({
    title: "t",
    cover: null,
    duration: 5,
  });
});

it("returns null when Bilibili refuses, errors or cannot be reached", async () => {
  answer({ code: -404, message: "啥都木有" });
  expect(await fetchVideoMeta(VIDEO)).toBeNull();

  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response("<html>412</html>", { status: 412 })),
  );
  expect(await fetchVideoMeta(VIDEO)).toBeNull();

  vi.stubGlobal(
    "fetch",
    vi.fn(async () => {
      throw new TypeError("network down");
    }),
  );
  expect(await fetchVideoMeta(VIDEO)).toBeNull();
});

it("does not ask anything for YouTube", async () => {
  const fetch = answer({});
  expect(
    await fetchVideoMeta({
      ...VIDEO,
      provider: "youtube",
      videoId: "5gIf0_xpFPI",
    }),
  ).toBeNull();
  expect(fetch).not.toHaveBeenCalled();
});
