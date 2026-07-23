/**
 * Pure utility functions for reorder logic.
 * These have no React Native dependencies and are fully testable in isolation.
 */

/**
 * Reorder an array by moving an item from one index to another.
 * Returns a new array — does not mutate the input.
 *
 * @param data - The source array.
 * @param from - Index of the item to move.
 * @param to - Destination index.
 * @returns A new array with the item moved.
 */
export function reorderArray<T>(data: readonly T[], from: number, to: number): T[] {
  'worklet';

  if (from === to) {
    return [...data];
  }

  const result = [...data];
  const item = result.splice(from, 1)[0];
  if (item !== undefined) {
    result.splice(to, 0, item);
  }
  return result;
}

/**
 * Clamp a value between a minimum and maximum.
 *
 * @param value - The value to clamp.
 * @param min - Minimum bound.
 * @param max - Maximum bound.
 * @returns The clamped value.
 */
export function clamp(value: number, min: number, max: number): number {
  'worklet';
  return Math.min(Math.max(value, min), max);
}

/**
 * Compute the cumulative offset for a given index.
 * This is the sum of all item sizes before the given index.
 *
 * @param sizes - Array of item sizes.
 * @param index - The index to compute offset for.
 * @returns The cumulative offset.
 */
export function getCumulativeOffset(sizes: readonly number[], index: number): number {
  'worklet';

  let offset = 0;
  for (let i = 0; i < index && i < sizes.length; i++) {
    offset += sizes[i] ?? 0;
  }
  return offset;
}

/**
 * Given the active item's current center position, determine
 * which index it should swap with.
 *
 * Uses midpoint-crossing: a swap occurs when the dragged item's
 * center passes another item's midpoint.
 *
 * @param activeCenter - Current center position of the dragged item.
 * @param currentIndex - Current logical index of the dragged item.
 * @param sizes - Array of item sizes.
 * @param offsets - Array of cumulative offsets for each position.
 * @param positions - Current position mapping.
 * @param dataLength - Total number of items.
 * @returns The new index the item should be at, or currentIndex if no swap.
 */
export function findSwapIndex(
  activeCenter: number,
  currentIndex: number,
  sizes: readonly number[],
  offsets: readonly number[],
  positions: readonly number[],
  dataLength: number,
): number {
  'worklet';

  // Find the current visual position of the active item
  let activeVisualPos = currentIndex;
  for (let i = 0; i < dataLength; i++) {
    if (positions[i] === currentIndex) {
      activeVisualPos = i;
      break;
    }
  }

  // Check upward (or leftward for horizontal)
  if (activeVisualPos > 0) {
    const neighborDataIndex = positions[activeVisualPos - 1];
    if (neighborDataIndex !== undefined) {
      const neighborOffset = offsets[activeVisualPos - 1] ?? 0;
      const neighborSize = sizes[neighborDataIndex] ?? 0;
      const neighborMidpoint = neighborOffset + neighborSize / 2;
      if (activeCenter < neighborMidpoint) {
        return neighborDataIndex;
      }
    }
  }

  // Check downward (or rightward for horizontal)
  if (activeVisualPos < dataLength - 1) {
    const neighborDataIndex = positions[activeVisualPos + 1];
    if (neighborDataIndex !== undefined) {
      const neighborOffset = offsets[activeVisualPos + 1] ?? 0;
      const neighborSize = sizes[neighborDataIndex] ?? 0;
      const neighborMidpoint = neighborOffset + neighborSize / 2;
      if (activeCenter > neighborMidpoint) {
        return neighborDataIndex;
      }
    }
  }

  return currentIndex;
}

/**
 * Swap two elements in an array (mutating).
 * Used for swapping positions in shared values on the UI thread.
 */
export function swapPositions(
  positions: number[],
  fromVisual: number,
  toVisual: number,
): number[] {
  'worklet';

  const result = [...positions];
  const temp = result[fromVisual];
  if (temp !== undefined && result[toVisual] !== undefined) {
    result[fromVisual] = result[toVisual]!;
    result[toVisual] = temp;
  }
  return result;
}

/**
 * Get the visual position of a data index in the positions array.
 */
export function getVisualPosition(
  positions: readonly number[],
  dataIndex: number,
): number {
  'worklet';

  for (let i = 0; i < positions.length; i++) {
    if (positions[i] === dataIndex) {
      return i;
    }
  }
  return dataIndex;
}

/**
 * Build the initial positions array: [0, 1, 2, ..., n-1]
 */
export function buildInitialPositions(length: number): number[] {
  'worklet';

  const positions: number[] = [];
  for (let i = 0; i < length; i++) {
    positions.push(i);
  }
  return positions;
}

/**
 * Linearly interpolate between two values.
 */
export function lerp(a: number, b: number, t: number): number {
  'worklet';
  return a + (b - a) * t;
}
