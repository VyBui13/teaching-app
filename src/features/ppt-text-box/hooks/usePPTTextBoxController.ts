import { useRef, useState, useCallback, useEffect } from 'react';
import type { PPTTextBox, HandlePosition, InteractionBounds, SnapGuide } from '../types/textbox.types';
import { calculateSnapping } from '../utils/snappingUtils';

const MIN_WIDTH = 50;
const MIN_HEIGHT = 30;

interface ControllerOptions {
  box: PPTTextBox;
  otherBoxes: PPTTextBox[];
  canvasWidth: number;
  canvasHeight: number;
  isEditing: boolean;
  onUpdateBox: (id: string, updates: Partial<PPTTextBox>) => void;
  onSelect: (id: string, e?: React.MouseEvent | React.PointerEvent) => void;
  onStartEditing: (id: string) => void;
}

export function usePPTTextBoxController({
  box,
  otherBoxes,
  canvasWidth,
  canvasHeight,
  isEditing,
  onUpdateBox,
  onSelect,
  onStartEditing,
}: ControllerOptions) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Active transient interaction state (dragged/resized box)
  const transientBoxRef = useRef<InteractionBounds>({
    x: box.x,
    y: box.y,
    width: box.width,
    height: box.height,
  });

  // Track dragging state
  const isInteractingRef = useRef<boolean>(false);
  const interactionTypeRef = useRef<'move' | HandlePosition | null>(null);
  const pointerStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const initialBoxRef = useRef<InteractionBounds>({
    x: box.x,
    y: box.y,
    width: box.width,
    height: box.height,
  });

  // Active Snapping Guides to render
  const [activeGuides, setActiveGuides] = useState<SnapGuide[]>([]);
  const [isInteractingState, setIsInteractingState] = useState<boolean>(false);

  // Sync props to transient ref when not interacting
  useEffect(() => {
    if (!isInteractingRef.current) {
      transientBoxRef.current = {
        x: box.x,
        y: box.y,
        width: box.width,
        height: box.height,
      };
      if (containerRef.current) {
        containerRef.current.style.transform = `translate3d(${box.x}px, ${box.y}px, 0px)`;
        containerRef.current.style.width = `${box.width}px`;
        containerRef.current.style.height = box.style.boxSizingMode === 'auto-fit' ? 'auto' : `${box.height}px`;
      }
    }
  }, [box.x, box.y, box.width, box.height, box.style.boxSizingMode]);

  // RequestAnimationFrame handle
  const rafIdRef = useRef<number | null>(null);

  // Update DOM directly for zero-lag 60 FPS motion
  const updateDOMStyle = useCallback((bounds: InteractionBounds) => {
    const el = containerRef.current;
    if (!el) return;
    el.style.transform = `translate3d(${Math.round(bounds.x)}px, ${Math.round(bounds.y)}px, 0px)`;
    el.style.width = `${Math.round(bounds.width)}px`;
    if (box.style.boxSizingMode === 'fixed-bounds') {
      el.style.height = `${Math.round(bounds.height)}px`;
    }
    el.style.willChange = 'transform, width, height';
  }, [box.style.boxSizingMode]);

  // Start Move Drag
  const handlePointerDownMove = useCallback(
    (e: React.PointerEvent) => {
      if (isEditing || box.isLocked) return;
      e.stopPropagation();
      onSelect(box.id, e);

      // Lock pointer capture
      const target = e.currentTarget as HTMLElement;
      try {
        target.setPointerCapture(e.pointerId);
      } catch {}

      isInteractingRef.current = true;
      setIsInteractingState(true);
      interactionTypeRef.current = 'move';
      pointerStartRef.current = { x: e.clientX, y: e.clientY };
      initialBoxRef.current = {
        x: box.x,
        y: box.y,
        width: box.width,
        height: box.height,
      };
      transientBoxRef.current = { ...initialBoxRef.current };
    },
    [box.x, box.y, box.width, box.height, box.id, box.isLocked, isEditing, onSelect]
  );

  // Start Resize Drag on 1 of 8 Handles
  const handlePointerDownResize = useCallback(
    (handle: HandlePosition, e: React.PointerEvent) => {
      if (isEditing || box.isLocked) return;
      e.stopPropagation();
      onSelect(box.id, e);

      const target = e.currentTarget as HTMLElement;
      try {
        target.setPointerCapture(e.pointerId);
      } catch {}

      isInteractingRef.current = true;
      setIsInteractingState(true);
      interactionTypeRef.current = handle;
      pointerStartRef.current = { x: e.clientX, y: e.clientY };
      initialBoxRef.current = {
        x: box.x,
        y: box.y,
        width: box.width,
        height: box.height,
      };
      transientBoxRef.current = { ...initialBoxRef.current };
    },
    [box.x, box.y, box.width, box.height, box.id, box.isLocked, isEditing, onSelect]
  );

  // Handle Pointer Move (rAF Throttled)
  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isInteractingRef.current || !interactionTypeRef.current) return;

      const deltaX = e.clientX - pointerStartRef.current.x;
      const deltaY = e.clientY - pointerStartRef.current.y;
      const init = initialBoxRef.current;
      const handle = interactionTypeRef.current;
      const isShiftKey = e.shiftKey;

      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }

      rafIdRef.current = requestAnimationFrame(() => {
        rafIdRef.current = null;
        let newX = init.x;
        let newY = init.y;
        let newWidth = init.width;
        let newHeight = init.height;

        if (handle === 'move') {
          // Calculate snapping alignment for moving
          const rawBox: InteractionBounds = {
            x: init.x + deltaX,
            y: init.y + deltaY,
            width: init.width,
            height: init.height,
          };
          const snapResult = calculateSnapping(
            rawBox,
            otherBoxes,
            canvasWidth,
            canvasHeight,
            true
          );
          newX = snapResult.x;
          newY = snapResult.y;
          setActiveGuides(snapResult.guides);
        } else {
          // Handle 8-Direction Resizing
          setActiveGuides([]);
          const aspectRatio = init.width / init.height;

          // Horizontal adjustment
          if (handle.includes('e')) {
            newWidth = Math.max(MIN_WIDTH, init.width + deltaX);
          } else if (handle.includes('w')) {
            const possibleWidth = Math.max(MIN_WIDTH, init.width - deltaX);
            newX = init.x + (init.width - possibleWidth);
            newWidth = possibleWidth;
          }

          // Vertical adjustment
          if (handle.includes('s')) {
            newHeight = Math.max(MIN_HEIGHT, init.height + deltaY);
          } else if (handle.includes('n')) {
            const possibleHeight = Math.max(MIN_HEIGHT, init.height - deltaY);
            newY = init.y + (init.height - possibleHeight);
            newHeight = possibleHeight;
          }

          // Preserve aspect ratio if Shift key is pressed on corner handles
          if (isShiftKey && ['nw', 'ne', 'se', 'sw'].includes(handle)) {
            if (handle === 'se') {
              newHeight = newWidth / aspectRatio;
            } else if (handle === 'sw') {
              newHeight = newWidth / aspectRatio;
            } else if (handle === 'ne') {
              newHeight = newWidth / aspectRatio;
              newY = init.y + (init.height - newHeight);
            } else if (handle === 'nw') {
              newHeight = newWidth / aspectRatio;
              newX = init.x + (init.width - newWidth);
              newY = init.y + (init.height - newHeight);
            }
          }
        }

        transientBoxRef.current = {
          x: newX,
          y: newY,
          width: newWidth,
          height: newHeight,
        };

        updateDOMStyle(transientBoxRef.current);
      });
    },
    [canvasHeight, canvasWidth, otherBoxes, updateDOMStyle]
  );

  // Handle Pointer Up (Commit final coordinates & dimensions to React State)
  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!isInteractingRef.current) return;

      const target = e.currentTarget as HTMLElement;
      try {
        target.releasePointerCapture(e.pointerId);
      } catch {}

      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }

      isInteractingRef.current = false;
      setIsInteractingState(false);
      interactionTypeRef.current = null;
      setActiveGuides([]);

      if (containerRef.current) {
        containerRef.current.style.willChange = 'auto';
      }

      const finalBox = transientBoxRef.current;
      // Only trigger state commit if coordinates actually changed
      if (
        finalBox.x !== box.x ||
        finalBox.y !== box.y ||
        finalBox.width !== box.width ||
        finalBox.height !== box.height
      ) {
        onUpdateBox(box.id, {
          x: Math.round(finalBox.x),
          y: Math.round(finalBox.y),
          width: Math.round(finalBox.width),
          height: Math.round(finalBox.height),
        });
      }
    },
    [box.x, box.y, box.width, box.height, box.id, onUpdateBox]
  );

  // Double Click handler to activate inline text editing
  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if (box.isLocked) return;
      e.stopPropagation();
      onStartEditing(box.id);
    },
    [box.id, box.isLocked, onStartEditing]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  return {
    containerRef,
    isInteractingState,
    activeGuides,
    handlePointerDownMove,
    handlePointerDownResize,
    handlePointerMove,
    handlePointerUp,
    handleDoubleClick,
  };
}
