import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { DraggableList, DragHandle } from 'react-native-draggable-kit';
import type { DragEndEvent } from 'react-native-draggable-kit';

interface MenuItem {
  id: string;
  title: string;
  subtitle: string;
}

const INITIAL_DATA: MenuItem[] = [
  { id: '1', title: 'Dashboard', subtitle: 'Overview & analytics' },
  { id: '2', title: 'Inbox', subtitle: '12 unread messages' },
  { id: '3', title: 'Calendar', subtitle: '3 events today' },
  { id: '4', title: 'Documents', subtitle: '48 files' },
  { id: '5', title: 'Settings', subtitle: 'Account & preferences' },
  { id: '6', title: 'Help Center', subtitle: 'FAQs & support' },
];

/**
 * Drag-handle-only mode demo.
 *
 * Only the grip handle (☰) triggers drag. The rest of the row
 * is interactive — the "Edit" button remains tappable during drag mode.
 */
export default function DragHandleDemo() {
  const [data, setData] = useState(INITIAL_DATA);

  const handleReorder = (event: DragEndEvent<MenuItem>) => {
    setData(event.data);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Drag the ☰ handle to reorder</Text>
      <DraggableList
        data={data}
        keyExtractor={(item) => item.id}
        dragActivationMode="immediate"
        renderItem={({ item }) => (
          <View style={styles.row}>
            <DragHandle>
              <Text style={styles.grip}>☰</Text>
            </DragHandle>
            <View style={styles.content}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.subtitle}>{item.subtitle}</Text>
            </View>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => {
                // This button remains tappable because it's outside the DragHandle
              }}
            >
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  grip: {
    fontSize: 20,
    color: '#555',
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
  subtitle: {
    color: '#888',
    fontSize: 13,
    marginTop: 2,
  },
  editButton: {
    backgroundColor: '#6c63ff22',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editText: {
    color: '#6c63ff',
    fontSize: 13,
    fontWeight: '600',
  },
});
