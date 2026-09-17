import type { FC, PropsWithChildren } from "react";
import Card from "@/components/ui/Card";

type AuthCardProps = PropsWithChildren<{
  eyebrow: string;
  title: string;
  description?: string;
}>;

const AuthCard: FC<AuthCardProps> = ({ children, description, eyebrow, title }) => {
  return (
    <main className="flex min-h-screen items-center bg-canvas px-4 py-20 text-ink sm:px-8">
      <Card className="mx-auto w-full max-w-md">
        <Card.Header>
          <p className="font-mono text-[11px] font-medium tracking-[0.05em] text-body uppercase">
            {eyebrow}
          </p>
          <h1 className="mt-3 text-2xl leading-8 font-medium tracking-tight">{title}</h1>
          {description && <p className="mt-2 text-base leading-6 text-body">{description}</p>}
        </Card.Header>
        <Card.Content>{children}</Card.Content>
      </Card>
    </main>
  );
};

export default AuthCard;
