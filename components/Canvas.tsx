"use client";

import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { useDeskStore } from "@/hooks/useDeskStore";
import { ArrangementFrame } from "./ArrangementFrame";
import { Desk } from "./Desk";
import { ContextMenu } from "./ContextMenu";
import { useState, useCallback, useRef, useEffect } from "react";

const CANVAS_WIDTH = 1600;
const CANVAS_HEIGHT = 1200;
const MIN_ZOOM = 0.25;
const MAX_ZOOM = 2;

export function Canvas() {
  const {
    desks,
    moveDesk,
    addDesk,
    removeDesk,
    rotateDeskLeft,
    rotateDeskRight,
    flipDeskHorizontal,
    flipDeskVertical,
    setDeskLocked,
    setIsDragging,
    removeMode,
    namesList,
    removeArrangement,
  } = useDeskStore();

  const viewportRef = useRef<HTMLDivElement>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    deskId: string;
  } | null>(null);

  const [zoom, setZoom] = useState(0.5);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ clientX: 0, clientY: 0, panX: 0, panY: 0 });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  useEffect(() => {
    if (!isPanning) return;
    const onMove = (e: MouseEvent) => {
      setPan({
        x: panStartRef.current.panX + (e.clientX - panStartRef.current.clientX),
        y: panStartRef.current.panY + (e.clientY - panStartRef.current.clientY),
      });
    };
    const onUp = () => setIsPanning(false);
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
  }, [isPanning]);

  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLDivElement>) => {
      e.preventDefault();
      const el = viewportRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const viewportX = e.clientX - rect.left;
      const viewportY = e.clientY - rect.top;
      const canvasX = (viewportX - pan.x) / zoom;
      const canvasY = (viewportY - pan.y) / zoom;
      const factor = e.deltaY > 0 ? 0.9 : 1.1;
      const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom * factor));
      setZoom(newZoom);
      setPan({
        x: viewportX - canvasX * newZoom,
        y: viewportY - canvasY * newZoom,
      });
    },
    [zoom, pan.x, pan.y]
  );

  const handlePanStart = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.button !== 0) return;
      const target = e.target as HTMLElement;
      if (target.closest("[data-desk-id]")) return;
      if (target.closest("[data-no-pan]")) return;
      setIsPanning(true);
      panStartRef.current = {
        clientX: e.clientX,
        clientY: e.clientY,
        panX: pan.x,
        panY: pan.y,
      };
    },
    [pan.x, pan.y]
  );

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, [setIsDragging]);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setIsDragging(false);
      const { active, delta } = event;
      const id = String(active.id);

      // Arrangement frame dragged
      if (id.startsWith("arrangement-")) {
        const arrangementId = id.replace("arrangement-", "");
        if (delta.x !== 0 || delta.y !== 0) {
          useDeskStore.getState().moveArrangement(arrangementId, delta.x, delta.y);
        }
        return;
      }

      // Individual desk dragged
      const desk = desks.find((d) => d.id === id);
      if (desk && (delta.x !== 0 || delta.y !== 0)) {
        const newX = Math.max(0, Math.min(CANVAS_WIDTH - 80, desk.x + delta.x));
        const newY = Math.max(0, Math.min(CANVAS_HEIGHT - 100, desk.y + delta.y));
        moveDesk(desk.id, newX, newY);
      }
    },
    [desks, moveDesk, setIsDragging]
  );

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (contextMenu) setContextMenu(null);
      const target = e.target as HTMLElement;
      if (removeMode && target.closest("[data-desk-id]")) {
        const id = target.closest("[data-desk-id]")?.getAttribute("data-desk-id");
        if (id) removeDesk(id);
      }
    },
    [contextMenu, removeMode, removeDesk]
  );

  const handleAddDeskClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (removeMode) return;
      const el = viewportRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const viewportX = e.clientX - rect.left;
      const viewportY = e.clientY - rect.top;
      const canvasX = (viewportX - pan.x) / zoom - 40;
      const canvasY = (viewportY - pan.y) / zoom - 42;
      addDesk(
        Math.max(0, Math.min(CANVAS_WIDTH - 80, canvasX)),
        Math.max(0, Math.min(CANVAS_HEIGHT - 100, canvasY))
      );
    },
    [removeMode, addDesk, pan.x, pan.y, zoom]
  );

  const zoomIn = useCallback(() => {
    setZoom((z) => Math.min(MAX_ZOOM, z * 1.2));
  }, []);

  const zoomOut = useCallback(() => {
    setZoom((z) => Math.max(MIN_ZOOM, z / 1.2));
  }, []);

  const resetView = useCallback(() => {
    setZoom(0.5);
    setPan({ x: 0, y: 0 });
  }, []);

  // Modifier so drag transform is in canvas space: 1:1 cursor movement at any zoom
  const zoomModifier = useCallback(
    (args: { transform: { x: number; y: number; scaleX?: number; scaleY?: number } }) => {
      const { transform } = args;
      return {
        ...transform,
        x: transform.x / zoom,
        y: transform.y / zoom,
      };
    },
    [zoom]
  );

  // Build a map of arrangementId -> desks for grouped rendering
  const arrangementMap = desks.reduce((map, desk) => {
    if (!desk.arrangementId) return map;
    const id = desk.arrangementId;
    if (!map.has(id)) map.set(id, []);
    map.get(id)!.push(desk);
    return map;
  }, new Map<string, typeof desks>());

  const renderDeskNode = useCallback(
    (desk: (typeof desks)[number]) => (
      <div
        key={desk.id}
        data-desk-id={desk.id}
        style={{ pointerEvents: "auto" }}
      >
        <Desk
          desk={desk}
          onRemove={() => removeDesk(desk.id)}
          onContextMenu={(e) => {
            e.preventDefault();
            setContextMenu({ x: e.clientX, y: e.clientY, deskId: desk.id });
          }}
          removeMode={removeMode}
        />
      </div>
    ),
    [removeDesk, removeMode]
  );

  return (
    <div className="relative h-full w-full rounded-xl overflow-hidden border border-stone-200 shadow-inner bg-stone-200 dark:border-slate-700 dark:bg-slate-900">
      <div
        ref={viewportRef}
        className="relative h-full w-full overflow-hidden select-none touch-none"
        style={{
          cursor: isPanning ? "grabbing" : "grab",
        }}
        onWheel={handleWheel}
        onMouseDown={handlePanStart}
      >
        <div
          className="absolute top-0 left-0 origin-top-left"
          style={{
            width: CANVAS_WIDTH,
            height: CANVAS_HEIGHT,
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          }}
        >
          <DndContext
            sensors={sensors}
            modifiers={[zoomModifier]}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div
              className="relative w-full h-full"
              onClick={handleCanvasClick}
              onDoubleClick={handleAddDeskClick}
            >
              {/* Subtle grid */}
              <div
                className="absolute inset-0 opacity-[0.12] pointer-events-none dark:opacity-[0.15]"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, var(--grid-color) 1px, transparent 1px),
                    linear-gradient(to bottom, var(--grid-color) 1px, transparent 1px)
                  `,
                  backgroundSize: "20px 20px",
                }}
              />

              {/* Arrangement frames — desks rendered as children so they share the drag transform */}
              {Array.from(arrangementMap).map(([id, groupDesks]) => (
                <ArrangementFrame
                  key={id}
                  id={`arrangement-${id}`}
                  desks={groupDesks}
                  onRemove={() => removeArrangement(id)}
                >
                  {groupDesks.map(renderDeskNode)}
                </ArrangementFrame>
              ))}

              {/* Standalone desks (not part of any arrangement) */}
              {desks.filter((d) => !d.arrangementId).map(renderDeskNode)}
            </div>
          </DndContext>
        </div>
      </div>

      {/* Zoom controls */}
      <div className="absolute bottom-2 right-2 flex flex-col gap-1 bg-white/90 dark:bg-slate-800/90 rounded-lg shadow border border-stone-200 dark:border-slate-600 p-1">
        <button
          type="button"
          onClick={zoomIn}
          className="p-1.5 text-stone-700 dark:text-slate-200 hover:bg-stone-100 dark:hover:bg-slate-700 rounded"
          aria-label="Zoom in"
        >
          +
        </button>
        <button
          type="button"
          onClick={zoomOut}
          className="p-1.5 text-stone-700 dark:text-slate-200 hover:bg-stone-100 dark:hover:bg-slate-700 rounded"
          aria-label="Zoom out"
        >
          −
        </button>
        <button
          type="button"
          onClick={resetView}
          className="p-1 text-xs text-stone-600 dark:text-slate-300 hover:bg-stone-100 dark:hover:bg-slate-700 rounded"
          aria-label="Reset view"
        >
          Fit
        </button>
      </div>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          deskId={contextMenu.deskId}
          onClose={() => setContextMenu(null)}
          onRotateLeft={() => {
            rotateDeskLeft(contextMenu.deskId);
            setContextMenu(null);
          }}
          onRotateRight={() => {
            rotateDeskRight(contextMenu.deskId);
            setContextMenu(null);
          }}
          onFlipHorizontal={() => {
            flipDeskHorizontal(contextMenu.deskId);
            setContextMenu(null);
          }}
          onFlipVertical={() => {
            flipDeskVertical(contextMenu.deskId);
            setContextMenu(null);
          }}
          onDelete={() => {
            removeDesk(contextMenu.deskId);
            setContextMenu(null);
          }}
          onLockWithName={(name) => {
            setDeskLocked(contextMenu.deskId, true, name);
            setContextMenu(null);
          }}
          onUnlock={() => {
            setDeskLocked(contextMenu.deskId, false, null);
            setContextMenu(null);
          }}
          desk={desks.find((d) => d.id === contextMenu.deskId)!}
          allNames={namesList}
        />
      )}
    </div>
  );
}
