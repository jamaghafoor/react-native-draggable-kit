import { useCallback, useEffect, useRef } from 'react';
import {
  runOnJS,
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import type {
  AutoScrollConfig,
  DraggableContextValue,
  DragEndEvent,
  DragMoveEvent,
  DragStartEvent,
  DragStyle,
  GetItemLayout,
} from '../types';
import {
  DEFAULT_DRAG_ACTIVATION_DELAY,
  DEFAULT_DRAG_ELEVATION,
  DEFAULT_DRAG_OPACITY,
  DEFAULT_DRAG_SCALE,
} from '../constants';
import { buildInitialPositions, getVisualPosition, reorderArray } from '../utils/reorder';
import { useItemMeasurements } from './useItemMeasurements';
import { useAutoScroll } from './useAutoScroll';
import type { Direction, DragActivationMode } from '../types';

interface UseDraggableListParams<T> {
  data: readonly T[];
  direction?: Direction;
  dragActivationMode?: DragActivationMode;
  dragActivationDelay?: number;
  autoScroll?: AutoScrollConfig;
  getItemLayout?: GetItemLayout<T>;
  dragStyle?: DragStyle;
  enabled?: boolean;
  onReorder: (event: DragEndEvent<T>) => void;
  onDragStart?: (event: DragStartEvent<T>) => void;
  onDragging?: (event: DragMoveEvent) => void;
  onDragEnd?: (event: DragEndEvent<T>) => void;
  onHapticFeedback?: () => void;
}

/**
 * Core hook that powers DraggableList.
 *
 * Can be used directly for building custom drag-and-drop UIs
 * without the DraggableList wrapper component.
 *
 * All gesture and animation state is managed via Reanimated SharedValues,
 * keeping the UI thread in full control during active drags.
 */
export function useDraggableList<T>({
  data,
  direction = 'vertical',
  dragActivationMode = 'long-press',
  dragActivationDelay = DEFAULT_DRAG_ACTIVATION_DELAY,
  autoScroll,
  getItemLayout,
  dragStyle,
  enabled = true,
  onReorder,
  onDragStart,
  onDragging,
  onDragEnd,
  onHapticFeedback,
}: UseDraggableListParams<T>) {
  const isHorizontal = direction === 'horizontal';

  // ── Shared Values ──────────────────────────────────────────────

  /** Index of the currently dragged item, or -1 */
  const activeIndex = useSharedValue(-1);

  /** Position mapping: positions[visualIndex] = dataIndex */
  const positions = useSharedValue<number[]>(buildInitialPositions(data.length));

  /** Animated displacement offsets for each item */
  const offsets = useSharedValue<number[]>(new Array(data.length).fill(0) as number[]);

  /** Current drag translation along the primary axis */
  const dragTranslation = useSharedValue(0);

  /** The starting offset of the dragged item (its natural position) */
  const dragStartOffset = useSharedValue(0);

  /** Scroll state */
  const scrollOffset = useSharedValue(0);
  const containerSize = useSharedValue(0);
  const contentSize = useSharedValue(0);

  /** Drag handle mode */
  const useHandleMode = useSharedValue(false);
  const activeHandleId = useSharedValue(-1);

  /** Scroll ref */
  const scrollRef = useAnimatedRef<never>();

  // ── Callbacks stored in refs (stable for worklet access via runOnJS) ──

  const onReorderRef = useRef<((event: DragEndEvent<T>) => void) | null>(onReorder);
  onReorderRef.current = onReorder;

  const onDragStartRef = useRef<((event: DragStartEvent<T>) => void) | null>(onDragStart ?? null);
  onDragStartRef.current = onDragStart ?? null;

  const onDraggingRef = useRef<((event: DragMoveEvent) => void) | null>(onDragging ?? null);
  onDraggingRef.current = onDragging ?? null;

  const onDragEndRef = useRef<((event: DragEndEvent<T>) => void) | null>(onDragEnd ?? null);
  onDragEndRef.current = onDragEnd ?? null;

  const onHapticFeedbackRef = useRef<(() => void) | null>(onHapticFeedback ?? null);
  onHapticFeedbackRef.current = onHapticFeedback ?? null;

  // ── Item Measurements ────────────────────────────────────────

  const {
    itemSizes,
    itemOffsets,
    onItemLayout,
    initializeFromLayout,
  } = useItemMeasurements(data, getItemLayout);

  // Initialize measurements when data changes
  useEffect(() => {
    initializeFromLayout();
    positions.value = buildInitialPositions(data.length);
    offsets.value = new Array(data.length).fill(0) as number[];
  }, [data.length, initializeFromLayout, positions, offsets]);

  // ── Drag Position (for auto-scroll) ──────────────────────────

  const dragPosition = useSharedValue(0);

  useAnimatedReaction(
    () => ({
      active: activeIndex.value,
      translation: dragTranslation.value,
      startOffset: dragStartOffset.value,
    }),
    (current) => {
      if (current.active >= 0) {
        dragPosition.value = current.startOffset + current.translation;
      }
    },
    [],
  );

  // ── Auto-Scroll ──────────────────────────────────────────────

  useAutoScroll({
    activeIndex,
    dragPosition,
    scrollOffset,
    containerSize,
    contentSize,
    scrollRef,
    isHorizontal,
    config: autoScroll,
  });

  // ── Scroll Handler ───────────────────────────────────────────

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollOffset.value = isHorizontal
        ? event.contentOffset.x
        : event.contentOffset.y;
    },
  });

  // ── Drag End Handler (called from JS thread) ─────────────────

  const handleDragEnd = useCallback(
    (fromIndex: number, toIndex: number) => {
      const newData = reorderArray(data, fromIndex, toIndex);
      const event: DragEndEvent<T> = {
        from: fromIndex,
        to: toIndex,
        data: newData,
      };

      onReorderRef.current?.(event);
      onDragEndRef.current?.(event);
    },
    [data],
  );

  // ── Drag Start Handler (called from JS thread) ──────────────

  const handleDragStart = useCallback(
    (index: number) => {
      const item = data[index];
      if (item !== undefined) {
        onDragStartRef.current?.({ index, item });
      }
      onHapticFeedbackRef.current?.();
    },
    [data],
  );

  // ── Drag Move Handler (called from JS thread) ───────────────

  const handleDragMove = useCallback(
    (fromIndex: number, toIndex: number, translation: number) => {
      onDraggingRef.current?.({ fromIndex, toIndex, translation });
    },
    [],
  );

  // ── Context Value ────────────────────────────────────────────

  const resolvedDragStyle: Required<DragStyle> = {
    scale: dragStyle?.scale ?? DEFAULT_DRAG_SCALE,
    opacity: dragStyle?.opacity ?? DEFAULT_DRAG_OPACITY,
    elevation: dragStyle?.elevation ?? DEFAULT_DRAG_ELEVATION,
    backgroundColor: dragStyle?.backgroundColor ?? 'transparent',
  };

  const contextValue: DraggableContextValue = {
    activeIndex,
    positions,
    offsets,
    itemSizes,
    itemOffsets,
    scrollOffset,
    containerSize,
    contentSize,
    dragTranslation,
    dragStartOffset,
    direction,
    dragActivationMode,
    dragActivationDelay,
    dragStyle: resolvedDragStyle,
    enabled,
    useHandleMode,
    activeHandleId,
    scrollRef: scrollRef as unknown as React.RefObject<unknown>,
    onReorderRef: onReorderRef as unknown as React.RefObject<((event: DragEndEvent<unknown>) => void) | null>,
    onDragStartRef: onDragStartRef as unknown as React.RefObject<((event: DragStartEvent<unknown>) => void) | null>,
    onDraggingRef: onDraggingRef as unknown as React.RefObject<((event: DragMoveEvent) => void) | null>,
    onDragEndRef: onDragEndRef as unknown as React.RefObject<((event: DragEndEvent<unknown>) => void) | null>,
    onHapticFeedbackRef: onHapticFeedbackRef as unknown as React.RefObject<(() => void) | null>,
    dataLength: data.length,
  };

  // ── Return ───────────────────────────────────────────────────

  return {
    contextValue,
    scrollHandler,
    scrollRef,
    activeIndex,
    positions,
    onItemLayout,
    handleDragEnd: useCallback(
      (from: number) => {
        // Determine the final position by looking at the positions array
        const currentPositions = positions.value;
        const toVisual = getVisualPosition(currentPositions, from);

        // The "to" index is the data index that was at the original visual position
        // But we need to map from the visual position to the original data index
        // toVisual is where `from` currently sits visually
        handleDragEnd(from, toVisual);
      },
      [handleDragEnd, positions],
    ),
    handleDragStart,
    handleDragMove,
    containerSize,
    contentSize,
    runOnJS,
  };
}
