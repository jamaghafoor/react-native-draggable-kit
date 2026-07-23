import { useCallback } from 'react';
import { useSharedValue } from 'react-native-reanimated';
import type { GetItemLayout } from '../types';
import { getCumulativeOffset } from '../utils/reorder';

/**
 * Hook to manage item measurements.
 *
 * Handles both pre-provided layouts (via getItemLayout) and
 * dynamic measurement (via onLayout). Stores sizes and cumulative
 * offsets in SharedValues for UI-thread access.
 */
export function useItemMeasurements<T>(
  data: readonly T[],
  getItemLayout?: GetItemLayout<T>,
) {
  const itemSizes = useSharedValue<number[]>([]);
  const itemOffsets = useSharedValue<number[]>([]);
  const measuredCount = useSharedValue(0);
  const allMeasured = useSharedValue(false);

  /**
   * Initialize sizes from getItemLayout if provided.
   * Called once on mount and when data changes.
   */
  const initializeFromLayout = useCallback(() => {
    if (getItemLayout && data.length > 0) {
      const sizes: number[] = [];
      const offsets: number[] = [];

      for (let i = 0; i < data.length; i++) {
        const layout = getItemLayout(data as T[], i);
        sizes.push(layout.size);
        offsets.push(layout.offset);
      }

      itemSizes.value = sizes;
      itemOffsets.value = offsets;
      measuredCount.value = data.length;
      allMeasured.value = true;
    } else {
      // Initialize with zeros — will be filled by onLayout
      itemSizes.value = new Array(data.length).fill(0) as number[];
      itemOffsets.value = new Array(data.length).fill(0) as number[];
      measuredCount.value = 0;
      allMeasured.value = false;
    }
  }, [data, getItemLayout, itemSizes, itemOffsets, measuredCount, allMeasured]);

  /**
   * Record the measured size for a specific item index.
   * Called from SortableItem's onLayout.
   */
  const onItemLayout = useCallback(
    (index: number, size: number) => {
      if (getItemLayout) {
        // Already initialized from getItemLayout, skip dynamic measurement
        return;
      }

      const currentSizes = [...itemSizes.value];

      // Guard against index out of bounds (can happen during rapid data changes)
      if (index >= currentSizes.length) {
        return;
      }

      const previousSize = currentSizes[index];
      if (previousSize === size) {
        // Size hasn't changed, skip recalculation
        return;
      }

      currentSizes[index] = size;
      itemSizes.value = currentSizes;

      // Recompute all offsets from scratch (prefix sum)
      const newOffsets: number[] = [];
      for (let i = 0; i < currentSizes.length; i++) {
        newOffsets.push(getCumulativeOffset(currentSizes, i));
      }
      itemOffsets.value = newOffsets;

      if (previousSize === 0) {
        measuredCount.value = measuredCount.value + 1;
        if (measuredCount.value >= currentSizes.length) {
          allMeasured.value = true;
        }
      }
    },
    [getItemLayout, itemSizes, itemOffsets, measuredCount, allMeasured],
  );

  return {
    itemSizes,
    itemOffsets,
    measuredCount,
    allMeasured,
    onItemLayout,
    initializeFromLayout,
  };
}
