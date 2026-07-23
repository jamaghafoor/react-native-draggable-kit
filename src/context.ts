import { createContext, useContext } from 'react';
import type { DraggableContextValue } from './types';

/**
 * React context for sharing drag state between DraggableList and its items.
 *
 * This context carries Reanimated SharedValues so that SortableItem can
 * read/write animation state on the UI thread without triggering React
 * re-renders.
 */
export const DraggableContext = createContext<DraggableContextValue | null>(
  null,
);

/**
 * Hook to access the DraggableContext.
 * Throws if used outside of a DraggableList.
 */
export function useDraggableContext(): DraggableContextValue {
  const context = useContext(DraggableContext);
  if (context === null) {
    throw new Error(
      '[react-native-draggable-kit] useDraggableContext must be used within a <DraggableList />. ' +
        'Make sure your sortable items are rendered as children of DraggableList.',
    );
  }
  return context;
}
