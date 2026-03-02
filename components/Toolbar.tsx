"use client";

import { useDeskStore } from "@/hooks/useDeskStore";
import { useTheme } from "@/contexts/ThemeContext";
import { useCallback, useState } from "react";

export function Toolbar() {
  const { theme, toggleTheme } = useTheme();
  const {
    desks,
    namesList,
    removeMode,
    setRemoveMode,
    randomize,
    clearAssignments,
    resetAll,
    addDesk,
    createArrangement,
  } = useDeskStore();

  const [toast, setToast] = useState<string | null>(null);
  const [showArrangementDialog, setShowArrangementDialog] = useState(false);
  const [rowsInput, setRowsInput] = useState("2");
  const [colsInput, setColsInput] = useState("2");

  const unlockedDesks = desks.filter((d) => !d.isLocked);
  const nameCount = namesList.length;

  const showToast = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const handleRandomize = useCallback(() => {
    if (nameCount > unlockedDesks.length) {
      showToast("More names than unlocked desks — some names won’t be assigned.");
    }
    randomize();
  }, [nameCount, unlockedDesks.length, randomize, showToast]);

  const handleAddDesk = useCallback(() => {
    addDesk();
  }, [addDesk]);

  const handleCreateArrangement = useCallback(() => {
    setShowArrangementDialog(true);
  }, []);

  const handleConfirmArrangement = useCallback(() => {
    const rows = Number.parseInt(rowsInput, 10);
    const cols = Number.parseInt(colsInput, 10);

    if (!Number.isFinite(rows) || rows <= 0) {
      showToast("Rows must be a positive number.");
      return;
    }
    if (!Number.isFinite(cols) || cols <= 0) {
      showToast("Columns must be a positive number.");
      return;
    }

    createArrangement(rows, cols);
    setShowArrangementDialog(false);
  }, [rowsInput, colsInput, createArrangement, showToast]);

  return (
    <header className="flex flex-wrap items-center gap-3 px-4 py-3 bg-white border-b border-stone-200 shadow-sm dark:bg-slate-900/80 dark:border-slate-700/80">
      <h1 className="text-xl font-bold text-stone-800 dark:text-slate-100">Desk Randomizer</h1>

      <div className="flex items-center gap-2 flex-wrap flex-1">
        <button
          type="button"
          onClick={handleAddDesk}
          className="px-3 py-1.5 text-sm font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors dark:text-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700"
        >
          Add desk
        </button>

        <button
          type="button"
          onClick={handleCreateArrangement}
          className="px-3 py-1.5 text-sm font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors dark:text-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700"
        >
          Create desk arrangement
        </button>

        <button
          type="button"
          onClick={() => setRemoveMode(!removeMode)}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
            removeMode
              ? "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/40 dark:text-red-300 dark:hover:bg-red-800/60"
              : "bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
          }`}
        >
          {removeMode ? "Cancel remove" : "Remove mode"}
        </button>

        <button
          type="button"
          onClick={handleRandomize}
          className="px-4 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400 rounded-lg transition-colors"
        >
          Randomize 🎲
        </button>

        <button
          type="button"
          onClick={clearAssignments}
          className="px-3 py-1.5 text-sm font-medium text-stone-600 hover:text-stone-800 hover:bg-stone-100 dark:text-slate-200 dark:hover:text-white dark:hover:bg-slate-700 rounded-lg transition-colors"
        >
          Clear assignments
        </button>

        <button
          type="button"
          onClick={resetAll}
          className="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 dark:text-red-300 dark:hover:text-red-200 dark:hover:bg-red-900/40 rounded-lg transition-colors"
        >
          Reset all
        </button>
      </div>

      {/* Theme toggle — minimal icon button pushed to the far right */}
      <button
        type="button"
        onClick={toggleTheme}
        className="ml-auto flex h-9 w-9 items-center justify-center rounded-full transition-colors bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
        title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      >
        {theme === "dark" ? (
          /* Sun icon */
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        ) : (
          /* Moon icon */
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        )}
      </button>

      {showArrangementDialog && (
        <div className="fixed inset-0 z-[200] bg-black/40">
          <div className="absolute left-1/2 top-1/2 w-full max-w-xs -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-4 shadow-lg border border-stone-200 dark:bg-slate-900 dark:border-slate-700">
            <h2 className="mb-3 text-sm font-semibold text-stone-800 dark:text-slate-100">
              Create desk arrangement
            </h2>
            <div className="mb-2 flex items-center gap-2">
              <label className="w-16 text-xs text-stone-600 dark:text-slate-300">
                Rows
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={rowsInput}
                onChange={(e) => setRowsInput(e.target.value)}
                className="flex-1 rounded border border-stone-300 px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            <div className="mb-3 flex items-center gap-2">
              <label className="w-16 text-xs text-stone-600 dark:text-slate-300">
                Columns
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={colsInput}
                onChange={(e) => setColsInput(e.target.value)}
                className="flex-1 rounded border border-stone-300 px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowArrangementDialog(false)}
                className="px-3 py-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-md dark:text-slate-300 dark:hover:text-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmArrangement}
                className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div
          role="alert"
          className="fixed bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-amber-100 text-amber-900 text-sm rounded-lg shadow-lg border border-amber-200 dark:bg-amber-900/90 dark:text-amber-100 dark:border-amber-700 z-50"
        >
          {toast}
        </div>
      )}
    </header>
  );
}
