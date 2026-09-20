"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type FC, type ReactNode } from "react";
import gsap from "gsap";
import {
  ArrowUpRight,
  Boxes,
  Check,
  Clipboard,
  Code2,
  Database,
  Download,
  ExternalLink,
  Globe2,
  Network,
  Play,
  ShieldCheck,
  UserPlus,
  Zap,
} from "lucide-react";
import cn from "@/utils/cn";

const EXTERNAL = { target: "_blank", rel: "noopener noreferrer" };
const ASSET_BASE_URL = "https://assets.signalog.co/Global/Personal-Nandy";

const techIcons = {
  next: `${ASSET_BASE_URL}/nextjs.png`,
  nest: `${ASSET_BASE_URL}/NestJS.svg`,
  postgres: `${ASSET_BASE_URL}/Logo_PostgreSQL.png`,
  prisma: `${ASSET_BASE_URL}/prisma.png`,
  redis: `${ASSET_BASE_URL}/free-redis-icon-svg-download-png-1175103.png`,
  bullmq: `${ASSET_BASE_URL}/bullmq.svg`,
  r2: `${ASSET_BASE_URL}/2944787.webp`,
  openai: `${ASSET_BASE_URL}/openai.webp`,
  smtp: `${ASSET_BASE_URL}/email-server-png-3.png`,
  google: `${ASSET_BASE_URL}/google-search-logo-icon-free-png.webp`,
} as const;

const links = {
  app: "https://paylens.shiplogly.com",
  showcase: "https://paylens.shiplogly.com/showcase",
  backend: "https://pserver.shiplogly.com",
  swagger: "https://pserver.shiplogly.com/api/docs",
  health: "https://pserver.shiplogly.com/health",
  ready: "https://pserver.shiplogly.com/ready",
  frontend: "https://github.com/nandymandy1/paylens-app",
  backendSource: "https://github.com/nandymandy1/paylens-server",
  demoDataset: `${ASSET_BASE_URL}/paylens-demo-10000-employees.csv`,
  resume: `${ASSET_BASE_URL}/Narendra_Maurya_Resume_ATS_2026.pdf`,
  coverLetter: `${ASSET_BASE_URL}/Narendra_Maurya_Cover_Letter_ATS_2026.docx`,
};

const sectionLinks = [
  ["Reviewer dataset", "reviewer-dataset"],
  ["Architecture", "architecture"],
  ["Stack", "stack"],
  ["Workspace invites", "workspace-invites"],
  ["Optimizations", "optimizations"],
  ["Security", "security"],
  ["AI", "ai"],
  ["Trade-offs", "tradeoffs"],
  ["Deployment", "deployment"],
  ["Environment", "environment"],
  ["Local setup", "local-setup"],
  ["Testing", "testing"],
  ["About", "about"],
] as const;

const CopyCode: FC<{ children: string }> = ({ children }) => {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="relative overflow-x-auto rounded-md border border-white/10 bg-[#07071a] p-4 pr-12 font-mono text-xs leading-6 text-[#dcdcff] shadow-sm">
      <pre>{children}</pre>
      <button
        aria-label="Copy code"
        className="absolute top-3 right-3 rounded-sm border border-white/10 p-1.5 text-white/65 transition hover:bg-white/10 hover:text-white"
        onClick={() => void copy()}
        type="button"
      >
        {copied ? <Check className="size-3.5" /> : <Clipboard className="size-3.5" />}
      </button>
    </div>
  );
};

const TechIcon: FC<{
  alt: string;
  src: string;
  tone?: "pink" | "violet" | "cyan";
  size?: "sm" | "md";
  bare?: boolean;
}> = ({ alt, src, tone = "violet", size = "md", bare = false }) => (
  <span
    className={cn(
      "relative grid shrink-0 place-items-center",
      size === "sm" ? "size-7 p-1" : "size-11 p-2",
      !bare &&
        "rounded-md border bg-white/85 shadow-[0_0_22px_rgba(124,92,255,.24)] dark:bg-white/10",
      !bare && tone === "pink" && "border-[#ef2cc1]/40 shadow-[0_0_24px_rgba(239,44,193,.36)]",
      !bare && tone === "cyan" && "border-cyan-300/45 shadow-[0_0_24px_rgba(103,232,249,.28)]",
      !bare && tone === "violet" && "border-[#9d6cff]/40",
      bare && tone === "pink" && "drop-shadow-[0_0_8px_rgba(239,44,193,.5)]",
      bare && tone === "cyan" && "drop-shadow-[0_0_8px_rgba(103,232,249,.45)]",
      bare && tone === "violet" && "drop-shadow-[0_0_8px_rgba(124,92,255,.5)]",
    )}
  >
    <Image
      alt={alt}
      className="size-full object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,.18)]"
      height={size === "sm" ? 20 : 36}
      src={src}
      width={size === "sm" ? 20 : 36}
    />
  </span>
);

const Section: FC<{
  id: string;
  eyebrow: string;
  title: string;
  children: ReactNode;
  lead?: string;
}> = ({ id, eyebrow, title, lead, children }) => (
  <section
    className="scroll-mt-24 border-t border-black/8 py-16 dark:border-white/10 sm:py-24"
    id={id}
  >
    <p className="font-mono text-[10px] font-medium tracking-[0.12em] text-[#9252e8] uppercase">
      {eyebrow}
    </p>
    <h2 className="mt-3 max-w-3xl text-3xl font-medium tracking-tight text-[#0b0b1c] dark:text-white sm:text-5xl">
      {title}
    </h2>
    {lead && (
      <p className="mt-5 max-w-3xl text-base leading-7 text-black/60 dark:text-white/60">{lead}</p>
    )}
    <div className="mt-10">{children}</div>
  </section>
);

const ExternalButton: FC<{ href: string; children: ReactNode; className?: string }> = ({
  href,
  children,
  className,
}) => (
  <a
    {...EXTERNAL}
    className={cn(
      "inline-flex min-h-10 items-center gap-2 rounded-sm border border-black/10 bg-white px-4 text-sm font-medium text-[#0b0b1c] transition hover:-translate-y-px hover:border-black/25 dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:border-white/30",
      className,
    )}
    href={href}
  >
    <span>{children}</span>
    <ArrowUpRight aria-hidden="true" className="size-3.5" />
  </a>
);

const quickAccess = [
  ["LIVE", "Live application", links.app, "live"],
  ["DESIGN SYSTEM / COMPONENTS", "Component showcase", links.showcase, "components"],
  ["API", "Backend", links.backend, "api"],
  ["API DOCS", "Swagger / OpenAPI", links.swagger, "docs"],
  ["SOURCE", "Frontend source", links.frontend, "source"],
  ["SOURCE", "Backend source", links.backendSource, "source"],
  ["DATASET", "10k demo CSV", links.demoDataset, "dataset"],
] as const;

const QuickAccessIcon: FC<{ name: (typeof quickAccess)[number][3] }> = ({ name }) => {
  const className = "size-5 text-[#9252e8]";

  if (name === "live") return <Globe2 className={className} />;
  if (name === "components") return <Boxes className={className} />;
  if (name === "api") return <Network className={className} />;
  if (name === "dataset") return <Download className={className} />;

  return <Code2 className={className} />;
};

const optimizations = [
  [
    "Tenant-first search",
    "A tenant predicate precedes employee prefix search, using PostgreSQL functional B-tree and text_pattern_ops indexes where appropriate.",
    "Search stays scoped and predictable as the directory grows.",
  ],
  [
    "Keyset pagination",
    "Directory and history navigation use cursors rather than a growing OFFSET scan.",
    "Stable large-data traversal without offset cost growth.",
  ],
  [
    "Bounded data transfer",
    "Import/export workers use fixed batches, batched employee-number/email lookup maps, sequential NDJSON parts, and durable checkpoints.",
    "No unbounded row memory or per-row lookup loop.",
  ],
  [
    "Async workers + R2 staging",
    "BullMQ runs long CSV/XLSX work outside requests. Database state points to normalized R2 chunks before streamed final artifact generation.",
    "Pause, retry, resume, and worker restart resilience without large Redis payloads.",
  ],
  [
    "Financial precision",
    "Money crosses the API as decimal strings, persists as Decimal(19,2), and is handled with BigNumber on the client.",
    "No JavaScript floating-point salary arithmetic.",
  ],
  [
    "Server-authoritative UI",
    "React Query refetches jobs and entities after navigation or refresh; local UI state is never the transfer lifecycle source of truth.",
    "Reliable recovery and less stale client state.",
  ],
] as const;

const envRows = [
  ["NODE_ENV / PORT", "Runtime mode and HTTP port", "Required", "production / 4000"],
  [
    "DATABASE_URL",
    "PostgreSQL connection string",
    "SECRET · required",
    "postgresql://user:***@host/db",
  ],
  ["REDIS_URL", "Redis and BullMQ connection", "SECRET · required", "redis://host:6379"],
  ["FRONTEND_URL", "Allowed browser origin", "Required", "https://paylens.shiplogly.com"],
  [
    "AUTH_ACCESS_TOKEN_SECRET",
    "Session/JWT signing authority",
    "SECRET · required",
    "32+ character placeholder",
  ],
  ["AUTH_COOKIE_SAME_SITE", "Cookie cross-site policy", "Optional", "lax"],
  [
    "SMTP_URL / EMAIL_FROM",
    "Production transactional email",
    "SMTP_URL SECRET · production required",
    "smtps://user:***@smtp",
  ],
  [
    "GOOGLE_CLIENT_ID / SECRET / CALLBACK",
    "Google OIDC, all-or-none",
    "Secret group · optional",
    "https://api.example.com/api/v1/auth/google/callback",
  ],
  [
    "OTEL_EXPORTER_OTLP_ENDPOINT",
    "Optional telemetry collector",
    "Optional",
    "http://localhost:4318",
  ],
  [
    "FILE_STORAGE_*",
    "Private S3-compatible artifacts",
    "Endpoint/key/secret/bucket all-or-none; production required",
    "https://storage.example.com",
  ],
  [
    "OPENAI_API_KEY",
    "Enables optional AI-assisted Department mapping during Employee Import",
    "SECRET · optional",
    "***",
  ],
  [
    "OPENAI_MODEL",
    "Selects the advisory mapping model",
    "Configuration · optional",
    "Configured by deployment",
  ],
] as const;

const DocsContent: FC = () => {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !root.current) return;
    const context = gsap.context(() => {
      gsap.from("[data-docs-hero] > *", { y: 18, opacity: 0, duration: 0.55, stagger: 0.08 });
      gsap.to("[data-flow]", { strokeDashoffset: -28, duration: 1.4, repeat: -1, ease: "none" });
    }, root);

    return () => context.revert();
  }, []);

  return (
    <main ref={root}>
      <section className="relative overflow-hidden border-b border-black/8 bg-[#f7f6fb] pt-24 dark:border-white/10 dark:bg-[#070719]">
        <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(to_right,rgba(124,92,255,.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(124,92,255,.12)_1px,transparent_1px)] [background-size:42px_42px] dark:opacity-25" />
        <div className="pointer-events-none absolute top-0 right-[-20%] size-[42rem] rounded-full bg-[radial-gradient(circle,#ef2cc144_0%,#7c5cff25_35%,transparent_68%)] blur-3xl" />
        <div
          className="relative mx-auto w-full max-w-6xl px-4 pb-20 sm:px-8 sm:pb-28"
          data-docs-hero
        >
          <p className="font-mono text-[11px] font-medium tracking-[0.14em] text-[#9252e8] uppercase">
            PayLens / engineering
          </p>
          <h1 className="mt-5 max-w-5xl text-5xl font-medium tracking-[-.055em] text-[#0b0b1c] dark:text-white sm:text-6xl lg:text-7xl">
            Built to make compensation data clear, auditable, and operational.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-black/60 dark:text-white/60">
            A technical walkthrough of the product decisions, performance work, security model, and
            deployment topology behind PayLens.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ExternalButton
              className="border-transparent bg-gradient-to-r from-[#fc4c02] via-[#ef2cc1] to-[#7c5cff] text-white shadow-[0_12px_32px_rgba(239,44,193,.36)] hover:brightness-110 dark:text-white"
              href={links.app}
            >
              <span className="inline-flex items-center gap-2">
                <Globe2 className="size-4" />
                Open Live App
              </span>
            </ExternalButton>
            <ExternalButton href={links.swagger}>Explore API</ExternalButton>
            <ExternalButton href={links.frontend}>View Source</ExternalButton>
          </div>
          <div className="mt-9 flex flex-wrap gap-2">
            {[
              ["Next.js 16", techIcons.next, "violet"],
              ["NestJS 12", techIcons.nest, "pink"],
              ["PostgreSQL", techIcons.postgres, "cyan"],
              ["Redis / BullMQ", techIcons.redis, "pink"],
            ].map(([label, src, tone], index) => (
              <span
                className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/75 py-1 pr-3 pl-1 font-mono text-[10px] tracking-wide text-black/70 shadow-[0_0_16px_rgba(124,92,255,.12)] dark:border-white/15 dark:bg-white/5 dark:text-white/75"
                key={`${label}-${index}`}
              >
                <TechIcon
                  alt={label}
                  bare
                  size="sm"
                  src={src}
                  tone={tone as "pink" | "violet" | "cyan"}
                />
                {label}
              </span>
            ))}
            <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/60 py-1 pr-3 pl-1 font-mono text-[10px] tracking-wide text-black/60 dark:border-white/15 dark:bg-white/5 dark:text-white/65">
              <TechIcon alt="Cloudflare R2" bare size="sm" src={techIcons.r2} tone="cyan" />
              Cloudflare R2 · OpenTelemetry
            </span>
          </div>
        </div>
      </section>

      <div className="mx-auto flex w-full max-w-6xl gap-12 px-4 sm:px-8">
        <aside className="sticky top-24 hidden h-fit w-36 shrink-0 pt-20 lg:block">
          <p className="mb-3 font-mono text-[10px] tracking-[.12em] text-black/35 uppercase dark:text-white/35">
            On this page
          </p>
          <nav className="space-y-2" aria-label="Documentation sections">
            {sectionLinks.map(([label, id], index) => (
              <a
                className="block text-xs text-black/50 hover:text-black dark:text-white/45 dark:hover:text-white"
                href={`#${id}`}
                key={`${id}-${index}`}
              >
                {label}
              </a>
            ))}
          </nav>
        </aside>
        <div className="min-w-0 flex-1">
          <Section
            eyebrow="Fast path"
            id="reviewer-access"
            lead="Production endpoints and source repositories, grouped for a short review."
            title="Reviewer quick access"
          >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {quickAccess.map(([tag, name, href, icon], index) => (
                <a
                  {...EXTERNAL}
                  className="group rounded-md border border-black/10 bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#9d6cff] dark:border-white/10 dark:bg-white/[.04]"
                  href={href}
                  key={`${name}-${index}`}
                >
                  <QuickAccessIcon key={`${name}-icon`} name={icon} />
                  <p
                    className="mt-5 font-mono text-[9px] tracking-[.1em] text-black/45 uppercase dark:text-white/45"
                    key={`${name}-tag`}
                  >
                    {tag}
                  </p>
                  <p
                    className="mt-1 flex items-center justify-between text-base font-medium text-[#0b0b1c] dark:text-white"
                    key={`${name}-label`}
                  >
                    {name}
                    <ExternalLink className="size-3.5 opacity-0 transition group-hover:opacity-100" />
                  </p>
                </a>
              ))}
            </div>
            <div className="mt-5 grid gap-3 rounded-md border border-[#bdbbff]/50 bg-[#bdbbff]/15 p-5 sm:grid-cols-[1fr_auto] dark:border-[#bdbbff]/20 dark:bg-[#bdbbff]/10">
              <div>
                <p className="font-mono text-[10px] tracking-[.1em] text-[#6840ba] uppercase dark:text-[#d6ceff]">
                  Reviewer demo
                </p>
                <p className="mt-2 text-sm text-black/65 dark:text-white/65">
                  Dedicated seeded account details will be supplied here by the Professor. No
                  production credentials are published in this documentation.
                </p>
              </div>
              <ExternalButton href={links.app}>Open Demo</ExternalButton>
            </div>
          </Section>

          <Section
            eyebrow="Synthetic / demo data"
            id="reviewer-dataset"
            lead="A ready-to-import synthetic technology-company workforce for reviewing the full import, directory, search, and export path."
            title="Try PayLens with 10,000 Employees"
          >
            <div className="grid gap-5 rounded-md border border-[#9d6cff]/30 bg-[#bdbbff]/10 p-6 dark:bg-[#bdbbff]/[.08] lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="flex items-center gap-3">
                  <span className="grid size-11 place-items-center rounded-full bg-[#7c5cff] text-white shadow-[0_0_28px_rgba(124,92,255,.5)]">
                    <Download className="size-5" />
                  </span>
                  <div>
                    <h3 className="text-xl font-medium">10,000 Employee Demo Dataset</h3>
                    <p className="font-mono text-[10px] tracking-[.12em] text-[#6840ba] uppercase dark:text-[#d6ceff]">
                      Synthetic technology-company workforce
                    </p>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-2 font-mono text-[10px] tracking-wide text-black/60 dark:text-white/65">
                  {["10,000 Employees", "20 Departments", "CSV", "~1.3 MB"].map((item) => (
                    <span
                      className="rounded-full border border-[#9d6cff]/25 bg-white/70 px-3 py-1.5 dark:bg-white/5"
                      key={item}
                    >
                      {item}
                    </span>
                  ))}
                </div>
                <p className="mt-5 max-w-2xl text-sm leading-6 text-black/65 dark:text-white/65">
                  Import this after creating or selecting a workspace to quickly populate PayLens
                  for evaluation. The dataset contains synthetic names and{" "}
                  <code>@novastack.example</code> email addresses; it is for product evaluation only
                  and does not send external email.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 lg:flex-col">
                <ExternalButton
                  className="!border-transparent !bg-gradient-to-r !from-[#fc4c02] !via-[#ef2cc1] !to-[#7c5cff] !text-white shadow-[0_10px_28px_rgba(239,44,193,.32)] hover:brightness-110 dark:!text-white"
                  href={links.demoDataset}
                >
                  Download CSV
                </ExternalButton>
                <ExternalButton href={links.app}>Open PayLens</ExternalButton>
              </div>
            </div>
            <div className="mt-5 rounded-md border border-black/10 p-5 dark:border-white/10">
              <h3 className="font-medium">Why there is no Organization column</h3>
              <p className="mt-2 text-sm leading-6 text-black/60 dark:text-white/60">
                The import file intentionally has no Organization ID. PayLens never trusts CSV data
                to choose a tenant: the authenticated session and active organization determine
                where imported employees belong.
              </p>
              <p className="mt-4 font-mono text-xs text-[#6840ba] dark:text-[#d6ceff]">
                Authenticated user → active Membership → active Organization → uploaded Employee
                data
              </p>
            </div>
          </Section>

          <Section
            eyebrow="System shape"
            id="architecture"
            lead="Frontend and backend are independently deployed applications connected through a versioned REST API and secure cookies."
            title="Live architecture"
          >
            <div className="rounded-md border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-white/[.03] sm:p-8">
              <div className="grid gap-4 text-center sm:grid-cols-3">
                {[
                  ["Browser", "React client and secure cookie session", null, "violet"],
                  [
                    "Next.js frontend",
                    "App Router, React Query, Zustand",
                    techIcons.next,
                    "violet",
                  ],
                  ["NestJS API", "REST, RBAC, business modules", techIcons.nest, "pink"],
                ].map(([name, description, iconSrc, tone], i) => (
                  <div
                    className="rounded-sm border border-black/10 p-4 dark:border-white/10"
                    key={`${name}-${i}`}
                  >
                    {typeof iconSrc === "string" ? (
                      <span className="mx-auto w-fit">
                        <TechIcon
                          alt={String(name)}
                          src={iconSrc}
                          tone={tone as "pink" | "violet" | "cyan"}
                        />
                      </span>
                    ) : (
                      <Globe2 className="mx-auto size-5 text-[#ef2cc1]" />
                    )}
                    <p className="mt-3 font-medium">{name}</p>
                    <p className="mt-1 text-xs text-black/55 dark:text-white/55">{description}</p>
                    {i < 2 && (
                      <svg className="mx-auto mt-4 hidden w-16 sm:block" viewBox="0 0 64 8">
                        <path
                          d="M0 4H58"
                          data-flow
                          fill="none"
                          stroke="currentColor"
                          strokeDasharray="5 5"
                          strokeWidth="1.5"
                        />
                        <path d="m58 1 5 3-5 3" fill="none" stroke="currentColor" />
                      </svg>
                    )}
                  </div>
                ))}
              </div>
              <div className="mx-auto my-4 h-7 w-px bg-gradient-to-b from-[#ef2cc1] to-[#7c5cff]" />
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["PostgreSQL / Prisma", Database],
                  ["Redis / BullMQ workers", Zap],
                  ["R2 via FileStorageService", Boxes],
                  ["OIDC, SMTP, OpenAI, OTLP", Network],
                ].map(([name, Icon], index) => (
                  <div
                    className="rounded-sm bg-black/[.035] p-4 text-left dark:bg-white/[.06]"
                    key={`${name as string}-${index}`}
                  >
                    {name === "PostgreSQL / Prisma" ? (
                      <span className="flex gap-1">
                        <TechIcon alt="PostgreSQL" src={techIcons.postgres} tone="cyan" />
                        <TechIcon alt="Prisma" src={techIcons.prisma} tone="violet" />
                      </span>
                    ) : name === "Redis / BullMQ workers" ? (
                      <span className="flex gap-1">
                        <TechIcon alt="Redis" src={techIcons.redis} tone="pink" />
                        <TechIcon alt="BullMQ" src={techIcons.bullmq} tone="violet" />
                      </span>
                    ) : name === "R2 via FileStorageService" ? (
                      <TechIcon alt="Cloudflare R2" src={techIcons.r2} tone="cyan" />
                    ) : name === "OIDC, SMTP, OpenAI, OTLP" ? (
                      <span className="flex gap-1">
                        <TechIcon alt="Google OIDC" src={techIcons.google} tone="cyan" />
                        <TechIcon alt="SMTP" src={techIcons.smtp} tone="pink" />
                        <TechIcon alt="OpenAI" src={techIcons.openai} tone="violet" />
                      </span>
                    ) : (
                      <Icon className="size-4 text-[#9252e8]" />
                    )}
                    <p className="mt-2 text-sm font-medium">{name as string}</p>
                  </div>
                ))}
              </div>
            </div>
            <p className="mt-5 text-sm leading-6 text-black/60 dark:text-white/60">
              The browser calls the NestJS API over REST. PostgreSQL owns durable relational state;
              Redis and BullMQ carry background transfer work; a provider-neutral storage boundary
              currently targets Cloudflare R2.
            </p>
          </Section>

          <Section eyebrow="Product surface" id="capabilities" title="What PayLens does">
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                [
                  "Multi-tenant operations",
                  "Organizations, active membership roles, secure switching, credential auth, verification, recovery, and Google OIDC.",
                ],
                [
                  "Workforce records",
                  "Tenant-scoped employee directory, departments, profiles, and guarded CRUD.",
                ],
                [
                  "Compensation integrity",
                  "Current pay, effective-dated history, decimal precision, audit timeline, idempotent retries, and version conflict protection.",
                ],
                [
                  "Employee data transfer",
                  "CSV/XLSX import and export through background jobs, review/apply, pause/resume/cancel, and private artifacts.",
                ],
              ].map(([title, body], index) => (
                <article
                  className="rounded-md border border-black/10 p-5 dark:border-white/10"
                  key={`${title}-${index}`}
                >
                  <ShieldCheck className="size-5 text-[#ef2cc1]" />
                  <h3 className="mt-4 text-lg font-medium">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-black/60 dark:text-white/60">{body}</p>
                </article>
              ))}
            </div>
          </Section>

          <Section
            eyebrow="Tools with intent"
            id="stack"
            lead="The stack favors one durable tool per responsibility rather than a broad dependency collection."
            title="Technology stack"
          >
            <div className="grid gap-5 lg:grid-cols-2">
              <article className="rounded-md bg-[#080819] p-6 text-white">
                <div className="flex items-center gap-3">
                  <TechIcon alt="Next.js" src={techIcons.next} tone="violet" />
                  <p className="font-mono text-[10px] tracking-[.1em] text-[#bdbbff] uppercase">
                    Frontend
                  </p>
                </div>
                <h3 className="mt-3 text-2xl">Next.js + React</h3>
                <p className="mt-3 text-sm leading-6 text-white/65">
                  App Router and TypeScript provide the product shell; React Query makes server
                  state authoritative; Zustand holds small client-only concerns; Axios owns HTTP;
                  Radix/Tailwind/Lucide keep accessible primitives consistent.
                </p>
                <div className="mt-5 border-t border-white/10 pt-5">
                  <p className="font-medium">Component system</p>
                  <p className="mt-2 text-sm text-white/60">
                    The internal PayLens showcase validates reusable primitives, theme states,
                    typography, controls, surfaces, and feedback patterns so product screens do not
                    drift into one-off styling.
                  </p>
                  <ExternalButton
                    className="mt-4 border-white/15 bg-white/10 text-white"
                    href={links.showcase}
                  >
                    Explore the PayLens Component Showcase
                  </ExternalButton>
                </div>
              </article>
              <article className="rounded-md border border-black/10 p-6 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <TechIcon alt="NestJS" src={techIcons.nest} tone="pink" />
                  <TechIcon alt="PostgreSQL" src={techIcons.postgres} tone="cyan" />
                  <p className="font-mono text-[10px] tracking-[.1em] text-[#9252e8] uppercase">
                    Backend
                  </p>
                </div>
                <h3 className="mt-3 text-2xl">NestJS + PostgreSQL</h3>
                <p className="mt-3 text-sm leading-6 text-black/60 dark:text-white/60">
                  NodeNext ESM NestJS modules provide REST and Swagger. Prisma 6.19 maps relational
                  state. Redis/ioredis/BullMQ run asynchronous work. Pino plus OpenTelemetry
                  preserve observability without coupling request success to telemetry.
                </p>
                <p className="mt-4 text-sm leading-6 text-black/60 dark:text-white/60">
                  ExcelJS and CSV parsers handle interchange; Argon2id, secure cookies, Helmet,
                  throttling, and Google OIDC support protected access.
                </p>
              </article>
              <article className="rounded-md border border-[#9d6cff]/25 bg-[#bdbbff]/10 p-6 lg:col-span-2 dark:bg-[#bdbbff]/[.08]">
                <div className="flex items-center gap-3">
                  <TechIcon alt="OpenAI" src={techIcons.openai} tone="violet" />
                  <p className="font-mono text-[10px] tracking-[.1em] text-[#6840ba] uppercase dark:text-[#d6ceff]">
                    Advisory intelligence
                  </p>
                </div>
                <h3 className="mt-3 text-2xl">OpenAI</h3>
                <p className="mt-3 text-sm leading-6 text-black/65 dark:text-white/65">
                  Used only during Employee Import to suggest mappings for unresolved Department
                  labels after deterministic matching is exhausted. It is not tenant authority and
                  never writes employee data directly.
                </p>
              </article>
            </div>
            <div className="mt-5 rounded-md border border-black/10 p-5 dark:border-white/10">
              <p className="font-mono text-[10px] tracking-[.12em] text-[#9252e8] uppercase">
                Invite member flow
              </p>
              <ol className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {[
                  "Open Members in the active workspace.",
                  "Choose Invite member and assign a role.",
                  "PayLens sends the recipient an invitation link.",
                  "Recipient signs in or creates an account, then accepts.",
                  "A scoped Organization Membership grants the chosen role.",
                ].map((step, index) => (
                  <li className="rounded-sm bg-black/[.035] p-4 dark:bg-white/[.06]" key={step}>
                    <span className="font-mono text-[#9252e8]">0{index + 1}</span>
                    <p className="mt-2 text-sm leading-6 text-black/65 dark:text-white/65">
                      {step}
                    </p>
                  </li>
                ))}
              </ol>
              <p className="mt-4 text-sm leading-6 text-black/60 dark:text-white/60">
                This is optional for a reviewer, but it demonstrates that PayLens is genuinely
                multi-user and tenant-scoped—not a single-user employee database.
              </p>
            </div>
          </Section>

          <Section
            eyebrow="Multi-user workspace"
            id="workspace-invites"
            lead="A workforce record and a person who can sign in are deliberately separate concepts."
            title="Collaborating in a workspace"
          >
            <div className="grid gap-4 lg:grid-cols-2">
              <article className="rounded-md border border-black/10 p-6 dark:border-white/10">
                <UserPlus className="size-5 text-[#9252e8]" />
                <h3 className="mt-4 text-xl font-medium">Employees are not application users</h3>
                <p className="mt-3 text-sm leading-6 text-black/60 dark:text-white/60">
                  An Employee is workforce data. A workspace User and OrganizationMembership
                  represent a trusted collaborator who can sign in and manage that organization.
                  Importing 10,000 Employees never creates 10,000 login accounts.
                </p>
              </article>
              <article className="rounded-md border border-[#ef2cc1]/25 bg-[#ef2cc1]/[.05] p-6 dark:bg-[#ef2cc1]/10">
                <h3 className="text-xl font-medium">Explicit invitations, scoped authority</h3>
                <p className="mt-3 text-sm leading-6 text-black/60 dark:text-white/60">
                  An organization administrator can invite an HR administrator, HR manager, or
                  another organization administrator. The recipient authenticates or creates an
                  account, accepts the invitation, receives an OrganizationMembership, and their
                  role determines access.
                </p>
                <p className="mt-4 font-mono text-xs text-[#b31685] dark:text-[#ff9ce0]">
                  Organization admin → invitation → recipient auth → acceptance → membership →
                  role-based access
                </p>
              </article>
            </div>
          </Section>

          <Section
            eyebrow="Performance decisions"
            id="optimizations"
            title="Engineering optimizations"
          >
            <div className="space-y-3">
              {optimizations.map(([title, decision, impact], index) => (
                <article
                  className="grid gap-3 rounded-md border border-black/10 p-5 sm:grid-cols-[2rem_1fr_auto] sm:items-start dark:border-white/10"
                  key={`${title}-${index}`}
                >
                  <span className="font-mono text-sm text-[#9252e8]">0{index + 1}</span>
                  <div>
                    <h3 className="font-medium">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-black/60 dark:text-white/60">
                      <strong className="text-black dark:text-white">Decision: </strong>
                      {decision}
                    </p>
                  </div>
                  <p className="max-w-48 text-xs leading-5 text-[#6840ba] dark:text-[#d6ceff]">
                    <strong>Impact: </strong>
                    {impact}
                  </p>
                </article>
              ))}
            </div>
          </Section>

          <Section
            eyebrow="Boundary first"
            id="security"
            lead="The active membership and active organization are server-side authority. Client-supplied organization identity never grants access."
            title="Security and multi-tenancy"
          >
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                [
                  "Tenant isolation",
                  "Employee, Department, Compensation, Import, and Export access is scoped to the active organization.",
                ],
                [
                  "RBAC and session authority",
                  "Role checks operate on the active membership; secure cookie sessions rotate and revoke safely.",
                ],
                [
                  "Private files",
                  "The bucket remains private. Requester-and-tenant scoped records issue short-lived signed upload/download URLs.",
                ],
              ].map(([title, body], index) => (
                <div
                  className="rounded-md border border-black/10 p-5 dark:border-white/10"
                  key={`${title}-${index}`}
                >
                  <ShieldCheck className="size-5 text-[#9252e8]" />
                  <h3 className="mt-3 font-medium">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-black/60 dark:text-white/60">{body}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section
            eyebrow="Advisory only"
            id="ai"
            lead="OpenAI is optional, advisory intelligence for the narrow case where deterministic Department matching cannot confidently resolve a human-entered label."
            title="AI-assisted Employee Import"
          >
            <div className="grid gap-5 lg:grid-cols-[auto_1fr]">
              <div className="w-fit">
                <TechIcon alt="OpenAI" src={techIcons.openai} tone="violet" />
              </div>
              <div className="rounded-md border border-[#ef2cc1]/25 bg-[#ef2cc1]/[.06] p-6 dark:bg-[#ef2cc1]/10">
                <p className="text-sm leading-7 text-black/70 dark:text-white/70">
                  For example, <code>Engg</code> can be suggested as the tenant’s existing{" "}
                  <code>Engineering</code> Department. PayLens normalizes the label and attempts an
                  exact tenant-scoped match first; only unresolved or ambiguous Department labels
                  and relevant existing Department names may be sent for a suggestion. Employee
                  names, emails, numbers, compensation data, and complete CSV/XLSX files are not
                  required for this task.
                </p>
                <p className="mt-4 text-sm leading-7 text-black/70 dark:text-white/70">
                  The suggestion appears in import review. User-approved validation resolves the
                  final Department, and the apply phase uses that approved mapping. OpenAI does not
                  select a tenant and does not directly mutate the database.
                </p>
              </div>
            </div>
            <div className="mt-5 grid gap-3 rounded-md border border-black/10 p-5 text-center text-xs dark:border-white/10 md:grid-cols-5 md:items-center">
              {[
                "Imported Department label",
                "Normalize + exact tenant match",
                "OpenAI advisory suggestion only when unresolved",
                "Review / resolve existing or new Department",
                "Apply approved import",
              ].map((step, index) => (
                <div className="flex items-center gap-2 md:block" key={step}>
                  <span className="font-mono text-[#9252e8]">0{index + 1}</span>
                  <p className="mt-0.5 text-black/65 md:mt-2 dark:text-white/65">{step}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <p className="rounded-md border border-black/10 p-5 text-sm leading-6 text-black/60 dark:border-white/10 dark:text-white/60">
                <strong className="text-black dark:text-white">Deterministic first:</strong> exact
                normalized matches are cheaper, reproducible, lower latency, easier to test, and do
                not need an LLM.
              </p>
              <p className="rounded-md border border-black/10 p-5 text-sm leading-6 text-black/60 dark:border-white/10 dark:text-white/60">
                <strong className="text-black dark:text-white">Fail-soft by design:</strong>{" "}
                <code>OPENAI_API_KEY</code> is optional. If it is disabled, unavailable, times out,
                or returns unusable output, validation continues and unresolved mappings stay
                visible for manual resolution or creation.
              </p>
            </div>
            <p className="mt-5 rounded-md border border-[#9d6cff]/25 bg-[#bdbbff]/10 p-5 text-sm leading-6 text-black/70 dark:bg-[#bdbbff]/[.08] dark:text-white/70">
              <strong className="text-black dark:text-white">Privacy boundary:</strong> PayLens does
              not expose employee personal data to OpenAI. It does not send employee names, work
              emails, employee numbers, compensation data, or complete CSV/XLSX files.
              Department-name suggestions need only unresolved Department labels and relevant
              existing Department names.
            </p>
            <p className="mt-5 font-mono text-xs text-black/50 dark:text-white/50">
              The advisory model is configurable through <code>OPENAI_MODEL</code>; no key or fixed
              model name is published here.
            </p>
          </Section>

          <Section
            eyebrow="Scope discipline"
            id="tradeoffs"
            title="What I deliberately did not build"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                [
                  "REST, not GraphQL",
                  "Resource-oriented contracts and Swagger already fit the scope.",
                ],
                [
                  "Modular monolith, not microservices",
                  "The operational distribution tax is not justified; workers can separate later.",
                ],
                [
                  "BullMQ, not Kafka",
                  "Retries, pause/resume, and background jobs fit Redis/BullMQ directly.",
                ],
                [
                  "Polling, not WebSockets",
                  "Human-scale transfer progress works reliably with short React Query polling.",
                ],
                [
                  "PostgreSQL search, not Elasticsearch",
                  "Tenant-scoped prefix search is well served by indexed Postgres.",
                ],
                [
                  "No FX conversion",
                  "Cross-currency salary aggregation would be misleading without a rate model.",
                ],
                [
                  "Deterministic-first matching, not AI-first matching",
                  "Normalized tenant matches are reproducible and inexpensive. OpenAI is an optional advisory fallback for ambiguous Department labels; sending every import row to an LLM would add cost, latency, data exposure, and an unnecessary external dependency.",
                ],
              ].map(([title, body], index) => (
                <article
                  className="rounded-md border border-black/10 p-5 dark:border-white/10"
                  key={`${title}-${index}`}
                >
                  <h3 className="font-medium">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-black/60 dark:text-white/60">{body}</p>
                </article>
              ))}
            </div>
          </Section>

          <Section eyebrow="Independent deployables" id="deployment" title="Deployment topology">
            <div className="grid gap-4 lg:grid-cols-2">
              <article className="rounded-md bg-[#080819] p-6 text-white">
                <p className="font-mono text-[10px] tracking-[.1em] text-[#bdbbff] uppercase">
                  Frontend
                </p>
                <h3 className="mt-3 text-xl">Next standalone / Node 22</h3>
                <p className="mt-3 text-sm leading-6 text-white/65">
                  A separate non-root Node 22 bookworm-slim image runs the Next standalone output on
                  port 3000. <code>NEXT_PUBLIC_API_BASE_URL</code> is a build-time public value.
                </p>
                <ExternalButton
                  className="mt-4 border-white/15 bg-white/10 text-white"
                  href={links.app}
                >
                  Open frontend
                </ExternalButton>
              </article>
              <article className="rounded-md border border-black/10 p-6 dark:border-white/10">
                <p className="font-mono text-[10px] tracking-[.1em] text-[#9252e8] uppercase">
                  Backend
                </p>
                <h3 className="mt-3 text-xl">Nest runtime / Node 24</h3>
                <p className="mt-3 text-sm leading-6 text-black/60 dark:text-white/60">
                  A separate non-root Node 24 bookworm-slim image runs compiled NestJS on port 4000.
                  Its entrypoint applies checked-in Prisma migrations before boot; PostgreSQL and
                  Redis stay external. The OpenTelemetry loader is active.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <ExternalButton href={links.swagger}>Swagger</ExternalButton>
                  <ExternalButton href={links.health}>Liveness</ExternalButton>
                  <ExternalButton href={links.ready}>Readiness</ExternalButton>
                </div>
              </article>
            </div>
          </Section>

          <Section eyebrow="Safe configuration" id="environment" title="Environment variables">
            <div className="rounded-md border border-black/10 p-5 dark:border-white/10">
              <p className="font-medium">Frontend</p>
              <p className="mt-2 text-sm text-black/60 dark:text-white/60">
                <code>NEXT_PUBLIC_API_BASE_URL</code> is the browser-reachable API base including{" "}
                <code>/api/v1</code>. It is build-time and public: never put secrets in{" "}
                <code>NEXT_PUBLIC_*</code>.
              </p>
              <br />
              <CopyCode>{"NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api/v1"}</CopyCode>
            </div>
            <div className="mt-4 overflow-x-auto rounded-md border border-black/10 dark:border-white/10">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead className="bg-black/[.035] font-mono text-[10px] tracking-[.08em] text-black/50 uppercase dark:bg-white/[.05] dark:text-white/50">
                  <tr>
                    <th className="p-4">Variable</th>
                    <th className="p-4">Purpose</th>
                    <th className="p-4">Contract</th>
                    <th className="p-4">Safe example</th>
                  </tr>
                </thead>
                <tbody>
                  {envRows.map(([name, purpose, contract, example], index) => (
                    <tr
                      className="border-t border-black/8 dark:border-white/10"
                      key={`${name}-${index}`}
                    >
                      <td className="p-4 font-mono text-xs">{name}</td>
                      <td className="p-4 text-black/60 dark:text-white/60">{purpose}</td>
                      <td className="p-4 text-[#9252e8]">{contract}</td>
                      <td className="p-4 font-mono text-xs text-black/50 dark:text-white/50">
                        {example}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section eyebrow="Reproducible setup" id="local-setup" title="Local development">
            <p className="mb-4 text-sm text-black/60 dark:text-white/60">
              Prerequisites: Git, npm, PostgreSQL, Redis, and preferably Node 22 for frontend / Node
              24 for backend.
            </p>
            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <p className="mb-2 font-medium">Backend</p>
                <CopyCode>{`git clone ${links.backendSource}.git\ncd paylens-server\nnpm ci\ncp .env.example .env\nnpm run prisma:generate\nnpm run prisma:migrate\nnpm run seed\nnpm run dev`}</CopyCode>
                <p className="mt-3 text-sm text-black/60 dark:text-white/60">
                  Configure DATABASE_URL, REDIS_URL, FRONTEND_URL, and a 32+ character auth secret.
                  SMTP is optional locally; file storage is needed only when testing transfers.
                </p>
              </div>
              <div>
                <p className="mb-2 font-medium">Frontend</p>
                <CopyCode>{`git clone ${links.frontend}.git\ncd paylens-app\nnpm ci\ncp .env.example .env.local\n# NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api/v1\nnpm run dev`}</CopyCode>
                <p className="mt-3 text-sm text-black/60 dark:text-white/60">
                  Open <code>http://localhost:3000</code>. Swagger is available locally at{" "}
                  <code>http://localhost:4000/api/docs</code>.
                </p>
              </div>
            </div>
          </Section>

          <Section eyebrow="Confidence" id="testing" title="Quality, schema, and seed data">
            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <p className="mb-2 font-medium">Frontend gates</p>
                <CopyCode>
                  {
                    "npm run format:check\nnpm run lint\nnpm run typecheck\nnpm run test\nnpm run build"
                  }
                </CopyCode>
              </div>
              <div>
                <p className="mb-2 font-medium">Backend gates</p>
                <CopyCode>
                  {
                    "npm run format:check\nnpm run lint\nnpm run typecheck\nnpm run prisma:validate\nnpm run test\nnpm run test:integration\nnpm run test:e2e\nnpm run build"
                  }
                </CopyCode>
              </div>
            </div>
            <p className="mt-5 text-sm leading-6 text-black/60 dark:text-white/60">
              Prisma migrations are checked in and deployment uses{" "}
              <code>prisma migrate deploy</code>, never <code>db push</code>. Seed commands (
              <code>seed</code>, <code>seed:verify</code>, <code>seed:rollback</code>) exercise
              multi-tenancy, large employee directories, departments, and safe demo flows without
              publishing account credentials.
            </p>
          </Section>

          <Section eyebrow="Reviewer path" id="walkthrough" title="Suggested 5-minute review">
            <ol className="grid gap-3 sm:grid-cols-2">
              {[
                "Open /docs and review the architecture and technology stack.",
                "Open the live app; create an account or use the Reviewer Demo when supplied.",
                "Create or select an organization workspace.",
                "Download the 10,000 Employee synthetic CSV.",
                "Open Employees → Import and upload the CSV.",
                "Review validation, Department resolution, and the Action Center progress.",
                "Confirm the import, then browse, search, and filter the Employee Directory.",
                "Review Departments, an Employee Profile, and Compensation safeguards.",
                "Export the dataset back to CSV or XLSX if desired.",
                "Optionally invite a second workspace user from Members to observe role-based access.",
                "Open Swagger, then inspect the frontend and backend repositories.",
                "Review engineering optimizations and deterministic-first AI trade-offs.",
              ].map((item, index) => (
                <li
                  className="flex gap-4 rounded-md border border-black/10 p-4 dark:border-white/10"
                  key={item}
                >
                  <span className="font-mono text-[#9252e8]">0{index + 1}</span>
                  <span className="text-sm text-black/70 dark:text-white/70">{item}</span>
                </li>
              ))}
            </ol>
            <figure className="mt-6 overflow-hidden rounded-md border border-[#9d6cff]/30 bg-[#bdbbff]/10 p-3 shadow-[0_18px_44px_rgba(124,92,255,.14)] dark:bg-[#bdbbff]/[.08] sm:p-5">
              <Image
                alt="PayLens Action Center showing an employee import validating at 49 percent"
                className="w-full rounded-sm border border-black/10 dark:border-white/10"
                height={694}
                src="/docs/action-center-progress.png"
                width={2550}
              />
              <figcaption className="px-1 pt-4 text-sm leading-6 text-black/65 dark:text-white/65">
                Follow an import or export from the Action Center in the dashboard header. Active
                transfers show their current phase, live progress, and available pause or cancel
                actions; completed transfers remain available in Recent for download or review.
              </figcaption>
            </figure>
          </Section>

          <Section eyebrow="Builder" id="about" title="About the engineer">
            <div className="grid gap-6 rounded-md border border-black/10 p-6 sm:grid-cols-[120px_1fr] dark:border-white/10">
              <Image
                alt="Narendra Maurya"
                className="size-28 rounded-md object-cover"
                height={112}
                src="https://assets.signalog.co/Global/Personal-Nandy/Profile.png"
                width={112}
              />
              <div>
                <h3 className="text-2xl font-medium">Narendra Maurya</h3>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-black/60 dark:text-white/60">
                  Full-stack and platform engineer focused on backend systems, product
                  infrastructure, distributed workloads, product implementation, developer
                  education, and media/localization experimentation.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <ExternalButton href="https://assets.signalog.co/Global/Personal-Nandy/Narendra_Maurya_Resume_ATS_2026.pdf">
                    Resume PDF
                  </ExternalButton>
                  <ExternalButton href="https://assets.signalog.co/Global/Personal-Nandy/Narendra_Maurya_Cover_Letter_ATS_2026.docx">
                    Cover Letter
                  </ExternalButton>
                  <ExternalButton href="https://github.com/nandymandy1">GitHub</ExternalButton>
                  <ExternalButton href="https://www.youtube.com/@TheCodebookInc">
                    <span className="inline-flex items-center gap-2">
                      <Play className="size-3.5" />
                      Watch The Codebook
                    </span>
                  </ExternalButton>
                </div>
              </div>
            </div>
          </Section>

          <Section eyebrow="Beyond PayLens" id="other-work" title="Other work">
            <div className="grid gap-4 lg:grid-cols-2">
              <article className="rounded-md bg-[#080819] p-6 text-white">
                <p className="font-mono text-[10px] tracking-[.1em] text-[#bdbbff] uppercase">
                  Engineering / products
                </p>
                <h3 className="mt-4 text-2xl">Signalog</h3>
                <p className="mt-3 text-sm leading-6 text-white/65">
                  Customer feedback and product-operations platform combining bug reporting, feature
                  requests, changelog/reactions, and automatic technical context capture.
                </p>
                <ExternalButton
                  className="mt-5 border-white/15 bg-white/10 text-white"
                  href="https://signalog.co"
                >
                  Visit Signalog
                </ExternalButton>
              </article>
              <article className="rounded-md border border-black/10 p-6 dark:border-white/10">
                <p className="font-mono text-[10px] tracking-[.1em] text-[#9252e8] uppercase">
                  Engineering / products
                </p>
                <h3 className="mt-4 text-2xl">I-DACS / W.A.G.E.S.</h3>
                <p className="mt-3 text-sm leading-6 text-black/60 dark:text-white/60">
                  Industrial infrastructure and resource-intelligence work spanning water, air, gas,
                  electricity, steam, telemetry ingestion, integrations, automation, visualization,
                  and edge workflows.
                </p>
                <ExternalButton className="mt-5" href="https://i-dacs.com">
                  Visit I-DACS
                </ExternalButton>
              </article>
              <article className="rounded-md border border-[#ef2cc1]/25 bg-[#ef2cc1]/[.05] p-6 dark:bg-[#ef2cc1]/10">
                <p className="font-mono text-[10px] tracking-[.1em] text-[#b31685] uppercase dark:text-[#ff9ce0]">
                  Media / localization
                </p>
                <h3 className="mt-4 text-2xl">From Networks</h3>
                <p className="mt-3 text-sm leading-6 text-black/60 dark:text-white/60">
                  A media/localization platform exploring Hindi-language adaptation, multilingual
                  audiences, creator partnerships, content production workflows, and distribution
                  operations.
                </p>
                <ExternalButton className="mt-5" href="https://fromNetworks.com">
                  Visit From Networks
                </ExternalButton>
              </article>
              <article className="rounded-md border border-black/10 p-6 dark:border-white/10">
                <p className="font-mono text-[10px] tracking-[.1em] text-[#9252e8] uppercase">
                  Media / education
                </p>
                <h3 className="mt-4 flex items-center gap-2 text-2xl">
                  <Play className="size-5 text-[#ef2cc1]" />
                  The Codebook Inc.
                </h3>
                <p className="mt-3 text-sm leading-6 text-black/60 dark:text-white/60">
                  Programming-focused YouTube channel publishing software development tutorials and
                  technical educational content.
                </p>
                <ExternalButton className="mt-5" href="https://www.youtube.com/@TheCodebookInc">
                  Watch The Codebook
                </ExternalButton>
              </article>
            </div>
          </Section>
        </div>
      </div>
      <section className="border-t border-black/8 bg-[#080819] px-4 py-16 text-white dark:border-white/10 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="font-mono text-[10px] tracking-[.12em] text-[#bdbbff] uppercase">
              PayLens engineering
            </p>
            <h2 className="mt-3 text-3xl tracking-tight sm:text-5xl">Ready for a closer look?</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <ExternalButton className="border-white/15 bg-white/10 text-white" href={links.app}>
              Live App
            </ExternalButton>
            <ExternalButton
              className="border-white/15 bg-white/10 text-white"
              href={links.showcase}
            >
              Component Showcase
            </ExternalButton>
            <ExternalButton className="border-white/15 bg-white/10 text-white" href={links.swagger}>
              Swagger API
            </ExternalButton>
          </div>
        </div>
      </section>
    </main>
  );
};

export default DocsContent;
