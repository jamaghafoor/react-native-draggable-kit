import {
  useAnimatedReaction,
  useFrameCallback,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';
import { clamp } from '../utils/reorder';
import {
  DEFAULT_AUTO_SCROLL_MAX_SPEED,
  DEFAULT_AUTO_SCROLL_THRESHOLD,
} from '../constants';
import type { AutoScrollConfig } from '../types';

interface UseAutoScrollParams {
  /** Shared value: index of the currently dragged item (-1 if none). */
  activeIndex: SharedValue<number>;
  /** Current drag position along the scroll axis. */
  dragPosition: SharedValue<number>;
  /** Current scroll offset. */
  scrollOffset: SharedValue<number>;
  /** Visible size of the scroll container. */
  containerSize: SharedValue<number>;
  /** Total scrollable content size. */
  contentSize: SharedValue<number>;
  /** Ref to the scroll view for programmatic scrolling. */
  scrollRef: React.RefObject<unknown>;
  /** Whether the list is horizontal. */
  isHorizontal: boolean;
  /** Auto-scroll configuration. */
  config?: AutoScrollConfig;
}

/**
 * Hook implementing smooth auto-scroll when dragging near container edges.
 *
 * Uses useFrameCallback for per-frame scroll updates on the UI thread,
 * avoiding any JS thread involvement during auto-scrolling.
 *
 * The scroll speed ramps up linearly as the dragged item gets closer
 * to the edge, providing a natural feel.
 */
export function useAutoScroll({
  activeIndex,
  dragPosition,
  scrollOffset,
  containerSize,
  contentSize,
  scrollRef,
  isHorizontal,
  config,
}: UseAutoScrollParams) {
  const isEnabled = config?.enabled !== false;
  const threshold = config?.threshold ?? DEFAULT_AUTO_SCROLL_THRESHOLD;
  const maxSpeed = config?.maxSpeed ?? DEFAULT_AUTO_SCROLL_MAX_SPEED;

  // Current auto-scroll velocity (px per frame). Positive = scroll down/right.
  const scrollSpeed = useSharedValue(0);

  // Determine scroll speed based on drag position relative to edges
  useAnimatedReaction(
    () => ({
      active: activeIndex.value,
      position: dragPosition.value,
      offset: scrollOffset.value,
      container: containerSize.value,
      content: contentSize.value,
    }),
    (current) => {
      if (!isEnabled || current.active < 0) {
        scrollSpeed.value = 0;
        return;
      }

      // Position relative to the visible container
      const relativePosition = current.position - current.offset;
      const maxScroll = current.content - current.container;

      if (maxScroll <= 0) {
        // Content fits in container, no scrolling needed
        scrollSpeed.value = 0;
        return;
      }

      // Near the top/left edge
      if (relativePosition < threshold) {
        const distance = Math.max(0, threshold - relativePosition);
        const ratio = distance / threshold;
        // Scroll up/left (negative direction)
        scrollSpeed.value = -maxSpeed * ratio;
        return;
      }

      // Near the bottom/right edge
      if (relativePosition > current.container - threshold) {
        const distance = Math.max(
          0,
          relativePosition - (current.container - threshold),
        );
        const ratio = distance / threshold;
        // Scroll down/right (positive direction)
        scrollSpeed.value = maxSpeed * ratio;
        return;
      }

      // Not near any edge
      scrollSpeed.value = 0;
    },
    [isEnabled, threshold, maxSpeed],
  );

  // Apply auto-scroll on every frame
  useFrameCallback(() => {
    if (scrollSpeed.value === 0 || activeIndex.value < 0) {
      return;
    }

    const maxScroll = contentSize.value - containerSize.value;
    if (maxScroll <= 0) {
      return;
    }

    const newOffset = clamp(
      scrollOffset.value + scrollSpeed.value,
      0,
      maxScroll,
    );

    if (newOffset !== scrollOffset.value) {
      scrollOffset.value = newOffset;

      // Programmatically scroll the container
      // scrollTo works on the UI thread with Reanimated animated refs
      const ref = scrollRef.current;
      if (ref && typeof (ref as Record<string, unknown>).scrollTo === 'function') {
        if (isHorizontal) {
          (ref as { scrollTo: (opts: { x: number; animated: boolean }) => void }).scrollTo({
            x: newOffset,
            animated: false,
          });
        } else {
          (ref as { scrollTo: (opts: { y: number; animated: boolean }) => void }).scrollTo({
            y: newOffset,
            animated: false,
          });
        }
      }
    }
  }, isEnabled);

  return { scrollSpeed };
}
