import Image from "next/image";
import { getGitHubSnapshot } from "@/lib/github";
import { ArrowUpRightIcon, GitHubIcon, RepoIcon } from "./Icons";

const LANG_COLORS: Record<string, string> = {
  JavaScript: "#e3c341",
  TypeScript: "#3178c6",
  Python: "#3572a5",
  HTML: "#e34c26",
  CSS: "#663399",
  "Jupyter Notebook": "#da5b0b",
  Java: "#b07219",
};
const color = (lang: string | null) => (lang && LANG_COLORS[lang]) || "#8b949e";

const fmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

export async function GitHubSection() {
  const gh = await getGitHubSnapshot();
  const total = gh.languages.reduce((s, l) => s + l.count, 0) || 1;

  return (
    <section className="section" id="github">
      <div className="container">
        <div className="section-head" data-reveal>
          <div>
            <span className="eyebrow">05 / open source</span>
            <h2 className="section-title">On GitHub</h2>
            <p className="section-sub">
              Pulled from the GitHub API on the server and refreshed hourly, so this list stays in sync with her
              profile.
            </p>
          </div>
          <a className="btn" href={`https://github.com/${gh.login}`} target="_blank" rel="noopener noreferrer">
            <GitHubIcon /> @{gh.login}
          </a>
        </div>

        <div className="gh-head" data-reveal>
          <Image className="gh-avatar" src={gh.avatarUrl} alt="" width={48} height={48} />
          <div>
            <strong style={{ display: "block" }}>{gh.publicRepos} public repositories</strong>
            <div className="live-badge">
              <span
                className="lang-dot"
                style={{ background: gh.live ? "#22c55e" : "var(--fg-subtle)", margin: 0 }}
                aria-hidden="true"
              />
              {gh.live ? "live from api.github.com" : "cached snapshot"}
            </div>
          </div>
        </div>

        <div className="gh-langs" role="img" aria-label="Primary languages across repositories">
          {gh.languages.map((l) => (
            <span key={l.name} style={{ width: `${(l.count / total) * 100}%`, background: color(l.name) }} />
          ))}
        </div>
        <div className="gh-legend">
          {gh.languages.map((l) => (
            <span key={l.name}>
              <span className="lang-dot" style={{ background: color(l.name) }} />
              {l.name} <span className="mono">· {l.count}</span>
            </span>
          ))}
        </div>

        <div className="repo-grid">
          {gh.repos.map((r) => (
            <a key={r.name} className="repo" href={r.url} target="_blank" rel="noopener noreferrer" data-reveal>
              <span className="repo-name">
                <RepoIcon /> {r.name}
              </span>
              <span className="repo-desc">
                {r.description ?? (r.homepage ? `Deployed at ${r.homepage.replace(/^https?:\/\//, "")}` : "Source on GitHub")}
              </span>
              <span className="repo-meta">
                {r.language && (
                  <span>
                    <span className="lang-dot" style={{ background: color(r.language) }} />
                    {r.language}
                  </span>
                )}
                <span>Updated {fmt.format(new Date(r.updatedAt))}</span>
                {r.homepage && (
                  <span>
                    live <ArrowUpRightIcon width={11} height={11} />
                  </span>
                )}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
