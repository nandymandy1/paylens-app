import type { Metadata } from "next";
import DocsContent from "@/components/docs/DocsContent";
import PublicLayout from "@/components/layout/PublicLayout";

export const metadata: Metadata = {
  title: "PayLens Engineering Documentation",
  description:
    "Architecture, technology, deployment, security, optimization and local setup documentation for PayLens.",
  openGraph: {
    title: "PayLens Engineering Documentation",
    description:
      "Architecture, technology, deployment, security, optimization and local setup documentation for PayLens.",
  },
};

const DocsPage = () => (
  <PublicLayout>
    <DocsContent />
  </PublicLayout>
);

export default DocsPage;
