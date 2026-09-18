import type { FC, PropsWithChildren } from "react";
import Card from "@/components/ui/Card";
import PayLensLogo from "@/components/brand/PayLensLogo";

type AuthCardProps = PropsWithChildren<{
  eyebrow: string;
  title: string;
  description?: string;
}>;

const AuthCard: FC<AuthCardProps> = ({ children, description, eyebrow, title }) => {
  return (
    <main className="grid min-h-screen bg-canvas text-ink lg:grid-cols-2">
      <section className="flex items-center px-4 py-16 sm:px-8 lg:px-16">
        <Card className="auth-form-entrance mx-auto w-full max-w-[27.5rem]">
          <Card.Header>
            <PayLensLogo className="auth-logo-entrance mb-8" size="md" />
            <p className="font-mono text-[11px] font-medium tracking-[0.05em] text-body uppercase">
              {eyebrow}
            </p>
            <h1 className="mt-3 text-2xl leading-8 font-medium tracking-tight">{title}</h1>
            {description && <p className="mt-2 text-base leading-6 text-body">{description}</p>}
          </Card.Header>
          <Card.Content>{children}</Card.Content>
        </Card>
      </section>
      <aside className="auth-brand-panel relative hidden overflow-hidden bg-canvas-dark px-12 py-12 text-on-dark lg:flex lg:flex-col xl:px-16 xl:py-16">
        <div aria-hidden="true" className="auth-brand-ribbon auth-brand-ribbon-one" />
        <div aria-hidden="true" className="auth-brand-ribbon auth-brand-ribbon-two" />
        <div className="auth-brand-content relative z-10 mx-auto flex h-full w-full max-w-[34rem] flex-col">
          <PayLensLogo className="auth-brand-enter auth-brand-enter-1" size="md" theme="dark" />
          <div className="relative my-auto pt-16 pb-12">
            <div aria-hidden="true" className="auth-brand-glow" />
            <img
              alt=""
              aria-hidden="true"
              className="auth-brand-mark auth-brand-enter auth-brand-enter-2 h-64 w-auto max-w-full"
              src="/brand/paylens-mark.svg"
            />
            <p className="auth-brand-enter auth-brand-enter-3 mt-8 font-mono text-[11px] font-medium tracking-[0.1em] text-on-dark/60 uppercase">
              Compensation intelligence
            </p>
            <p className="auth-brand-enter auth-brand-enter-4 mt-3 max-w-md text-4xl leading-[1.08] font-medium tracking-tight xl:text-[2.75rem]">
              See the bigger picture in pay.
            </p>
          </div>
          <div className="auth-brand-enter auth-brand-enter-5 mt-auto">
            <p className="max-w-sm text-sm leading-6 text-on-dark/65">
              Turn compensation data into clear decisions, fair growth, and stronger teams.
            </p>
            <p className="mt-8 font-mono text-[10px] font-medium tracking-[0.1em] text-on-dark/45 uppercase">
              PayLens / Compensation OS
            </p>
          </div>
        </div>
      </aside>
    </main>
  );
};

export default AuthCard;
