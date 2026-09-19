import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  output: "standalone",

  async redirects() {
    return [
      {
        source: "/",
        destination: "/home",
        permanent: false,
      },
      {
        source: "/login",
        destination: "/auth/login",
        permanent: false,
      },
      {
        source: "/register",
        destination: "/auth/register",
        permanent: false,
      },
      {
        source: "/forgot-password",
        destination: "/auth/forgot-password",
        permanent: false,
      },
      {
        source: "/reset-password",
        destination: "/auth/reset-password",
        permanent: false,
      },
      {
        source: "/verify-email",
        destination: "/auth/verify-email",
        permanent: false,
      },
      {
        source: "/invite/accept",
        destination: "/auth/invite/accept",
        permanent: false,
      },
      {
        source: "/select-organization",
        destination: "/auth/select-organization",
        permanent: false,
      },
      {
        source: "/onboarding/organization",
        destination: "/auth/onboarding/organization",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
