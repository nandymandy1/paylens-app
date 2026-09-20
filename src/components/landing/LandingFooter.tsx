"use client";

import Link from "next/link";
import type { FC } from "react";
import PayLensLogo from "@/components/brand/PayLensLogo";
import { AUTH_ROUTES } from "@/utils/routes";

const FOOTER_LINKS = {
  product: [
    { href: "/home", label: "Home" },
    { href: "/about-us", label: "About" },
    { href: "/docs", label: "Engineering docs" },
  ],
  support: [
    { href: "/contact", label: "Contact" },
    { href: "/terms-of-service", label: "Terms" },
  ],
  account: [
    { href: AUTH_ROUTES.login, label: "Sign in" },
    { href: AUTH_ROUTES.register, label: "Create organization" },
  ],
};

const LandingFooter: FC = () => {
  return (
    <footer className="border-t border-cinema-footer-border bg-cinema-footer-bg">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-8">
        <div className="grid gap-8 sm:grid-cols-4">
          <div>
            <Link aria-label="Go to PayLens home" href="/home">
              <PayLensLogo size="sm" />
            </Link>
            <p className="mt-2 text-sm text-cinema-footer-text">
              Compensation operations, made clear.
            </p>
          </div>
          {(
            [
              ["Product", FOOTER_LINKS.product],
              ["Support", FOOTER_LINKS.support],
              ["Account", FOOTER_LINKS.account],
            ] as const
          ).map(([heading, links]) => (
            <div key={heading}>
              <p className="font-mono text-[10px] font-medium tracking-[0.06em] uppercase text-cinema-text-muted">
                {heading}
              </p>
              <ul className="mt-3 space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      className="text-sm text-cinema-footer-link transition-colors duration-150 hover:text-cinema-footer-link-hover"
                      href={link.href}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 border-t border-cinema-footer-border pt-6">
          <p
            aria-hidden="true"
            className="overflow-hidden text-[14vw] leading-none font-medium tracking-tight text-cinema-footer-wordmark select-none sm:text-7xl"
          >
            PayLens
          </p>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
