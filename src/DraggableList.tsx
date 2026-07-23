import React, { useCallback, useMemo } from 'react';
import { LayoutChangeEvent, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import { DraggableContext } from './context';
import { SortableItem } from './SortableItem';
import { useDraggableList } from './hooks/useDraggableList';
import { reorderArray } from './utils/reorder';
import type { DraggableListProps, DragEndEvent } from './types';

/**
 * DraggableList — the primary component of react-native-draggable-kit.
 *
 * Renders a scrollable list of items that can be reordered via
 * drag-and-drop. All gesture and animation logic runs on the UI
 * thread via Reanimated worklets for smooth 60fps performance.
 *
 * @example
 * ```tsx
 * <DraggableList
 *   data={items}
 *   keyExtractor={(item) => item.id}
 *   renderItem={({ item }) => <ItemRow item={item} />}
 *   onReorder={({ data }) => setItems(data)}
 * />
 * ```
 */
export function DraggableList<T>({
  data,
  renderItem,
  keyExtractor,
  onReorder,
  onDragStart,
  onDragging,
  onDragEnd,
  direction = 'vertical',
  dragActivationMode = 'long-press',
  dragActivationDelay,
  autoScroll,
  getItemLayout,
  dragStyle,
  containerStyle,
  contentContainerStyle,
  itemContainerStyle,
  onHapticFeedback,
  ListHeaderComponent,
  ListFooterComponent,
  ListEmptyComponent,
  wrapWithGestureHandlerRootView = true,
  enabled = true,
  testID,
}: DraggableListProps<T>) {
  const isHorizontal = direction === 'horizontal';

  // ── Core Hook ─────────────────────────────────────────────────

  const {
    contextValue,
    scrollHandler,
    scrollRef,
    onItemLayout,
    handleDragStart,
    handleDragMove,
    containerSize,
    contentSize,
  } = useDraggableList({
    data,
    direction,
    dragActivationMode,
    dragActivationDelay,
    autoScroll,
    getItemLayout,
    dragStyle,
    enabled,
    onReorder,
    onDragStart,
    onDragging,
    onDragEnd,
    onHapticFeedback,
  });

  // ── Container Layout ──────────────────────────────────────────

  const handleContainerLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { height, width } = event.nativeEvent.layout;
      containerSize.value = isHorizontal ? width : height;
    },
    [containerSize, isHorizontal],
  );

  const handleContentSizeChange = useCallback(
    (w: number, h: number) => {
      contentSize.value = isHorizontal ? w : h;
    },
    [contentSize, isHorizontal],
  );

  // ── Stable reorder callback for accessibility ─────────────────

  const handleAccessibilityReorder = useCallback(
    (event: DragEndEvent<T>) => {
      onReorder(event);
    },
    [onReorder],
  );

  // ── Drag callbacks (stable refs for SortableItem) ─────────────

  const onDragEndJS = useCallback(
    (fromIndex: number, toIndex: number) => {
      const newData = reorderArray(data, fromIndex, toIndex);
      const event: DragEndEvent<T> = {
        from: fromIndex,
        to: toIndex,
        data: newData,
      };
      onReorder(event);
      onDragEnd?.(event);
    },
    [data, onReorder, onDragEnd],
  );

  const onDragStartJS = useCallback(
    (index: number) => {
      handleDragStart(index);
    },
    [handleDragStart],
  );

  const onDragMoveJS = useCallback(
    (from: number, to: number, translation: number) => {
      handleDragMove(from, to, translation);
    },
    [handleDragMove],
  );

  // ── Render Items ──────────────────────────────────────────────

  const renderedItems = useMemo(() => {
    if (data.length === 0) {
      return ListEmptyComponent ? <>{ListEmptyComponent}</> : null;
    }

    return data.map((item, index) => {
      const key = keyExtractor(item, index);
      return (
        <SortableItem
          key={key}
          item={item}
          index={index}
          dataLength={data.length}
          data={data}
          renderItem={renderItem}
          onItemLayout={onItemLayout}
          onDragStartJS={onDragStartJS}
          onDragMoveJS={onDragMoveJS}
          onDragEndJS={onDragEndJS}
          onReorder={handleAccessibilityReorder}
          itemContainerStyle={itemContainerStyle as Record<string, unknown> | undefined}
        />
      );
    });
  }, [
    data,
    keyExtractor,
    renderItem,
    onItemLayout,
    onDragStartJS,
    onDragMoveJS,
    onDragEndJS,
    handleAccessibilityReorder,
    itemContainerStyle,
    ListEmptyComponent,
  ]);

  // ── Compose the list ──────────────────────────────────────────

  const listContent = (
    <DraggableContext.Provider value={contextValue}>
      <Animated.ScrollView
        ref={scrollRef as React.RefObject<Animated.ScrollView>}
        horizontal={isHorizontal}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        onLayout={handleContainerLayout}
        onContentSizeChange={handleContentSizeChange}
        style={[styles.container, containerStyle]}
        contentContainerStyle={[
          isHorizontal
            ? styles.horizontalContent
            : styles.verticalContent,
          contentContainerStyle,
        ]}
        showsVerticalScrollIndicator={!isHorizontal}
        showsHorizontalScrollIndicator={isHorizontal}
        scrollEnabled={enabled}
        testID={testID}
      >
        {ListHeaderComponent}
        {renderedItems}
        {ListFooterComponent}
      </Animated.ScrollView>
    </DraggableContext.Provider>
  );

  // ── Optionally wrap in GestureHandlerRootView ─────────────────

  if (wrapWithGestureHandlerRootView) {
    return (
      <GestureHandlerRootView style={styles.rootView}>
        {listContent}
      </GestureHandlerRootView>
    );
  }

  return listContent;
}

const styles = StyleSheet.create({
  rootView: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  verticalContent: {
    flexGrow: 1,
  },
  horizontalContent: {
    flexGrow: 1,
    flexDirection: 'row',
  },
});
