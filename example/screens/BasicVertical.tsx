import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { DraggableList } from 'react-native-draggable-kit';
import type { DragEndEvent } from 'react-native-draggable-kit';

interface Task {
  id: string;
  title: string;
  color: string;
}

const INITIAL_DATA: Task[] = [
  { id: '1', title: '🎯 Set project goals', color: '#6c63ff' },
  { id: '2', title: '📋 Create task list', color: '#ff6b6b' },
  { id: '3', title: '🎨 Design mockups', color: '#ffa502' },
  { id: '4', title: '💻 Implement features', color: '#2ed573' },
  { id: '5', title: '🧪 Write tests', color: '#1e90ff' },
  { id: '6', title: '📖 Update documentation', color: '#ff4757' },
  { id: '7', title: '🚀 Deploy to production', color: '#7bed9f' },
  { id: '8', title: '📊 Monitor metrics', color: '#70a1ff' },
];

/**
 * Basic vertical reorder list demo.
 *
 * Long-press an item to start dragging, then move it to reorder.
 */
export default function BasicVertical() {
  const [data, setData] = useState(INITIAL_DATA);

  const handleReorder = (event: DragEndEvent<Task>) => {
    setData(event.data);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Long-press to drag & reorder</Text>
      <DraggableList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.item, { borderLeftColor: item.color }]}>
            <Text style={styles.itemText}>{item.title}</Text>
          </View>
        )}
        onReorder={handleReorder}
        onHapticFeedback={() => {
          // Plug in your preferred haptics library here:
          // e.g., Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        }}
        wrapWithGestureHandlerRootView={false}
        containerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f23',
  },
  header: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 12,
  },
  list: {
    flex: 1,
    paddingHorizontal: 16,
  },
  item: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderLeftWidth: 4,
  },
  itemText: {
    color: '#e0e0e0',
    fontSize: 16,
    fontWeight: '500',
  },
});
