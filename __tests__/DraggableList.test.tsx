import React from 'react';
import { Text, View } from 'react-native';
import { render } from '@testing-library/react-native';
import { DraggableList } from '../src/DraggableList';

// Note: Full gesture simulation requires a native environment.
// These tests verify correct rendering behavior and edge cases.

interface TestItem {
  id: string;
  title: string;
}

const createTestData = (count: number): TestItem[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `item-${i}`,
    title: `Item ${i}`,
  }));

const defaultRenderItem = ({ item }: { item: TestItem }) => (
  <View testID={`item-${item.id}`}>
    <Text>{item.title}</Text>
  </View>
);

const defaultKeyExtractor = (item: TestItem) => item.id;

describe('DraggableList', () => {
  it('should render all items', () => {
    const data = createTestData(5);
    const onReorder = jest.fn();

    const { getAllByText } = render(
      <DraggableList
        data={data}
        renderItem={defaultRenderItem}
        keyExtractor={defaultKeyExtractor}
        onReorder={onReorder}
        testID="draggable-list"
      />,
    );

    expect(getAllByText(/^Item \d$/)).toHaveLength(5);
  });

  it('should render empty component when data is empty', () => {
    const onReorder = jest.fn();

    const { getByText } = render(
      <DraggableList
        data={[]}
        renderItem={defaultRenderItem}
        keyExtractor={defaultKeyExtractor}
        onReorder={onReorder}
        ListEmptyComponent={<Text>No items</Text>}
      />,
    );

    expect(getByText('No items')).toBeTruthy();
  });

  it('should render nothing when data is empty and no empty component', () => {
    const onReorder = jest.fn();

    const { queryByText } = render(
      <DraggableList
        data={[]}
        renderItem={defaultRenderItem}
        keyExtractor={defaultKeyExtractor}
        onReorder={onReorder}
      />,
    );

    expect(queryByText(/Item/)).toBeNull();
  });

  it('should render single item', () => {
    const data = createTestData(1);
    const onReorder = jest.fn();

    const { getByText } = render(
      <DraggableList
        data={data}
        renderItem={defaultRenderItem}
        keyExtractor={defaultKeyExtractor}
        onReorder={onReorder}
      />,
    );

    expect(getByText('Item 0')).toBeTruthy();
  });

  it('should render header and footer components', () => {
    const data = createTestData(2);
    const onReorder = jest.fn();

    const { getByText } = render(
      <DraggableList
        data={data}
        renderItem={defaultRenderItem}
        keyExtractor={defaultKeyExtractor}
        onReorder={onReorder}
        ListHeaderComponent={<Text>Header</Text>}
        ListFooterComponent={<Text>Footer</Text>}
      />,
    );

    expect(getByText('Header')).toBeTruthy();
    expect(getByText('Footer')).toBeTruthy();
  });

  it('should apply testID to container', () => {
    const data = createTestData(2);
    const onReorder = jest.fn();

    const { getByTestId } = render(
      <DraggableList
        data={data}
        renderItem={defaultRenderItem}
        keyExtractor={defaultKeyExtractor}
        onReorder={onReorder}
        testID="my-list"
      />,
    );

    expect(getByTestId('my-list')).toBeTruthy();
  });

  it('should accept horizontal direction', () => {
    const data = createTestData(3);
    const onReorder = jest.fn();

    // Should not throw
    const { getAllByText } = render(
      <DraggableList
        data={data}
        renderItem={defaultRenderItem}
        keyExtractor={defaultKeyExtractor}
        onReorder={onReorder}
        direction="horizontal"
      />,
    );

    expect(getAllByText(/^Item \d$/)).toHaveLength(3);
  });

  it('should render without GestureHandlerRootView when opt-out', () => {
    const data = createTestData(2);
    const onReorder = jest.fn();

    // Should not throw
    const { getAllByText } = render(
      <DraggableList
        data={data}
        renderItem={defaultRenderItem}
        keyExtractor={defaultKeyExtractor}
        onReorder={onReorder}
        wrapWithGestureHandlerRootView={false}
      />,
    );

    expect(getAllByText(/^Item \d$/)).toHaveLength(2);
  });
});
