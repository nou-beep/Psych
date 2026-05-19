/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Three-portal architecture: thesis, internship, research, and
  // related work moved physically into /formation/* so the Formation
  // Portal owns its own namespace. These redirects keep every legacy
  // deep link working — bookmarks and existing internal Link refs
  // continue to land on the right page.
  async redirects() {
    return [
      // Thesis subroutes
      { source: "/thesis", destination: "/formation/thesis", permanent: false },
      { source: "/thesis/writer", destination: "/formation/thesis/writer", permanent: false },
      { source: "/thesis/dashboard", destination: "/formation/thesis/dashboard", permanent: false },
      { source: "/thesis/exports", destination: "/formation/thesis/exports", permanent: false },
      { source: "/thesis/import", destination: "/formation/thesis/import", permanent: false },

      // Internship subroutes
      { source: "/internship", destination: "/formation/internship", permanent: false },
      { source: "/internship/cases/:id", destination: "/formation/internship/cases/:id", permanent: false },
      { source: "/internship/grid-print/:adminId", destination: "/formation/internship/grid-print/:adminId", permanent: false },
      { source: "/internship/report-print/:reportId", destination: "/formation/internship/report-print/:reportId", permanent: false },

      // Research moves under thesis (academic surface)
      { source: "/research", destination: "/formation/thesis/stats", permanent: false },
      { source: "/research/literature", destination: "/formation/thesis/literature", permanent: false },
      { source: "/research/apa", destination: "/formation/thesis/apa", permanent: false },
      { source: "/research/articles", destination: "/formation/thesis/articles", permanent: false },
      { source: "/research/quotes", destination: "/formation/thesis/quotes", permanent: false },
      { source: "/research/audio-sync", destination: "/formation/thesis/audio-sync", permanent: false },

      // Supervision + grids move into internship
      { source: "/supervision", destination: "/formation/internship/supervision", permanent: false },
      { source: "/grids", destination: "/formation/internship/tests-grids", permanent: false },

      // Materials
      { source: "/transcripts", destination: "/formation/materials/transcripts", permanent: false },
      { source: "/material", destination: "/formation/materials/resources", permanent: false },
    ];
  },
};

export default nextConfig;
