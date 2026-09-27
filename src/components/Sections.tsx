import { certifications, education, experience, profile, projects, skills, socials, stats } from "@/data/profile";
import Image from "next/image";
import { AskButton } from "./AskButton";
import { ArrowUpRightIcon, ChatIcon, CheckBadgeIcon, FileIcon, GitHubIcon, socialIcon } from "./Icons";

function SectionHead({ index, label, title, sub }: { index: string; label: string; title: string; sub?: string }) {
  return (
    <div className="section-head" data-reveal>
      <div>
        <span className="eyebrow">
          {index} / {label}
        </span>
        <h2 className="section-title">{title}</h2>
        {sub && <p className="section-sub">{sub}</p>}
      </div>
    </div>
  );
}

/* ── Hero ─────────────────────────────────────────────────────────────── */

function CodeCard() {
  const K = ({ children }: { children: string }) => <span className="tok-k">{children}</span>;
  const S = ({ children }: { children: string }) => <span className="tok-s">&quot;{children}&quot;</span>;
  const list = (items: string[]) =>
    items.map((it, i) => (
      <span key={it}>
        <S>{it}</S>
        {i < items.length - 1 ? ", " : ""}
      </span>
    ));
  return (
    <div className="code-card" aria-label="Profile summary as code">
      <div className="code-card-bar">
        <i />
        <i />
        <i />
        <span>~/muskan/profile.ts</span>
      </div>
      <pre>
        <code>
          <span className="tok-c">{"// shipped to production, not just to localhost"}</span>
          {"\n"}
          <K>export const</K> engineer = {"{\n"}
          {"  "}name: <S>Muskan Mittal</S>,{"\n"}
          {"  "}role: <S>Full-Stack &amp; GenAI Engineer</S>,{"\n"}
          {"  "}education: <S>B.Tech CSE (Full Stack AI) · UPES &apos;27</S>,{"\n"}
          {"  "}internships: [{list(["Xebia", "Teal Feed"])}],{"\n"}
          {"  "}stack: [{list(["React", "Node", "FastAPI"])},{"\n"}
          {"          "}
          {list(["MongoDB", "Postgres", "Redis"])}],{"\n"}
          {"  "}ai: [{list(["RAG", "LangGraph", "Gemini"])}],{"\n"}
          {"  "}cgpa: <span className="tok-n">8.3</span>,{"\n"}
          {"  "}openToWork: <K>true</K>,{"\n"}
          {"};"}
          <span className="caret" />
        </code>
      </pre>
    </div>
  );
}

export function Hero() {
  const profileLinks = socials.filter((s) => s.id === "github" || s.id === "linkedin" || s.id === "leetcode" || s.id === "email");
  return (
    <section className="hero" id="top">
      <div className="container">
        <div className="hero-grid">
          <div>
            <div className="hero-id">
              <Image
                className="hero-avatar"
                src="/muskan-avatar.jpg"
                alt={`Portrait of ${profile.name}`}
                width={80}
                height={80}
                priority
              />
              <span className="status">
                <span className="status-dot" aria-hidden="true" />
                {profile.availability}
              </span>
            </div>
            <h1>
              {profile.name}
              <span className="hero-role">
                Full-Stack &amp; <em>GenAI</em> Engineer
              </span>
            </h1>
            <p className="hero-lede">
              {profile.headline} Final-year B.Tech CSE (Full Stack AI) at UPES, Dehradun. Previously interned at{" "}
              <strong>Xebia</strong> (backend) and <strong>Teal Feed</strong> (software engineering).
            </p>
            <div className="hero-ctas">
              <a className="btn btn-primary" href="#projects">
                View projects
              </a>
              <AskButton>
                <ChatIcon /> Ask my AI assistant
              </AskButton>
              <a className="btn" href={profile.resumeUrl} target="_blank" rel="noopener">
                <FileIcon /> Resume
              </a>
            </div>
            <div className="hero-socials">
              {profileLinks.map((s) => {
                const Icon = socialIcon[s.id];
                return (
                  <a
                    key={s.id}
                    className="icon-btn"
                    href={s.href}
                    target={s.id === "email" ? undefined : "_blank"}
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    title={s.label}
                  >
                    <Icon />
                  </a>
                );
              })}
            </div>
          </div>
          <CodeCard />
        </div>

        <ul className="stats" role="list" style={{ listStyle: "none", paddingLeft: 0 }}>
          {stats.map((s) => (
            <li className="stat" key={s.label}>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ── About ────────────────────────────────────────────────────────────── */

export function About() {
  const facts = [
    ["From", profile.location],
    ["Studying", "B.Tech CSE (Full Stack AI), UPES Dehradun · 2023–27"],
    ["Internships", "Xebia (Jun–Jul 2026) · Teal Feed (Jun–Jul 2025)"],
    ["Focus", "Full-stack web, backend APIs, applied GenAI (RAG)"],
    ["Languages", "JavaScript, TypeScript, Python, Java, C, SQL"],
  ];
  return (
    <section className="section" id="about">
      <div className="container">
        <SectionHead index="01" label="about" title="Engineer first, student second" />
        <div className="about-grid">
          <div className="about-copy" data-reveal>
            {profile.about.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>
          <div className="about-side" data-reveal>
            <figure className="portrait">
              <Image
                src={profile.photoUrl}
                alt={`${profile.name}, ${profile.title}`}
                width={800}
                height={800}
                sizes="(max-width: 900px) 100vw, 400px"
              />
              <figcaption>
                <b>{profile.name}</b>
                <span>{profile.title}</span>
              </figcaption>
            </figure>
            <dl className="facts">
              {facts.map(([k, v]) => (
                <div className="fact" key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Experience ───────────────────────────────────────────────────────── */

export function Experience() {
  return (
    <section className="section" id="experience">
      <div className="container">
        <SectionHead
          index="02"
          label="experience"
          title="Internships"
          sub="Product teams, real sprints, real handoffs."
        />
        <div className="timeline">
          {experience.map((job) => (
            <article className="job" key={job.company} data-reveal>
              <div className="job-meta">
                <strong>{job.company}</strong>
                {job.period}
                <br />
                {job.location}
              </div>
              <div>
                <h3>{job.role}</h3>
                <p className="job-summary">{job.summary}</p>
                <ul>
                  {job.bullets.map((b) => (
                    <li key={b.slice(0, 32)}>{b}</li>
                  ))}
                </ul>
                <div className="chips">
                  {job.stack.map((t) => (
                    <span className="chip" key={t}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Projects ─────────────────────────────────────────────────────────── */

export function Projects() {
  return (
    <section className="section" id="projects">
      <div className="container">
        <SectionHead
          index="03"
          label="projects"
          title="Selected work"
          sub="Each project covers the problem, the architecture and the parts that took real engineering. The source is public on GitHub."
        />
        <div className="project-list">
          {projects.map((p, i) => (
            <article className="project" key={p.slug} data-reveal>
              <div className="project-side">
                <div className="project-index">
                  <span>
                    {String(i + 1).padStart(2, "0")} · <span className="project-tag">{p.category}</span>
                  </span>
                  <span>{p.status}</span>
                </div>
                <div>
                  <h3>{p.name}</h3>
                  <p className="project-tagline">{p.tagline}</p>
                </div>
                <p className="project-problem">{p.problem}</p>
                {p.role && (
                  <p className="project-role">
                    <strong>Muskan&apos;s role:</strong> {p.role}
                  </p>
                )}
                <div className="project-links">
                  <a className="btn" href={p.repo} target="_blank" rel="noopener noreferrer">
                    <GitHubIcon /> Source
                  </a>
                  {p.live?.map((l) => (
                    <a key={l.href} className="btn" href={l.href} target="_blank" rel="noopener noreferrer">
                      {l.label} <ArrowUpRightIcon />
                    </a>
                  ))}
                  <AskButton className="btn" question={`Tell me about the ${p.name} project and what Muskan built.`}>
                    <ChatIcon /> Ask AI
                  </AskButton>
                </div>
              </div>
              <div className="project-main">
                <h4>What was built</h4>
                <ul>
                  {p.highlights.map((h) => (
                    <li key={h.slice(0, 32)}>{h}</li>
                  ))}
                </ul>
                <div className="project-arch">
                  <h4>Architecture</h4>
                  <div className="arch">
                    {p.architecture.map((a) => (
                      <div key={a}>{a}</div>
                    ))}
                  </div>
                </div>
                <div className="chips">
                  {p.stack.map((t) => (
                    <span className="chip" key={t}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Skills ───────────────────────────────────────────────────────────── */

export function Skills() {
  return (
    <section className="section" id="skills">
      <div className="container">
        <SectionHead
          index="04"
          label="skills"
          title="Technical toolkit"
          sub="Grouped the way the systems are built: interface, service, data and intelligence."
        />
        <div className="skills-grid">
          {skills.map((g, i) => (
            <div className="skill-card" key={g.group} data-reveal>
              <h3>
                {g.group} <span>{String(i + 1).padStart(2, "0")}</span>
              </h3>
              <div className="chips">
                {g.items.map((s) => (
                  <span className="chip" key={s}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Assistant callout ────────────────────────────────────────────────── */

export function AssistantCallout() {
  return (
    <section className="section" id="assistant" style={{ paddingTop: 0, borderTop: 0 }}>
      <div className="container">
        <div className="assistant-callout" data-reveal>
          <div>
            <span className="eyebrow">built into this site</span>
            <h3 style={{ marginTop: 10 }}>Interview this portfolio</h3>
            <p>
              A retrieval-augmented assistant that answers questions about Muskan using only her resume and her GitHub
              READMEs, and cites the sources it used.
            </p>
            <div className="pipeline" aria-label="RAG pipeline">
              <b>question</b>→<b>Gemini embeddings + BM25</b>→<b>rank fusion</b>→<b>top-k context</b>→
              <b>Gemini (streamed)</b>→<b>cited answer</b>
            </div>
          </div>
          <AskButton question="Give me a 30-second summary of Muskan as an engineer.">
            <ChatIcon /> Try it
          </AskButton>
        </div>
      </div>
    </section>
  );
}

/* ── Education & achievements ─────────────────────────────────────────── */

export function Education() {
  return (
    <section className="section" id="education">
      <div className="container">
        <SectionHead index="06" label="education" title="Education & achievements" />
        <div className="edu-grid">
          <div className="panel" data-reveal>
            <h3>Education</h3>
            {education.map((e) => (
              <div className="edu-item" key={e.school}>
                <div>
                  <strong>{e.school}</strong>
                  <span>
                    {e.degree} · {e.score}
                  </span>
                </div>
                <span className="mono">{e.period}</span>
              </div>
            ))}
          </div>
          <div className="panel" data-reveal>
            <h3>Certifications & achievements</h3>
            <ul className="cert-list">
              {certifications.map((c) => (
                <li key={c.slice(0, 32)}>
                  <CheckBadgeIcon />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Contact & footer ─────────────────────────────────────────────────── */

export function Contact() {
  return (
    <section className="section contact" id="contact">
      <div className="container">
        <span className="eyebrow">07 / contact</span>
        <h2 className="section-title">Let&apos;s build something.</h2>
        <p className="section-sub">
          Hiring for a full-stack, backend or GenAI role? Email is the fastest way to reach her. Every profile is linked
          below.
        </p>
        <div className="hero-ctas" style={{ justifyContent: "center" }}>
          <a className="btn btn-primary" href={`mailto:${profile.email}`}>
            Email Muskan
          </a>
          <a className="btn" href={profile.resumeUrl} target="_blank" rel="noopener">
            <FileIcon /> Download resume
          </a>
        </div>
        <div className="contact-grid">
          {socials.map((s) => {
            const Icon = socialIcon[s.id];
            const external = s.id !== "email" && s.id !== "phone";
            return (
              <a
                key={s.id}
                className="contact-card"
                href={s.href}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
              >
                <Icon />
                <b>{s.label}</b>
                <span>{s.handle}</span>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <span>
          © {new Date().getFullYear()} {profile.name}
        </span>
        <span className="mono">Next.js · TypeScript · Gemini RAG · Vercel</span>
      </div>
    </footer>
  );
}
