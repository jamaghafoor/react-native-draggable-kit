import type { AccessibilityActionEvent } from 'react-native';
import { reorderArray } from './reorder';

/**
 * Accessibility action names for reordering.
 */
export const ACCESSIBILITY_ACTIONS = [
  { name: 'moveUp', label: 'Move item up' },
  { name: 'moveDown', label: 'Move item down' },
  { name: 'moveToTop', label: 'Move item to top' },
  { name: 'moveToBottom', label: 'Move item to bottom' },
] as const;

/**
 * Generates the accessibility actions array for a sortable item.
 *
 * @param index - Current index of the item.
 * @param total - Total number of items.
 * @returns Array of accessibility actions applicable to this item.
 */
export function getAccessibilityActions(
  index: number,
  total: number,
): readonly { name: string; label: string }[] {
  const actions: { name: string; label: string }[] = [];

  if (index > 0) {
    actions.push({ name: 'moveUp', label: 'Move item up' });
    actions.push({ name: 'moveToTop', label: 'Move item to top' });
  }

  if (index < total - 1) {
    actions.push({ name: 'moveDown', label: 'Move item down' });
    actions.push({ name: 'moveToBottom', label: 'Move item to bottom' });
  }

  return actions;
}

/**
 * Handle an accessibility action for reordering.
 *
 * @param event - The accessibility action event.
 * @param index - Current index of the item.
 * @param data - The current data array.
 * @param onReorder - Callback to execute the reorder.
 * @returns Whether the action was handled.
 */
export function handleAccessibilityAction<T>(
  event: AccessibilityActionEvent,
  index: number,
  data: readonly T[],
  onReorder: (params: { from: number; to: number; data: T[] }) => void,
): boolean {
  const actionName = event.nativeEvent.actionName;
  let toIndex: number | null = null;

  switch (actionName) {
    case 'moveUp':
      if (index > 0) {
        toIndex = index - 1;
      }
      break;
    case 'moveDown':
      if (index < data.length - 1) {
        toIndex = index + 1;
      }
      break;
    case 'moveToTop':
      if (index > 0) {
        toIndex = 0;
      }
      break;
    case 'moveToBottom':
      if (index < data.length - 1) {
        toIndex = data.length - 1;
      }
      break;
    default:
      return false;
  }

  if (toIndex !== null) {
    const newData = reorderArray(data, index, toIndex);
    onReorder({ from: index, to: toIndex, data: newData });
    return true;
  }

  return false;
}

/**
 * Generate an accessibility hint describing the item's position.
 *
 * @param index - Current index (0-based).
 * @param total - Total number of items.
 * @returns A descriptive string like "Item 3 of 10. Use actions to reorder."
 */
export function getPositionAccessibilityHint(
  index: number,
  total: number,
): string {
  return `Item ${index + 1} of ${total}. Use accessibility actions to reorder.`;
}
