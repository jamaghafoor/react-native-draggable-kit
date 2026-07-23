import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { DraggableList } from 'react-native-draggable-kit';
import type { DragEndEvent } from 'react-native-draggable-kit';

interface Note {
  id: string;
  title: string;
  body: string;
  color: string;
}

const INITIAL_DATA: Note[] = [
  {
    id: '1',
    title: 'Quick thought',
    body: 'Remember to review the PR before standup.',
    color: '#ff6b6b',
  },
  {
    id: '2',
    title: 'Meeting notes',
    body: 'Discussed migration strategy for the backend services. Need to coordinate with the infrastructure team on the timeline. Also mentioned potential breaking changes in the API.',
    color: '#ffa502',
  },
  {
    id: '3',
    title: 'Bug report',
    body: 'Crash on iOS when rapidly toggling the filter. Steps to reproduce: open filter, select 3+ options quickly, close.',
    color: '#2ed573',
  },
  {
    id: '4',
    title: 'Idea',
    body: 'What if we added drag-and-drop reordering to the settings page?',
    color: '#1e90ff',
  },
  {
    id: '5',
    title: 'Shopping list',
    body: 'Milk, eggs, bread, butter, coffee beans, avocados, tomatoes, onions, garlic, olive oil, pasta, parmesan cheese.',
    color: '#6c63ff',
  },
  {
    id: '6',
    title: 'Quote',
    body: '"The best way to predict the future is to invent it." — Alan Kay',
    color: '#ff4757',
  },
];

/**
 * Variable-height items demo.
 *
 * Each note card has different content length, resulting in
 * different heights. The drag system handles measurement and
 * displacement automatically.
 */
export default function VariableHeight() {
  const [data, setData] = useState(INITIAL_DATA);

  const handleReorder = (event: DragEndEvent<Note>) => {
    setData(event.data);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        Variable-height cards — drag to reorder
      </Text>
      <DraggableList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.card, { borderLeftColor: item.color }]}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.body}>{item.body}</Text>
          </View>
        )}
        onReorder={handleReorder}
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
  card: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderLeftWidth: 4,
  },
  title: {
    color: '#e0e0e0',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  body: {
    color: '#aaa',
    fontSize: 14,
    lineHeight: 20,
  },
});
