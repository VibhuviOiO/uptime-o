

import React from "react";
import { useConfig } from "@/hooks/useConfig";

export default function Navbar() {
  const { data: config, loading } = useConfig();

  return (
    <nav className="w-full bg-white border-b border-gray-200 shadow-lg">
      <div className="container mx-auto flex items-center justify-center px-6 py-4 min-h-[72px]">
        <span className="font-extrabold text-2xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 text-center">
          {loading ? "Loading..." : config?.navbarTitle || "Status Dashboard"}
        </span>
      </div>
    </nav>
  );
}
