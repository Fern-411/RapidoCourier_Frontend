import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* ── Rewrites para desarrollo ──
     Proxy las peticiones al API Gateway para evitar problemas de CORS
     durante el desarrollo local. En producción, esto lo maneja Nginx/Traefik. */
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: "http://localhost:8080/api/v1/:path*",
      },
    ];
  },
};

export default nextConfig;
