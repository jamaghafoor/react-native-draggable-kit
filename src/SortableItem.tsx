import React, { memo, useCallback, useMemo } from 'react';
import { LayoutChangeEvent, Platform, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useDraggableContext } from './context';
import {
  DISPLACEMENT_SPRING_CONFIG,
  DRAG_START_TIMING_CONFIG,
  DRAGGED_ITEM_Z_INDEX,
  DROP_SPRING_CONFIG,
} from './constants';
import {
  buildInitialPositions,
  findSwapIndex,
  getCumulativeOffset,
  getVisualPosition,
  swapPositions,
} from './utils/reorder';
import {
  getAccessibilityActions,
  getPositionAccessibilityHint,
  handleAccessibilityAction,
} from './utils/accessibility';
import type { DraggableRenderItemInfo, DragEndEvent } from './types';

interface SortableItemProps<T> {
  item: T;
  index: number;
  dataLength: number;
  data: readonly T[];
  renderItem: (info: DraggableRenderItemInfo<T>) => React.ReactNode;
  onItemLayout: (index: number, size: number) => void;
  onDragStartJS: (index: number) => void;
  onDragMoveJS: (from: number, to: number, translation: number) => void;
  onDragEndJS: (from: number, to: number) => void;
  onReorder: (event: DragEndEvent<T>) => void;
  itemContainerStyle?: Record<string, unknown>;
}

/**
 * Individual sortable item wrapper.
 *
 * Each item owns its gesture detector and animated style.
 * Gesture logic runs entirely on the UI thread via worklets.
 * The JS thread is only touched for final callbacks via runOnJS.
 */
function SortableItemInner<T>({
  item,
  index,
  dataLength,
  data,
  renderItem,
  onItemLayout,
  onDragStartJS,
  onDragMoveJS,
  onDragEndJS,
  onReorder,
  itemContainerStyle,
}: SortableItemProps<T>) {
  const ctx = useDraggableContext();
  const isDragging = useSharedValue(false);
  const isAnyDragging = useSharedValue(false);

  // ── Layout measurement ────────────────────────────────────────

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { height, width } = event.nativeEvent.layout;
      const size = ctx.direction === 'horizontal' ? width : height;
      onItemLayout(index, size);
    },
    [index, onItemLayout, ctx.direction],
  );

  // ── Gesture ───────────────────────────────────────────────────

  const panGesture = useMemo(() => {
    const gesture = Gesture.Pan()
      .enabled(ctx.enabled)
      .onStart(() => {
        'worklet';
        // Check handle mode — if handles are active but this isn't the handle, bail
        if (ctx.useHandleMode.value && ctx.activeHandleId.value !== index) {
          return;
        }

        ctx.activeIndex.value = index;
        isDragging.value = true;
        isAnyDragging.value = true;

        // Set the start offset based on the item's current visual position
        const visualPos = getVisualPosition(ctx.positions.value, index);
        ctx.dragStartOffset.value = getCumulativeOffset(
          ctx.itemSizes.value,
          visualPos,
        );
        ctx.dragTranslation.value = 0;

        // Notify JS thread
        runOnJS(onDragStartJS)(index);
      })
      .onUpdate((event) => {
        'worklet';
        if (ctx.activeIndex.value !== index) {
          return;
        }

        const translation =
          ctx.direction === 'horizontal' ? event.translationX : event.translationY;
        ctx.dragTranslation.value = translation;

        // Compute the active item's current center
        const activeSize = ctx.itemSizes.value[index] ?? 0;
        const activeCenter =
          ctx.dragStartOffset.value + translation + activeSize / 2;

        // Find if we need to swap
        const currentVisualPos = getVisualPosition(ctx.positions.value, index);
        const swapTarget = findSwapIndex(
          activeCenter,
          index,
          ctx.itemSizes.value,
          ctx.itemOffsets.value,
          ctx.positions.value,
          ctx.dataLength,
        );

        if (swapTarget !== index) {
          // Perform the swap in positions
          const swapVisualPos = getVisualPosition(
            ctx.positions.value,
            swapTarget,
          );
          ctx.positions.value = swapPositions(
            ctx.positions.value,
            currentVisualPos,
            swapVisualPos,
          );

          // Animate the displaced item to its new position
          const swapSize = ctx.itemSizes.value[swapTarget] ?? 0;
          const direction = swapVisualPos > currentVisualPos ? -1 : 1;
          const currentOffsets = [...ctx.offsets.value];
          currentOffsets[swapTarget] =
            (currentOffsets[swapTarget] ?? 0) + direction * swapSize;
          ctx.offsets.value = currentOffsets;

          // Recalculate item offsets based on new positions
          const newItemOffsets: number[] = [];
          for (let i = 0; i < ctx.dataLength; i++) {
            const dataIdx = ctx.positions.value[i] ?? 0;
            newItemOffsets[i] = getCumulativeOffset(
              ctx.positions.value.map((di) => ctx.itemSizes.value[di] ?? 0),
              i,
            );
            // Keep existing offsets only if needed
            void dataIdx;
          }
          ctx.itemOffsets.value = newItemOffsets;

          // Notify JS thread of position change
          const toVisual = getVisualPosition(ctx.positions.value, index);
          runOnJS(onDragMoveJS)(index, toVisual, translation);
        }
      })
      .onEnd(() => {
        'worklet';
        if (ctx.activeIndex.value !== index) {
          return;
        }

        // Animate the dragged item to its final position
        const finalVisualPos = getVisualPosition(ctx.positions.value, index);
        const finalOffset = getCumulativeOffset(
          ctx.positions.value.map((di) => ctx.itemSizes.value[di] ?? 0),
          finalVisualPos,
        );
        const originalOffset = getCumulativeOffset(ctx.itemSizes.value, index);
        const targetTranslation = finalOffset - originalOffset;

        ctx.dragTranslation.value = withSpring(
          targetTranslation,
          DROP_SPRING_CONFIG,
          (finished) => {
            'worklet';
            if (finished) {
              // Reset all state
              const toVisualPos = getVisualPosition(ctx.positions.value, index);
              ctx.activeIndex.value = -1;
              ctx.dragTranslation.value = 0;
              ctx.dragStartOffset.value = 0;
              isDragging.value = false;
              isAnyDragging.value = false;

              // Reset offsets
              ctx.offsets.value = new Array(ctx.dataLength).fill(0) as number[];

              // Notify JS thread
              runOnJS(onDragEndJS)(index, toVisualPos);

              // Reset positions to identity (data will be reordered by the consumer)
              ctx.positions.value = buildInitialPositions(ctx.dataLength);
            }
          },
        );
      })
      .onFinalize(() => {
        'worklet';
        // Handle cancellation (e.g., system gesture interruption)
        if (isDragging.value && ctx.activeIndex.value === index) {
          // Snap back to original position
          ctx.dragTranslation.value = withSpring(0, DROP_SPRING_CONFIG, () => {
            'worklet';
            ctx.activeIndex.value = -1;
            isDragging.value = false;
            isAnyDragging.value = false;
            ctx.offsets.value = new Array(ctx.dataLength).fill(0) as number[];
            ctx.positions.value = buildInitialPositions(ctx.dataLength);
          });
        }
      })
      .minDistance(0)
      .simultaneousWithExternalGesture();

    // Configure activation mode
    if (ctx.dragActivationMode === 'long-press') {
      gesture.activateAfterLongPress(ctx.dragActivationDelay);
    }

    return gesture;
  }, [
    ctx,
    index,
    isDragging,
    isAnyDragging,
    onDragStartJS,
    onDragMoveJS,
    onDragEndJS,
  ]);

  // ── Animated Style ────────────────────────────────────────────

  const animatedStyle = useAnimatedStyle(() => {
    const isActive = ctx.activeIndex.value === index;
    const offset = ctx.offsets.value[index] ?? 0;

    // Displacement: non-active items shift when the active item moves past them
    const displacementValue = isActive ? 0 : offset;

    // Translation: the active item follows the gesture
    const translateValue = isActive
      ? ctx.dragTranslation.value
      : withSpring(displacementValue, DISPLACEMENT_SPRING_CONFIG);

    const scale = isActive
      ? withTiming(ctx.dragStyle.scale, DRAG_START_TIMING_CONFIG)
      : withTiming(1, DRAG_START_TIMING_CONFIG);

    const opacity = isActive
      ? withTiming(ctx.dragStyle.opacity, DRAG_START_TIMING_CONFIG)
      : withTiming(1, DRAG_START_TIMING_CONFIG);

    const zIndex = isActive ? DRAGGED_ITEM_Z_INDEX : 0;

    const elevation = isActive ? ctx.dragStyle.elevation : 0;

    const transform =
      ctx.direction === 'horizontal'
        ? [{ translateX: translateValue }, { scale }]
        : [{ translateY: translateValue }, { scale }];

    return {
      opacity,
      zIndex,
      transform,
      ...(Platform.OS === 'android' ? { elevation } : {}),
      ...(Platform.OS === 'ios' && isActive
        ? {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
          }
        : {}),
    };
  }, [index, ctx]);

  // ── Accessibility ─────────────────────────────────────────────

  const accessibilityActions = useMemo(
    () => getAccessibilityActions(index, dataLength),
    [index, dataLength],
  );

  const accessibilityHint = useMemo(
    () => getPositionAccessibilityHint(index, dataLength),
    [index, dataLength],
  );

  const handleAccessibilityActionEvent = useCallback(
    (event: { nativeEvent: { actionName: string } }) => {
      handleAccessibilityAction(
        event as Parameters<typeof handleAccessibilityAction>[0],
        index,
        data,
        onReorder,
      );
    },
    [index, data, onReorder],
  );

  // ── Render ────────────────────────────────────────────────────

  const renderedContent = useMemo(
    () =>
      renderItem({
        item,
        index,
        isDragging,
        isAnyDragging,
      }),
    [item, index, isDragging, isAnyDragging, renderItem],
  );

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={[styles.itemContainer, itemContainerStyle, animatedStyle]}
        onLayout={handleLayout}
        accessible
        accessibilityRole="adjustable"
        accessibilityActions={accessibilityActions as { name: string; label?: string }[]}
        onAccessibilityAction={handleAccessibilityActionEvent}
        accessibilityHint={accessibilityHint}
      >
        {renderedContent}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  itemContainer: {
    // Items need to be positioned relative for z-index to work
  },
});

/**
 * Memoized SortableItem.
 *
 * We memoize on the item key + index to prevent re-renders of
 * non-dragged items. Animation state is driven by SharedValues,
 * so React re-renders are not needed for visual updates.
 */
export const SortableItem = memo(SortableItemInner) as typeof SortableItemInner;
