import { socials } from "@/data/profile";

export type Repo = {
  name: string;
  description: string | null;
  url: string;
  homepage: string | null;
  language: string | null;
  stars: number;
  updatedAt: string;
};

export type GitHubSnapshot = {
  login: string;
  avatarUrl: string;
  publicRepos: number;
  repos: Repo[];
  languages: { name: string; count: number }[];
  live: boolean;
};

const LOGIN = socials.find((s) => s.id === "github")!.handle;
// Coursework uploads and placeholders that don't represent engineering work.
const HIDDEN = new Set(["first_repo", "backend", "AI-ML_MUSKAN_MITTAL"]);

const FALLBACK: GitHubSnapshot = {
  login: LOGIN,
  avatarUrl: `https://avatars.githubusercontent.com/u/183063203?v=4`,
  publicRepos: 9,
  live: false,
  languages: [
    { name: "JavaScript", count: 2 },
    { name: "Python", count: 2 },
    { name: "TypeScript", count: 1 },
    { name: "HTML", count: 1 },
  ],
  repos: [
    { name: "MindCare-App", language: "JavaScript", homepage: "https://mind-care-app-five.vercel.app" },
    { name: "air-tasker", language: "Python", homepage: "https://air-tasker.vercel.app" },
    { name: "diabetes-prediction", language: "Python", homepage: null },
    { name: "portfolio", language: "HTML", homepage: null },
    { name: "food-delivery-app", language: "JavaScript", homepage: null },
    { name: "peer-review-allocation-system", language: "TypeScript", homepage: null },
  ].map((r) => ({
    ...r,
    description: null,
    url: `https://github.com/${LOGIN}/${r.name}`,
    stars: 0,
    updatedAt: "2026-09-16T00:00:00Z",
  })),
};

/**
 * Fetched on the server and cached with ISR for an hour, so the section stays current
 * without hitting GitHub's unauthenticated rate limit. Falls back to a static snapshot.
 */
export async function getGitHubSnapshot(): Promise<GitHubSnapshot> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "muskan-portfolio",
  };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const opts = { headers, next: { revalidate: 3600 } };

  try {
    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${LOGIN}`, opts),
      fetch(`https://api.github.com/users/${LOGIN}/repos?per_page=100&sort=updated`, opts),
    ]);
    if (!userRes.ok || !reposRes.ok) throw new Error(`GitHub ${userRes.status}/${reposRes.status}`);
    const user = (await userRes.json()) as { login: string; avatar_url: string; public_repos: number };
    const raw = (await reposRes.json()) as {
      name: string;
      description: string | null;
      html_url: string;
      homepage: string | null;
      language: string | null;
      stargazers_count: number;
      pushed_at: string;
      fork: boolean;
    }[];

    const repos: Repo[] = raw
      .filter((r) => !r.fork && !HIDDEN.has(r.name))
      .map((r) => ({
        name: r.name,
        description: r.description,
        url: r.html_url,
        homepage: r.homepage || null,
        language: r.language,
        stars: r.stargazers_count,
        updatedAt: r.pushed_at,
      }))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

    const counts = new Map<string, number>();
    for (const r of repos) if (r.language) counts.set(r.language, (counts.get(r.language) ?? 0) + 1);
    const languages = [...counts.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);

    return { login: user.login, avatarUrl: user.avatar_url, publicRepos: user.public_repos, repos, languages, live: true };
  } catch (err) {
    console.error("[github] falling back to static snapshot:", err);
    return FALLBACK;
  }
}
