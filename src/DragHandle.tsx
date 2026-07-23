import { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useDraggableContext } from './context';
import type { DragHandleProps } from './types';

/**
 * DragHandle component.
 *
 * When used inside a DraggableList item, restricts drag initiation
 * to this specific sub-component (e.g., a grip icon).
 *
 * Usage:
 * ```tsx
 * renderItem={({ item }) => (
 *   <View style={styles.row}>
 *     <DragHandle>
 *       <GripIcon />
 *     </DragHandle>
 *     <Text>{item.title}</Text>
 *   </View>
 * )}
 * ```
 *
 * When DragHandle is present, the parent SortableItem should have
 * dragActivationMode set to 'immediate' for the best UX, since
 * the handle itself provides the interaction constraint.
 */
export function DragHandle({
  children,
  style,
  accessibilityLabel = 'Drag handle. Long press and drag to reorder.',
}: DragHandleProps) {
  const ctx = useDraggableContext();

  // A native gesture that activates on touch and sets the handle mode
  const handleGesture = Gesture.Native()
    .onStart(() => {
      'worklet';
      ctx.useHandleMode.value = true;
    })
    .onEnd(() => {
      'worklet';
      ctx.useHandleMode.value = false;
    });

  const preventBubble = useCallback(
    (e: { stopPropagation?: () => void }) => {
      // Prevent tap events from bubbling to parent interactive elements
      e.stopPropagation?.();
    },
    [],
  );

  return (
    <GestureDetector gesture={handleGesture}>
      <View
        style={[styles.handle, style]}
        accessible
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onStartShouldSetResponder={() => true}
        onResponderGrant={preventBubble}
      >
        {children}
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  handle: {
    // Ensure the handle has a minimum hit target for accessibility
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
