import Link from "next/link";
import type { FC, PropsWithChildren } from "react";

const PUBLIC_LINKS = [
  { href: "/home", label: "Home" },
  { href: "/about-us", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/terms-of-service", label: "Terms" },
];

const PublicLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="flex min-h-screen flex-col bg-canvas text-ink">
      <header className="border-b border-hairline bg-surface">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4 sm:px-8">
          <Link className="font-mono text-sm font-medium tracking-[0.05em] uppercase" href="/home">
            PayLens
          </Link>
          <nav aria-label="Public" className="flex items-center gap-5 text-sm">
            {PUBLIC_LINKS.map((link) => (
              <Link className="text-body hover:text-ink" href={link.href} key={link.href}>
                {link.label}
              </Link>
            ))}
            <Link
              className="inline-flex min-h-9 items-center rounded-sm bg-primary px-4 font-mono text-xs font-medium tracking-[0.005em] text-on-primary uppercase hover:opacity-80"
              href="/login"
            >
              Sign in
            </Link>
          </nav>
        </div>
      </header>
      <div className="flex-1">{children}</div>
      <footer className="border-t border-hairline bg-surface">
        <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-8">
          <div className="grid gap-8 sm:grid-cols-4">
            <div>
              <p className="font-mono text-[11px] font-medium tracking-[0.05em] uppercase">
                PayLens
              </p>
              <p className="mt-2 text-sm text-body">Compensation operations, made clear.</p>
            </div>
            <div>
              <p className="font-mono text-[11px] font-medium tracking-[0.05em] text-body uppercase">
                Product
              </p>
              <ul className="mt-2 space-y-1 text-sm">
                <li>
                  <Link className="text-body hover:text-ink" href="/home">
                    Home
                  </Link>
                </li>
                <li>
                  <Link className="text-body hover:text-ink" href="/about-us">
                    About
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-mono text-[11px] font-medium tracking-[0.05em] text-body uppercase">
                Support
              </p>
              <ul className="mt-2 space-y-1 text-sm">
                <li>
                  <Link className="text-body hover:text-ink" href="/contact">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link className="text-body hover:text-ink" href="/terms-of-service">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-mono text-[11px] font-medium tracking-[0.05em] text-body uppercase">
                Account
              </p>
              <ul className="mt-2 space-y-1 text-sm">
                <li>
                  <Link className="text-body hover:text-ink" href="/login">
                    Sign in
                  </Link>
                </li>
                <li>
                  <Link className="text-body hover:text-ink" href="/register">
                    Create organization
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <p
            aria-hidden="true"
            className="mt-10 overflow-hidden text-[18vw] leading-none font-medium tracking-tight text-hairline select-none sm:text-8xl"
          >
            paylens
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
