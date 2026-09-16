import React, { useRef, useEffect, useCallback } from 'react';
import type { PPTTextBox, HandlePosition, TextBoxStyle } from '../types/textbox.types';
import { usePPTTextBoxController } from '../hooks/usePPTTextBoxController';
import { AlignmentGuidesOverlay } from './AlignmentGuidesOverlay';

interface Props {
  box: PPTTextBox;
  otherBoxes: PPTTextBox[];
  canvasWidth: number;
  canvasHeight: number;
  isSelected: boolean;
  isEditing: boolean;
  onSelect: (id: string, e?: React.MouseEvent | React.PointerEvent) => void;
  onStartEditing: (id: string) => void;
  onDoneEditing: (id: string, text: string) => void;
  onUpdateBox: (id: string, updates: Partial<PPTTextBox>) => void;
  onUpdateStyle?: (id: string, styleUpdates: Partial<TextBoxStyle>) => void;
  onDuplicate?: (id: string) => void;
  onDelete?: (id: string) => void;
  onToggleLock?: (id: string) => void;
  onBringForward?: (id: string) => void;
  onSendBackward?: (id: string) => void;
}

const HANDLES: Array<{ pos: HandlePosition; cursor: string; className: string }> = [
  { pos: 'nw', cursor: 'nwse-resize', className: '-top-1.5 -left-1.5' },
  { pos: 'n', cursor: 'ns-resize', className: '-top-1.5 left-1/2 -translate-x-1/2' },
  { pos: 'ne', cursor: 'nesw-resize', className: '-top-1.5 -right-1.5' },
  { pos: 'e', cursor: 'ew-resize', className: 'top-1/2 -translate-y-1/2 -right-1.5' },
  { pos: 'se', cursor: 'nwse-resize', className: '-bottom-1.5 -right-1.5' },
  { pos: 's', cursor: 'ns-resize', className: '-bottom-1.5 left-1/2 -translate-x-1/2' },
  { pos: 'sw', cursor: 'nesw-resize', className: '-bottom-1.5 -left-1.5' },
  { pos: 'w', cursor: 'ew-resize', className: 'top-1/2 -translate-y-1/2 -left-1.5' },
];

export const PPTTextBoxComponent: React.FC<Props> = ({
  box,
  otherBoxes,
  canvasWidth,
  canvasHeight,
  isSelected,
  isEditing,
  onSelect,
  onStartEditing,
  onDoneEditing,
  onUpdateBox,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const {
    containerRef,
    isInteractingState,
    activeGuides,
    handlePointerDownMove,
    handlePointerDownResize,
    handlePointerMove,
    handlePointerUp,
    handleDoubleClick,
  } = usePPTTextBoxController({
    box,
    otherBoxes,
    canvasWidth,
    canvasHeight,
    isEditing,
    onUpdateBox,
    onSelect,
    onStartEditing,
  });

  // Auto-focus textarea when entering edit mode & auto-adjust height for auto-fit
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.focus();
      textarea.setSelectionRange(textarea.value.length, textarea.value.length);

      if (box.style.boxSizingMode === 'auto-fit') {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    }
  }, [isEditing, box.style.boxSizingMode]);

  // Adjust height on text input change if Auto-Fit is enabled
  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newText = e.target.value;
      if (box.style.boxSizingMode === 'auto-fit' && textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        const newHeight = Math.max(30, textareaRef.current.scrollHeight);
        textareaRef.current.style.height = `${newHeight}px`;
        onUpdateBox(box.id, { text: newText, height: newHeight });
      } else {
        onUpdateBox(box.id, { text: newText });
      }
    },
    [box.id, box.style.boxSizingMode, onUpdateBox]
  );

  const handleKeyDownTextarea = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onDoneEditing(box.id, box.text);
      }
    },
    [box.id, box.text, onDoneEditing]
  );

  const style = box.style;

  return (
    <>
      {/* Alignment Snapping Lines */}
      {isInteractingState && (
        <AlignmentGuidesOverlay
          guides={activeGuides}
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
        />
      )}

      {/* Main Text Box Container */}
      <div
        ref={containerRef}
        id={`ppt-textbox-${box.id}`}
        className={`absolute top-0 left-0 select-none touch-none transition-shadow ${
          isEditing ? 'cursor-text' : box.isLocked ? 'cursor-not-allowed' : 'cursor-move'
        }`}
        style={{
          transform: `translate3d(${box.x}px, ${box.y}px, 0px)`,
          width: `${box.width}px`,
          height: style.boxSizingMode === 'auto-fit' ? 'auto' : `${box.height}px`,
          zIndex: box.zIndex,
        }}
        onPointerDown={handlePointerDownMove}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onDoubleClick={handleDoubleClick}
      >
        {/* Shape Body & Rendered Content */}
        <div
          className={`relative h-full w-full rounded-md transition-all ${
            isSelected && !isEditing ? 'ring-1 ring-blue-500/80 shadow-md' : ''
          }`}
          style={{
            backgroundColor: style.backgroundColor,
            borderColor: style.borderColor,
            borderWidth: `${style.borderWidth}px`,
            borderStyle: style.borderStyle,
            borderRadius: `${style.borderRadius}px`,
            padding: `${style.padding}px`,
            opacity: style.opacity,
          }}
        >
          {isEditing ? (
            /* Inline Text Area Editor */
            <textarea
              ref={textareaRef}
              value={box.text}
              onChange={handleTextChange}
              onKeyDown={handleKeyDownTextarea}
              onBlur={() => onDoneEditing(box.id, box.text)}
              placeholder="Click to add text..."
              className="w-full resize-none border-none bg-transparent outline-none ring-0 placeholder:text-slate-400"
              style={{
                fontFamily: style.fontFamily,
                fontSize: `${style.fontSize}px`,
                color: style.textColor,
                fontWeight: style.fontWeight,
                fontStyle: style.fontStyle,
                fontSynthesis: 'style weight',
                textDecoration: style.textDecoration,
                textAlign: style.textAlign,
                lineHeight: style.lineHeight || 1.3,
                height: style.boxSizingMode === 'auto-fit' ? 'auto' : '100%',
                minHeight: '30px',
              }}
              onPointerDown={(e) => e.stopPropagation()}
            />
          ) : (
            /* Normal Static/Formatted Text Display */
            <div
              className="w-full break-words whitespace-pre-wrap overflow-hidden"
              style={{
                fontFamily: style.fontFamily,
                fontSize: `${style.fontSize}px`,
                color: style.textColor,
                fontWeight: style.fontWeight,
                fontStyle: style.fontStyle,
                fontSynthesis: 'style weight',
                textDecoration: style.textDecoration,
                textAlign: style.textAlign,
                lineHeight: style.lineHeight || 1.3,
                height: style.boxSizingMode === 'auto-fit' ? 'auto' : '100%',
                minHeight: '30px',
              }}
            >
              {box.text || (
                <span className="italic text-slate-400/80">Double-click to edit text</span>
              )}
            </div>
          )}

          {/* Bounding Box Outline & 8 Handles */}
          {isSelected && !isEditing && (
            <>
              {/* Outer Bounding Box Border */}
              <div className="pointer-events-none absolute -inset-[2px] rounded border border-blue-500 stroke-dash" />

              {/* 8 Handles with hitboxes */}
              {HANDLES.map(({ pos, cursor, className }) => (
                <div
                  key={pos}
                  className={`absolute z-40 ${className}`}
                  style={{ cursor }}
                  onPointerDown={(e) => handlePointerDownResize(pos, e)}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                >
                  {/* Invisible enlarged hitbox (20x20px) for smooth pointer capture */}
                  <div className="flex h-5 w-5 items-center justify-center -m-1">
                    {/* Visual 10x10px square handle */}
                    <div className="h-2.5 w-2.5 rounded-sm border-[1.5px] border-blue-600 bg-white shadow-sm hover:scale-125 transition-transform" />
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </>
  );
};
