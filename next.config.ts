import type { NextConfig } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const nextConfig: NextConfig = {
  async rewrites() {
    // Les avatars sont servis par l'API sur /uploads. Le serveur renvoie un chemin
    // relatif (/uploads/xxx) : on proxifie vers l'API pour que <img src="/uploads/...">
    // soit résolu côté API et non côté front (sinon 404).
    return [
      {
        source: "/uploads/:path*",
        destination: `${API_URL}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
