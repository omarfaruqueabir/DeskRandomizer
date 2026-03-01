"use client";

import { useDeskStore } from "@/hooks/useDeskStore";
import { useCallback, useState } from "react";

export function NamesPanel() {
  const { namesList, addName, removeName } = useDeskStore();
  const [inputValue, setInputValue] = useState("");
  const desks = useDeskStore((s) => s.desks);
  const unlockedCount = desks.filter((d) => !d.isLocked).length;
  const nameCount = namesList.length;
  const emptyDesks = Math.max(0, unlockedCount - nameCount);
  const overflow = nameCount > unlockedCount;

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const parts = inputValue
        .split(/[,\n]/)
        .map((s) => s.trim())
        .filter(Boolean);
      parts.forEach((part) => addName(part));
      setInputValue("");
    },
    [inputValue, addName]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const pasted = e.clipboardData.getData("text");
      if (/[,\n]/.test(pasted)) {
        e.preventDefault();
        const parts = pasted
          .split(/[,\n]/)
          .map((s) => s.trim())
          .filter(Boolean);
        parts.forEach((part) => addName(part));
      }
    },
    [addName]
  );

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden dark:bg-slate-900/80 dark:border-slate-700">
      <div className="p-3 border-b border-stone-200 dark:border-slate-700">
        <h2 className="text-sm font-semibold text-stone-700 dark:text-slate-100 mb-2">
          Employee names
        </h2>
        <form onSubmit={handleSubmit}>
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onPaste={handlePaste}
            placeholder="Type or paste names, separated by commas or new lines"
            className="w-full h-24 px-3 py-2 text-sm border border-stone-200 bg-white rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 text-stone-900 placeholder:text-stone-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-teal-500/60 dark:focus:border-teal-400"
            rows={4}
          />
          <button
            type="submit"
            className="mt-2 w-full py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors dark:bg-teal-500 dark:hover:bg-teal-400 dark:text-slate-950"
          >
            Add names
          </button>
        </form>
      </div>

      <div className="flex-1 overflow-auto p-3">
        <p className="text-xs text-stone-500 dark:text-slate-400 mb-2">
          {nameCount} name{nameCount !== 1 ? "s" : ""}, {desks.length} desk
          {desks.length !== 1 ? "s" : ""} — {unlockedCount} unlocked
          {emptyDesks > 0 && `, ${emptyDesks} will be empty`}
          {overflow && " (more names than desks)"}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {namesList.map((name, index) => (
            <span
              key={`${name}-${index}`}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-stone-100 text-stone-700 text-sm dark:bg-slate-800 dark:text-slate-100"
            >
              {name}
              <button
                type="button"
                onClick={() => removeName(index)}
                className="text-stone-400 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 rounded p-0.5"
                aria-label={`Remove ${name}`}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
