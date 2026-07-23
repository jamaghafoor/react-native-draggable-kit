import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';

/**
 * Direction of the sortable list.
 */
export type Direction = 'vertical' | 'horizontal';

/**
 * Drag activation mode.
 * - 'long-press': Drag starts after a configurable delay (default).
 * - 'immediate': Drag starts on touch down (useful with drag handles).
 */
export type DragActivationMode = 'long-press' | 'immediate';

/**
 * Information about a drag start event.
 */
export interface DragStartEvent<T> {
  /** Index of the item being dragged. */
  index: number;
  /** The data item being dragged. */
  item: T;
}

/**
 * Information emitted continuously during a drag.
 */
export interface DragMoveEvent {
  /** Index of the item being dragged (original index). */
  fromIndex: number;
  /** Current hover index (where the item would drop). */
  toIndex: number;
  /** Current translation in the drag axis. */
  translation: number;
}

/**
 * Information about a completed drag-and-drop reorder.
 */
export interface DragEndEvent<T> {
  /** Original index of the dragged item. */
  from: number;
  /** New index of the dragged item. */
  to: number;
  /** The reordered data array. */
  data: T[];
}

/**
 * Layout information for a single item.
 */
export interface ItemLayoutInfo {
  /** Size of the item along the drag axis (height for vertical, width for horizontal). */
  size: number;
  /** Offset from the start of the container. */
  offset: number;
}

/**
 * Callback to provide item layout when sizes are known ahead of time.
 * Avoids the onLayout measurement pass.
 */
export type GetItemLayout<T> = (
  data: T[],
  index: number,
) => ItemLayoutInfo;

/**
 * Style customization for the dragged item.
 */
export interface DragStyle {
  /** Scale factor applied to the dragged item. Default: 1.03 */
  scale?: number;
  /** Opacity of the dragged item. Default: 0.9 */
  opacity?: number;
  /** Shadow elevation (Android) / shadow properties (iOS). Default: 10 */
  elevation?: number;
  /** Background color of the dragged item overlay. */
  backgroundColor?: string;
}

/**
 * Auto-scroll configuration.
 */
export interface AutoScrollConfig {
  /** Whether auto-scroll is enabled. Default: true */
  enabled?: boolean;
  /**
   * Distance in px from the container edge where auto-scroll begins.
   * Default: 50
   */
  threshold?: number;
  /**
   * Maximum scroll speed in px/frame.
   * Default: 10
   */
  maxSpeed?: number;
}

/**
 * Render item info passed to the renderItem callback.
 */
export interface DraggableRenderItemInfo<T> {
  /** The data item. */
  item: T;
  /** Index in the current data array. */
  index: number;
  /** Whether this item is currently being dragged. */
  isDragging: SharedValue<boolean>;
  /** Whether drag is active on any item in the list. */
  isAnyDragging: SharedValue<boolean>;
}

/**
 * Props for the DraggableList component.
 */
export interface DraggableListProps<T> {
  /** Array of data items to render. */
  data: T[];

  /** Render function for each item. */
  renderItem: (info: DraggableRenderItemInfo<T>) => ReactNode;

  /**
   * Unique key extractor for each item.
   * Must return a stable, unique string for each item.
   */
  keyExtractor: (item: T, index: number) => string;

  /**
   * Called when a drag-and-drop reorder completes.
   * Receives the new order of items.
   */
  onReorder: (event: DragEndEvent<T>) => void;

  /** Called when a drag gesture begins. */
  onDragStart?: (event: DragStartEvent<T>) => void;

  /** Called continuously during drag with position updates. */
  onDragging?: (event: DragMoveEvent) => void;

  /**
   * Called when a drag ends (after animation completes).
   * This fires even if the item returns to its original position.
   */
  onDragEnd?: (event: DragEndEvent<T>) => void;

  /** Layout direction. Default: 'vertical' */
  direction?: Direction;

  /**
   * How drag activation works.
   * Default: 'long-press'
   */
  dragActivationMode?: DragActivationMode;

  /**
   * Delay in ms before drag activates in long-press mode.
   * Ignored when dragActivationMode is 'immediate'.
   * Default: 200
   */
  dragActivationDelay?: number;

  /** Auto-scroll configuration. */
  autoScroll?: AutoScrollConfig;

  /**
   * Provide item layout ahead of time to skip onLayout measurement.
   * Similar to FlatList's getItemLayout.
   */
  getItemLayout?: GetItemLayout<T>;

  /** Style customization for the item while being dragged. */
  dragStyle?: DragStyle;

  /** Style for the outer container. */
  containerStyle?: StyleProp<ViewStyle>;

  /** Style for the scroll content container. */
  contentContainerStyle?: StyleProp<ViewStyle>;

  /** Style applied to each item's wrapper view. */
  itemContainerStyle?: StyleProp<ViewStyle>;

  /**
   * Optional haptic feedback callback fired on drag start.
   * Pluggable — use any haptics library you prefer.
   * Called on the JS thread via runOnJS.
   */
  onHapticFeedback?: () => void;

  /** Component rendered at the top of the list. */
  ListHeaderComponent?: ReactNode;

  /** Component rendered at the bottom of the list. */
  ListFooterComponent?: ReactNode;

  /** Component rendered when data is empty. */
  ListEmptyComponent?: ReactNode;

  /**
   * Whether to wrap the list in a GestureHandlerRootView.
   * Set to false if your app already has one at the root.
   * Default: true
   */
  wrapWithGestureHandlerRootView?: boolean;

  /**
   * Custom scroll component. Must be compatible with Animated.ScrollView ref API.
   * Default: Animated.ScrollView
   */
  renderScrollComponent?: React.ComponentType<Record<string, unknown>>;

  /**
   * Whether the list items can be dragged.
   * Useful for conditionally disabling drag.
   * Default: true
   */
  enabled?: boolean;

  /** testID for the container view. */
  testID?: string;
}

/**
 * Context value shared between DraggableList and SortableItem.
 */
export interface DraggableContextValue {
  /** Index of the currently dragged item, or -1 if none. */
  activeIndex: SharedValue<number>;
  /** Current positions mapping: positions[visualIndex] = dataIndex */
  positions: SharedValue<number[]>;
  /** Animated offsets for each item along the drag axis. */
  offsets: SharedValue<number[]>;
  /** Measured sizes of each item along the drag axis. */
  itemSizes: SharedValue<number[]>;
  /** Cumulative offsets (prefix sum of sizes). */
  itemOffsets: SharedValue<number[]>;
  /** Current scroll offset of the container. */
  scrollOffset: SharedValue<number>;
  /** Size of the visible container. */
  containerSize: SharedValue<number>;
  /** Total content size. */
  contentSize: SharedValue<number>;
  /** The translation of the active drag gesture. */
  dragTranslation: SharedValue<number>;
  /** The starting position of the active drag. */
  dragStartOffset: SharedValue<number>;
  /** Direction of the list. */
  direction: Direction;
  /** Drag activation mode. */
  dragActivationMode: DragActivationMode;
  /** Drag activation delay (ms). */
  dragActivationDelay: number;
  /** Drag style config. */
  dragStyle: Required<DragStyle>;
  /** Whether drag is enabled. */
  enabled: boolean;
  /** Whether a drag handle is being used (set by DragHandle). */
  useHandleMode: SharedValue<boolean>;
  /** ID of the handle that activated drag. */
  activeHandleId: SharedValue<number>;
  /** Scroll ref for auto-scroll. */
  scrollRef: React.RefObject<unknown>;
  /** Callback refs */
  onReorderRef: React.RefObject<((event: DragEndEvent<unknown>) => void) | null>;
  onDragStartRef: React.RefObject<((event: DragStartEvent<unknown>) => void) | null>;
  onDraggingRef: React.RefObject<((event: DragMoveEvent) => void) | null>;
  onDragEndRef: React.RefObject<((event: DragEndEvent<unknown>) => void) | null>;
  onHapticFeedbackRef: React.RefObject<(() => void) | null>;
  /** Data length for bounds checking. */
  dataLength: number;
}

/**
 * Return type of the useDraggableList hook.
 */
export interface UseDraggableListReturn {
  /** Shared value: index of currently dragged item (-1 if none). */
  activeIndex: SharedValue<number>;
  /** Shared value: current position mapping. */
  positions: SharedValue<number[]>;
  /** Props to spread onto the scroll container. */
  containerProps: {
    onScroll: (event: { nativeEvent: { contentOffset: { x: number; y: number } } }) => void;
    scrollEventThrottle: number;
    ref: React.RefObject<unknown>;
  };
  /** Get the gesture for a specific item index. */
  getGesture: (index: number) => unknown;
  /** Get the animated style for a specific item index. */
  getAnimatedStyle: (index: number) => Record<string, unknown>;
}

/**
 * Props for the DragHandle component.
 */
export interface DragHandleProps {
  children: ReactNode;
  /** Style for the handle wrapper. */
  style?: StyleProp<ViewStyle>;
  /** Accessibility label for the drag handle. */
  accessibilityLabel?: string;
}
