"use client";

import { useDraggable } from "@dnd-kit/core";
import type { Desk } from "@/types";
import type { ReactNode } from "react";

const DESK_WIDTH = 80;
const DESK_HEIGHT = 60;
const CHAIR_SIZE = 24;

interface ArrangementFrameProps {
  id: string;
  desks: Desk[];
  children?: ReactNode;
  onRemove?: () => void;
}

export function ArrangementFrame({ id, desks, children, onRemove }: ArrangementFrameProps) {
  const minX = desks.length ? Math.min(...desks.map((d) => d.x)) : 0;
  const minY = desks.length ? Math.min(...desks.map((d) => d.y)) : 0;
  const maxX = desks.length ? Math.max(...desks.map((d) => d.x + DESK_WIDTH)) : 0;
  const maxY = desks.length ? Math.max(...desks.map((d) => d.y + DESK_HEIGHT + CHAIR_SIZE)) : 0;

  const padding = 16;
  const width = maxX - minX + padding * 2;
  const height = maxY - minY + padding * 2;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
  } = useDraggable({
    id,
    data: { type: "arrangement", arrangementId: id },
  });

  const dragTranslate =
    transform?.x != null && transform?.y != null
      ? ` translate(${transform.x}px, ${transform.y}px)`
      : "";

  if (!desks.length) return null;

  return (
    <div
      ref={setNodeRef}
      style={{
        position: "absolute",
        left: minX - padding,
        top: minY - padding,
        width,
        height,
        transform: dragTranslate,
      }}
      className="group pointer-events-none"
    >
      <div
        className="h-full w-full rounded-xl border-2 border-dashed border-sky-400/70 bg-sky-400/5"
      />
      {/* Drag handle in the top-left corner to move the whole arrangement */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        data-no-pan="true"
        className="pointer-events-auto absolute -top-3 left-2 flex h-5 items-center rounded-full bg-sky-500 px-2 text-[10px] font-medium text-white shadow-sm"
        aria-label="Drag desk arrangement"
      >
        ⇕ Move group
      </button>
      {/* Remove button in the top-right corner */}
      {onRemove && (
        <button
          type="button"
          data-no-pan="true"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="pointer-events-auto absolute -top-3 -right-3 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-xs shadow-sm opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
          aria-label="Remove arrangement"
        >
          ✕
        </button>
      )}
      {/*
        Offset container: shifts coordinate origin back to canvas (0,0) so that
        desk children with position:absolute / left:desk.x / top:desk.y render
        at the correct canvas positions, while still inheriting this div's
        CSS transform when the arrangement is dragged.
      */}
      {children && (
        <div
          style={{
            position: "absolute",
            left: -(minX - padding),
            top: -(minY - padding),
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
