import type { PPTTextBox, SnapGuide, InteractionBounds } from '../types/textbox.types';

export interface SnapResult {
  x: number;
  y: number;
  guides: SnapGuide[];
}

const SNAP_THRESHOLD = 6; // Snap distance in pixels

export function calculateSnapping(
  currentBox: InteractionBounds,
  otherBoxes: PPTTextBox[],
  canvasWidth: number,
  canvasHeight: number,
  enabled: boolean = true
): SnapResult {
  if (!enabled) {
    return { x: currentBox.x, y: currentBox.y, guides: [] };
  }

  let snappedX = currentBox.x;
  let snappedY = currentBox.y;
  const guides: SnapGuide[] = [];

  const currLeft = currentBox.x;
  const currCenterX = currentBox.x + currentBox.width / 2;
  const currRight = currentBox.x + currentBox.width;

  const currTop = currentBox.y;
  const currCenterY = currentBox.y + currentBox.height / 2;
  const currBottom = currentBox.y + currentBox.height;

  // Build target vertical snap lines (X positions)
  const verticalTargets: Array<{ pos: number; type: 'left' | 'center' | 'right'; sourceY: [number, number] }> = [
    { pos: 0, type: 'left', sourceY: [0, canvasHeight] },
    { pos: canvasWidth / 2, type: 'center', sourceY: [0, canvasHeight] },
    { pos: canvasWidth, type: 'right', sourceY: [0, canvasHeight] },
  ];

  // Build target horizontal snap lines (Y positions)
  const horizontalTargets: Array<{ pos: number; type: 'top' | 'center' | 'bottom'; sourceX: [number, number] }> = [
    { pos: 0, type: 'top', sourceX: [0, canvasWidth] },
    { pos: canvasHeight / 2, type: 'center', sourceX: [0, canvasWidth] },
    { pos: canvasHeight, type: 'bottom', sourceX: [0, canvasWidth] },
  ];

  // Collect snap lines from other text boxes
  otherBoxes.forEach((box) => {
    const bLeft = box.x;
    const bCenterX = box.x + box.width / 2;
    const bRight = box.x + box.width;

    const bTop = box.y;
    const bCenterY = box.y + box.height / 2;
    const bBottom = box.y + box.height;

    const minY = Math.min(currTop, bTop) - 20;
    const maxY = Math.max(currBottom, bBottom) + 20;

    verticalTargets.push(
      { pos: bLeft, type: 'left', sourceY: [minY, maxY] },
      { pos: bCenterX, type: 'center', sourceY: [minY, maxY] },
      { pos: bRight, type: 'right', sourceY: [minY, maxY] }
    );

    const minX = Math.min(currLeft, bLeft) - 20;
    const maxX = Math.max(currRight, bRight) + 20;

    horizontalTargets.push(
      { pos: bTop, type: 'top', sourceX: [minX, maxX] },
      { pos: bCenterY, type: 'center', sourceX: [minX, maxX] },
      { pos: bBottom, type: 'bottom', sourceX: [minX, maxX] }
    );
  });

  // Evaluate vertical snapping (X axis)
  let bestDiffX = SNAP_THRESHOLD;
  let activeVertGuide: SnapGuide | null = null;

  verticalTargets.forEach((target) => {
    // 1. Current left against target
    let diff = Math.abs(currLeft - target.pos);
    if (diff < bestDiffX) {
      bestDiffX = diff;
      snappedX = target.pos;
      activeVertGuide = {
        type: 'vertical',
        position: target.pos,
        start: target.sourceY[0],
        end: target.sourceY[1],
      };
    }

    // 2. Current center against target
    diff = Math.abs(currCenterX - target.pos);
    if (diff < bestDiffX) {
      bestDiffX = diff;
      snappedX = target.pos - currentBox.width / 2;
      activeVertGuide = {
        type: 'vertical',
        position: target.pos,
        start: target.sourceY[0],
        end: target.sourceY[1],
      };
    }

    // 3. Current right against target
    diff = Math.abs(currRight - target.pos);
    if (diff < bestDiffX) {
      bestDiffX = diff;
      snappedX = target.pos - currentBox.width;
      activeVertGuide = {
        type: 'vertical',
        position: target.pos,
        start: target.sourceY[0],
        end: target.sourceY[1],
      };
    }
  });

  // Evaluate horizontal snapping (Y axis)
  let bestDiffY = SNAP_THRESHOLD;
  let activeHorizGuide: SnapGuide | null = null;

  horizontalTargets.forEach((target) => {
    // 1. Current top against target
    let diff = Math.abs(currTop - target.pos);
    if (diff < bestDiffY) {
      bestDiffY = diff;
      snappedY = target.pos;
      activeHorizGuide = {
        type: 'horizontal',
        position: target.pos,
        start: target.sourceX[0],
        end: target.sourceX[1],
      };
    }

    // 2. Current center against target
    diff = Math.abs(currCenterY - target.pos);
    if (diff < bestDiffY) {
      bestDiffY = diff;
      snappedY = target.pos - currentBox.height / 2;
      activeHorizGuide = {
        type: 'horizontal',
        position: target.pos,
        start: target.sourceX[0],
        end: target.sourceX[1],
      };
    }

    // 3. Current bottom against target
    diff = Math.abs(currBottom - target.pos);
    if (diff < bestDiffY) {
      bestDiffY = diff;
      snappedY = target.pos - currentBox.height;
      activeHorizGuide = {
        type: 'horizontal',
        position: target.pos,
        start: target.sourceX[0],
        end: target.sourceX[1],
      };
    }
  });

  if (activeVertGuide) guides.push(activeVertGuide);
  if (activeHorizGuide) guides.push(activeHorizGuide);

  return { x: snappedX, y: snappedY, guides };
}
