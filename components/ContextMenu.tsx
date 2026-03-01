"use client";

import { useEffect, useRef, useState } from "react";
import type { Desk } from "@/types";

interface ContextMenuProps {
  x: number;
  y: number;
  deskId: string;
  onClose: () => void;
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onFlipHorizontal: () => void;
  onFlipVertical: () => void;
  onDelete: () => void;
  onLockWithName: (name: string) => void;
  onUnlock: () => void;
  desk: Desk;
  allNames: string[];
}

export function ContextMenu({
  x,
  y,
  onClose,
  onRotateLeft,
  onRotateRight,
  onFlipHorizontal,
  onFlipVertical,
  onDelete,
  onLockWithName,
  onUnlock,
  desk,
  allNames,
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [customName, setCustomName] = useState("");

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="fixed z-[100] min-w-[180px] py-1 rounded-lg shadow-lg border border-stone-200 bg-white dark:border-slate-700 dark:bg-slate-900"
      style={{ left: x, top: y }}
    >
      <button
        type="button"
        onClick={onRotateLeft}
        className="w-full px-3 py-2 text-left text-sm text-stone-700 hover:bg-stone-100 dark:text-slate-100 dark:hover:bg-slate-800"
      >
        Rotate 90° left
      </button>
      <button
        type="button"
        onClick={onRotateRight}
        className="w-full px-3 py-2 text-left text-sm text-stone-700 hover:bg-stone-100 dark:text-slate-100 dark:hover:bg-slate-800"
      >
        Rotate 90° right
      </button>
      <button
        type="button"
        onClick={onFlipHorizontal}
        className="w-full px-3 py-2 text-left text-sm text-stone-700 hover:bg-stone-100 dark:text-slate-100 dark:hover:bg-slate-800"
      >
        Flip horizontally
      </button>
      <button
        type="button"
        onClick={onFlipVertical}
        className="w-full px-3 py-2 text-left text-sm text-stone-700 hover:bg-stone-100 dark:text-slate-100 dark:hover:bg-slate-800"
      >
        Flip vertically
      </button>

      {desk.isLocked ? (
        <button
          type="button"
          onClick={onUnlock}
          className="w-full px-3 py-2 text-left text-sm text-stone-700 hover:bg-stone-100 dark:text-slate-100 dark:hover:bg-slate-800"
        >
          Unlock desk
        </button>
      ) : (
        <>
          {desk.assignedName && (
            <button
              type="button"
              onClick={() => onLockWithName(desk.assignedName!)}
              className="w-full px-3 py-2 text-left text-sm text-stone-700 hover:bg-stone-100 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              Lock desk with &quot;{desk.assignedName}&quot;
            </button>
          )}
          <div className="relative">
            <button
              type="button"
              onClick={() => setAssignOpen((o) => !o)}
              className="w-full px-3 py-2 text-left text-sm text-stone-700 hover:bg-stone-100 dark:text-slate-100 dark:hover:bg-slate-800 flex items-center justify-between"
            >
              Assign name
              <span className="text-stone-400 dark:text-slate-400">▾</span>
            </button>
            {assignOpen && (
              <div className="absolute left-0 right-0 top-full mt-0.5 bg-white border border-stone-200 rounded shadow-lg py-1 max-h-48 overflow-auto z-10 dark:bg-slate-900 dark:border-slate-700">
                <div className="px-2 py-1 border-b border-stone-100 dark:border-slate-700">
                  <input
                    type="text"
                    placeholder="Type name..."
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && customName.trim()) {
                        onLockWithName(customName.trim());
                        setAssignOpen(false);
                        setCustomName("");
                      }
                    }}
                    className="w-full text-sm px-2 py-1 border border-stone-200 rounded bg-white text-stone-900 placeholder:text-stone-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
                  />
                </div>
                {allNames.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => {
                      onLockWithName(name);
                      setAssignOpen(false);
                    }}
                    className="w-full px-3 py-1.5 text-left text-sm text-stone-700 hover:bg-stone-50 dark:text-slate-100 dark:hover:bg-slate-800"
                  >
                    {name}
                  </button>
                ))}
                {allNames.length === 0 && (
                  <div className="px-3 py-2 text-sm text-stone-500 dark:text-slate-400">
                    Add names in the panel first
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      <div className="border-t border-stone-200 dark:border-slate-700 my-1" />
      <button
        type="button"
        onClick={onDelete}
        className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-900/40"
      >
        Delete desk
      </button>
    </div>
  );
}
