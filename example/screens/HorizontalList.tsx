import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { DraggableList } from 'react-native-draggable-kit';
import type { DragEndEvent } from 'react-native-draggable-kit';

interface ColorCard {
  id: string;
  label: string;
  color: string;
}

const INITIAL_DATA: ColorCard[] = [
  { id: '1', label: 'Mon', color: '#ff6b6b' },
  { id: '2', label: 'Tue', color: '#ffa502' },
  { id: '3', label: 'Wed', color: '#2ed573' },
  { id: '4', label: 'Thu', color: '#1e90ff' },
  { id: '5', label: 'Fri', color: '#6c63ff' },
  { id: '6', label: 'Sat', color: '#ff4757' },
  { id: '7', label: 'Sun', color: '#7bed9f' },
];

/**
 * Horizontal reorder list demo.
 *
 * Shows cards in a horizontal scroll that can be reordered by dragging.
 */
export default function HorizontalList() {
  const [data, setData] = useState(INITIAL_DATA);

  const handleReorder = (event: DragEndEvent<ColorCard>) => {
    setData(event.data);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Drag cards left/right to reorder</Text>
      <DraggableList
        data={data}
        direction="horizontal"
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: item.color }]}>
            <Text style={styles.cardLabel}>{item.label}</Text>
          </View>
        )}
        onReorder={handleReorder}
        wrapWithGestureHandlerRootView={false}
        containerStyle={styles.list}
        contentContainerStyle={styles.content}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f23',
    justifyContent: 'center',
  },
  header: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 12,
  },
  list: {
    maxHeight: 160,
  },
  content: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  card: {
    width: 80,
    height: 120,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 6,
  },
  cardLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
