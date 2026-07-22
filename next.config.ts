import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/privacy-policy", destination: "/privacy", permanent: true },
      { source: "/terms-conditions", destination: "/terms", permanent: true },
      { source: "/my-learning", destination: "/dashboard/course", permanent: false },
      { source: "/my-quizzes", destination: "/dashboard/quizzes", permanent: false },
      { source: "/my-billing", destination: "/dashboard/billing", permanent: false },
      { source: "/my-certificates", destination: "/dashboard/certificates", permanent: false },
      { source: "/my-schedule", destination: "/dashboard/schedule", permanent: false },
      { source: "/my-assignments", destination: "/dashboard/assignments", permanent: false },
      { source: "/payment-portal", destination: "/dashboard/billing", permanent: false },
    ];
  },
};

export default nextConfig;
