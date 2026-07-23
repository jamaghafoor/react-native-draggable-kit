import type { WithSpringConfig, WithTimingConfig } from 'react-native-reanimated';

/**
 * Default delay (ms) before drag activates in long-press mode.
 */
export const DEFAULT_DRAG_ACTIVATION_DELAY = 200;

/**
 * Default distance (px) from edge where auto-scroll starts.
 */
export const DEFAULT_AUTO_SCROLL_THRESHOLD = 50;

/**
 * Default maximum auto-scroll speed (px per frame).
 */
export const DEFAULT_AUTO_SCROLL_MAX_SPEED = 10;

/**
 * Default scale applied to the dragged item.
 */
export const DEFAULT_DRAG_SCALE = 1.03;

/**
 * Default opacity of the dragged item.
 */
export const DEFAULT_DRAG_OPACITY = 0.9;

/**
 * Default shadow elevation for the dragged item.
 */
export const DEFAULT_DRAG_ELEVATION = 10;

/**
 * Spring config for item displacement animations.
 * Tuned for snappy, natural movement.
 */
export const DISPLACEMENT_SPRING_CONFIG: WithSpringConfig = {
  damping: 20,
  stiffness: 200,
  mass: 0.5,
  overshootClamping: false,
  restDisplacementThreshold: 0.1,
  restSpeedThreshold: 0.1,
};

/**
 * Spring config for the dragged item snapping to its final position.
 * Slightly bouncier than displacement to feel satisfying.
 */
export const DROP_SPRING_CONFIG: WithSpringConfig = {
  damping: 18,
  stiffness: 180,
  mass: 0.6,
  overshootClamping: false,
  restDisplacementThreshold: 0.5,
  restSpeedThreshold: 0.5,
};

/**
 * Timing config for drag start scale/opacity transition.
 */
export const DRAG_START_TIMING_CONFIG: WithTimingConfig = {
  duration: 150,
};

/**
 * Z-index for the dragged item to ensure it renders above others.
 */
export const DRAGGED_ITEM_Z_INDEX = 9999;

/**
 * Minimum distance (px) a gesture must travel before it's considered a drag
 * rather than a tap. Used to avoid accidental drags.
 */
export const MIN_DRAG_DISTANCE = 3;

/**
 * The position within an item that triggers a swap.
 * 0.5 = midpoint (swap when dragged item center crosses neighbor's center).
 */
export const SWAP_THRESHOLD = 0.5;
