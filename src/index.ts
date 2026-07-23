/**
 * react-native-draggable-kit
 *
 * Production-grade drag-and-drop reordering for React Native lists.
 * Powered by Reanimated worklets and Gesture Handler v2.
 *
 * @packageDocumentation
 */

// ── Components ─────────────────────────────────────────────────
export { DraggableList } from './DraggableList';
export { DragHandle } from './DragHandle';

// ── Hooks ──────────────────────────────────────────────────────
export { useDraggableList } from './hooks/useDraggableList';
export { useDraggableContext } from './context';

// ── Types ──────────────────────────────────────────────────────
export type {
  DraggableListProps,
  DraggableRenderItemInfo,
  DragStartEvent,
  DragMoveEvent,
  DragEndEvent,
  DragStyle,
  AutoScrollConfig,
  DragHandleProps,
  DraggableContextValue,
  Direction,
  DragActivationMode,
  ItemLayoutInfo,
  GetItemLayout,
  UseDraggableListReturn,
} from './types';

// ── Utilities (for advanced use cases) ─────────────────────────
export { reorderArray } from './utils/reorder';
export {
  getAccessibilityActions,
  handleAccessibilityAction,
  getPositionAccessibilityHint,
} from './utils/accessibility';
