"use client";

import { Toolbar } from "@/components/Toolbar";
import { Canvas } from "@/components/Canvas";
import { NamesPanel } from "@/components/NamesPanel";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-stone-100 dark:bg-slate-900">
      <Toolbar />
      <div className="flex-1 flex flex-col sm:flex-row gap-4 p-4 overflow-auto">
        <main className="flex-1 min-w-0 flex justify-center items-stretch">
          <Canvas />
        </main>
        <aside className="w-full sm:w-72 flex-shrink-0">
          <NamesPanel />
        </aside>
      </div>
    </div>
  );
}
