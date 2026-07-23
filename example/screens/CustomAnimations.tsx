import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { DraggableList } from 'react-native-draggable-kit';
import type { DragEndEvent } from 'react-native-draggable-kit';

interface PriorityItem {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  emoji: string;
}

const INITIAL_DATA: PriorityItem[] = [
  { id: '1', title: 'Fix critical bug', priority: 'high', emoji: '🔴' },
  { id: '2', title: 'Code review', priority: 'medium', emoji: '🟡' },
  { id: '3', title: 'Update deps', priority: 'low', emoji: '🟢' },
  { id: '4', title: 'Write tests', priority: 'medium', emoji: '🟡' },
  { id: '5', title: 'Deploy hotfix', priority: 'high', emoji: '🔴' },
  { id: '6', title: 'Refactor module', priority: 'low', emoji: '🟢' },
];

/**
 * Custom animations demo.
 *
 * Shows how to customize the drag appearance with custom
 * scale, opacity, and elevation values.
 */
export default function CustomAnimations() {
  const [data, setData] = useState(INITIAL_DATA);

  const handleReorder = (event: DragEndEvent<PriorityItem>) => {
    setData(event.data);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        Custom drag style: scale 1.08, opacity 0.8
      </Text>
      <DraggableList
        data={data}
        keyExtractor={(item) => item.id}
        dragStyle={{
          scale: 1.08,
          opacity: 0.8,
          elevation: 15,
        }}
        dragActivationDelay={150}
        autoScroll={{
          enabled: true,
          threshold: 80,
          maxSpeed: 15,
        }}
        renderItem={({ item }) => (
          <View
            style={[
              styles.item,
              item.priority === 'high' && styles.highPriority,
              item.priority === 'medium' && styles.medPriority,
              item.priority === 'low' && styles.lowPriority,
            ]}
          >
            <Text style={styles.emoji}>{item.emoji}</Text>
            <View style={styles.content}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.priority}>
                {item.priority.toUpperCase()} PRIORITY
              </Text>
            </View>
          </View>
        )}
        onReorder={handleReorder}
        onDragStart={({ index, item }) => {
          // Example: track analytics on drag start
          void index;
          void item;
        }}
        onDragging={({ fromIndex, toIndex }) => {
          // Example: update a live preview
          void fromIndex;
          void toIndex;
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
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  highPriority: {
    backgroundColor: '#2a1a1a',
    borderColor: '#ff4757',
    borderWidth: 1,
  },
  medPriority: {
    backgroundColor: '#2a2a1a',
    borderColor: '#ffa502',
    borderWidth: 1,
  },
  lowPriority: {
    backgroundColor: '#1a2a1a',
    borderColor: '#2ed573',
    borderWidth: 1,
  },
  emoji: {
    fontSize: 24,
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    color: '#e0e0e0',
    fontSize: 16,
    fontWeight: '600',
  },
  priority: {
    color: '#888',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 4,
  },
});
