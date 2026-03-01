"use client";

import { useDraggable } from "@dnd-kit/core";
import { motion } from "framer-motion";
import type { Desk as DeskType } from "@/types";

const DESK_WIDTH = 80;
const DESK_HEIGHT = 60;
const CHAIR_SIZE = 24;

interface DeskProps {
  desk: DeskType;
  onRemove?: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  removeMode?: boolean;
}

export function Desk({
  desk,
  onRemove,
  onContextMenu,
  removeMode,
}: DeskProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: desk.id,
    data: { desk },
  });

  const dragTranslate =
    transform?.x != null && transform?.y != null
      ? ` translate(${transform.x}px, ${transform.y}px)`
      : "";

  const displayName = desk.isLocked && desk.lockedName ? desk.lockedName : desk.assignedName;
  const flipH = desk.flipHorizontal ?? false;
  const flipV = desk.flipVertical ?? false;
  const scaleX = flipH ? -1 : 1;
  const scaleY = flipV ? -1 : 1;

  return (
    <div
      ref={setNodeRef}
      style={{
        position: "absolute",
        left: desk.x,
        top: desk.y,
        width: DESK_WIDTH,
        height: DESK_HEIGHT + CHAIR_SIZE,
        // Apply drag translation first, then scale (flip), then rotate.
        transform: `${dragTranslate} scale(${scaleX}, ${scaleY}) rotate(${desk.rotation}deg)`,
      }}
      onContextMenu={onContextMenu}
      className={`group touch-none ${isDragging ? "z-50 opacity-90" : "z-10"}`}
    >
      <div
        {...attributes}
        {...listeners}
        className={`
          relative w-full h-full cursor-grab active:cursor-grabbing
          ${removeMode ? "cursor-pointer hover:ring-2 hover:ring-red-400" : ""}
          ${desk.isLocked ? "ring-2 ring-amber-500 ring-offset-1 rounded" : ""}
          hover:ring-2 hover:ring-teal-400/80 rounded transition-shadow
        `}
      >
        {/* Minimal desk + laptop + chair, matching reference icon */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 80 84"
          aria-hidden
        >
          {/* Desk top */}
          <rect x="2" y="4" width="76" height="42" rx="2" fill="var(--desk-fill)" />

          {/* Laptop body (closed rectangle on desk) */}
          <rect x="26" y="16" width="28" height="20" rx="1.8" fill="var(--desk-surface)" />
          {/* Simple hinge/slot indicator */}
          <rect x="37" y="25" width="6" height="2" rx="1" fill="var(--desk-fill)" />

          {/* Small accessory / power button to the right of laptop */}
          <rect x="58" y="24" width="4" height="4" rx="2" fill="var(--desk-surface)" />

          {/* Chair U-shape centered below desk */}
          <path
            d="M20 60 C20 50, 60 50, 60 60 L60 68 C60 74, 54 80, 40 80 C26 80, 20 74, 20 68 Z"
            fill="var(--desk-fill)"
          />
          {/* Inner cutout to create the U */}
          <path
            d="M26 63 C26 56, 54 56, 54 63 L54 67 C54 71, 49 75, 40 75 C31 75, 26 71, 26 67 Z"
            fill="var(--desk-surface-alt)"
          />
        </svg>

        {/* Content layer: counter-rotate and counter-flip so overlays stay readable */}
        <div
          className="pointer-events-none absolute inset-0 px-1"
          style={{ transform: `rotate(-${desk.rotation}deg) scale(${scaleX}, ${scaleY})` }}
        >
          {displayName && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute -top-6 left-1.5 pr-6 max-w-[120px]"
            >
              <span
                className="text-[11px] font-medium text-stone-900 dark:text-slate-100 truncate max-w-full text-left"
                title={displayName}
              >
                {displayName}
              </span>
            </motion.div>
          )}
          {desk.isLocked && (
            <span
              className="absolute -bottom-1 -right-1 z-20 text-amber-600"
              title="Locked"
            >
              🔒
            </span>
          )}
          {!removeMode && onRemove && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="pointer-events-auto absolute -top-1 -right-1 z-20 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-xs opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
              aria-label="Remove desk"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
