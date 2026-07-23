# react-native-draggable-kit

Production-grade drag-and-drop reordering for React Native lists. Powered by Reanimated worklets and Gesture Handler v2 for buttery-smooth 60fps animations on the UI thread.

<!-- Behavior GIF: A short recording showing a user long-pressing an item in a vertical list, dragging it over other items (which smoothly displace with spring animations), and dropping it into a new position. The dragged item should show slight scale-up and shadow elevation. -->

## Features

- 🚀 **UI-thread animations** — All gesture and animation logic runs on the UI thread via Reanimated worklets. Zero JS-thread involvement during drag.
- 📱 **Vertical & horizontal** — Full support for both vertical and horizontal list reordering.
- 📏 **Variable-size items** — Handles items with different heights/widths automatically.
- ☰ **Drag handles** — Optional `<DragHandle>` component to restrict drag to a specific touch target.
- 🎯 **Long-press or immediate** — Configurable drag activation mode.
- 📜 **Auto-scroll** — Smooth auto-scrolling when dragging near container edges.
- 🔧 **Customizable** — Tune scale, opacity, shadow, spring configs, and more.
- ♿ **Accessible** — Screen reader support with Move Up/Down accessibility actions.
- 📦 **TypeScript-first** — Written entirely in TypeScript with full type definitions shipped.
- 🏗️ **Old & New Architecture** — Supports both Bridge and Fabric/TurboModules.

## Requirements

| Dependency | Minimum Version |
|---|---|
| React Native | 0.71.0 |
| react-native-reanimated | 3.0.0 |
| react-native-gesture-handler | 2.9.0 |
| React | 18.0.0 |

## Installation

```bash
npm install react-native-draggable-kit
# or
yarn add react-native-draggable-kit
```

### Peer Dependencies

This package requires `react-native-reanimated` and `react-native-gesture-handler` as peer dependencies. If you haven't set them up already:

```bash
npm install react-native-reanimated react-native-gesture-handler
```

#### Reanimated Setup

Add the Reanimated Babel plugin to your `babel.config.js` — it **must be listed last**:

```js
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // ... other plugins
    'react-native-reanimated/plugin', // MUST be last
  ],
};
```

#### Gesture Handler Setup

Wrap your app root with `<GestureHandlerRootView>`:

```tsx
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* your app */}
    </GestureHandlerRootView>
  );
}
```

> **Note:** `DraggableList` wraps itself in `GestureHandlerRootView` by default. If your app already has one at the root, pass `wrapWithGestureHandlerRootView={false}` to avoid nesting.

## Quick Start

```tsx
import React, { useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { DraggableList } from 'react-native-draggable-kit';

const INITIAL_DATA = [
  { id: '1', title: 'First item' },
  { id: '2', title: 'Second item' },
  { id: '3', title: 'Third item' },
];

export default function App() {
  const [data, setData] = useState(INITIAL_DATA);

  return (
    <DraggableList
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.item}>
          <Text>{item.title}</Text>
        </View>
      )}
      onReorder={({ data: newData }) => setData(newData)}
    />
  );
}

const styles = StyleSheet.create({
  item: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});
```

## API Reference

### `<DraggableList<T> />`

The primary component. Props follow FlatList conventions where applicable.

| Prop | Type | Default | Description |
|---|---|---|---|
| `data` | `T[]` | *required* | Array of items to render |
| `renderItem` | `(info: DraggableRenderItemInfo<T>) => ReactNode` | *required* | Render function for each item |
| `keyExtractor` | `(item: T, index: number) => string` | *required* | Unique key for each item |
| `onReorder` | `(event: DragEndEvent<T>) => void` | *required* | Called with the reordered data array |
| `onDragStart` | `(event: DragStartEvent<T>) => void` | — | Called when drag begins |
| `onDragging` | `(event: DragMoveEvent) => void` | — | Called continuously during drag |
| `onDragEnd` | `(event: DragEndEvent<T>) => void` | — | Called when drag completes |
| `direction` | `'vertical' \| 'horizontal'` | `'vertical'` | List direction |
| `dragActivationMode` | `'long-press' \| 'immediate'` | `'long-press'` | How drag is activated |
| `dragActivationDelay` | `number` | `200` | Long-press delay in ms |
| `autoScroll` | `AutoScrollConfig` | `{ enabled: true, threshold: 50, maxSpeed: 10 }` | Auto-scroll settings |
| `getItemLayout` | `(data: T[], index: number) => ItemLayoutInfo` | — | Pre-provide item sizes |
| `dragStyle` | `DragStyle` | `{ scale: 1.03, opacity: 0.9, elevation: 10 }` | Dragged item appearance |
| `containerStyle` | `StyleProp<ViewStyle>` | — | Outer container style |
| `contentContainerStyle` | `StyleProp<ViewStyle>` | — | Scroll content style |
| `itemContainerStyle` | `StyleProp<ViewStyle>` | — | Item wrapper style |
| `onHapticFeedback` | `() => void` | — | Haptic callback on drag start |
| `ListHeaderComponent` | `ReactNode` | — | Header component |
| `ListFooterComponent` | `ReactNode` | — | Footer component |
| `ListEmptyComponent` | `ReactNode` | — | Empty state component |
| `wrapWithGestureHandlerRootView` | `boolean` | `true` | Auto-wrap in GHRV |
| `enabled` | `boolean` | `true` | Enable/disable dragging |
| `testID` | `string` | — | Test ID for the container |

### `<DragHandle />`

Restricts drag initiation to a specific sub-component.

```tsx
import { DraggableList, DragHandle } from 'react-native-draggable-kit';

<DraggableList
  dragActivationMode="immediate"  // recommended with handles
  renderItem={({ item }) => (
    <View style={styles.row}>
      <DragHandle>
        <GripIcon />
      </DragHandle>
      <Text>{item.title}</Text>
    </View>
  )}
  // ...
/>
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `ReactNode` | *required* | Handle content (e.g., grip icon) |
| `style` | `StyleProp<ViewStyle>` | — | Handle wrapper style |
| `accessibilityLabel` | `string` | `'Drag handle...'` | A11y label |

### `useDraggableList` Hook

Lower-level hook for building custom drag UIs.

```tsx
import { useDraggableList } from 'react-native-draggable-kit';

const {
  contextValue,    // Spread into DraggableContext.Provider
  scrollHandler,   // Pass to Animated.ScrollView onScroll
  scrollRef,       // Pass to Animated.ScrollView ref
  activeIndex,     // SharedValue<number> — currently dragged index
  positions,       // SharedValue<number[]> — current order
} = useDraggableList({ data, onReorder, ... });
```

### Types

```typescript
interface DragEndEvent<T> {
  from: number;    // Original index
  to: number;      // New index
  data: T[];       // Reordered array
}

interface DragStartEvent<T> {
  index: number;
  item: T;
}

interface DragMoveEvent {
  fromIndex: number;
  toIndex: number;
  translation: number;
}

interface DragStyle {
  scale?: number;      // Default: 1.03
  opacity?: number;    // Default: 0.9
  elevation?: number;  // Default: 10
  backgroundColor?: string;
}

interface AutoScrollConfig {
  enabled?: boolean;    // Default: true
  threshold?: number;   // Default: 50 (px from edge)
  maxSpeed?: number;    // Default: 10 (px/frame)
}
```

### Utility: `reorderArray`

Pure helper to reorder an array (also usable as a worklet):

```tsx
import { reorderArray } from 'react-native-draggable-kit';

const newArray = reorderArray(['a', 'b', 'c'], 0, 2);
// => ['b', 'c', 'a']
```

## Performance Notes

### How It Works

- All displacement animations and gesture tracking run on the **UI thread** via Reanimated worklets.
- The JS thread is only touched once per drag — when the final `onReorder` callback fires via `runOnJS`.
- Each `SortableItem` is wrapped in `React.memo`. During a drag, only the animated styles (driven by SharedValues) update — no React re-renders occur.

### Trade-offs

| Aspect | Detail |
|---|---|
| **Rendering strategy** | Uses `ScrollView` (not `FlatList`). All items are mounted simultaneously. This is correct and performant for lists up to ~200 items, which covers the vast majority of reorderable-list use cases. |
| **Very large lists (500+)** | For lists with 500+ items, consider showing a FlatList normally and switching to DraggableList only when the user enters "reorder mode". |
| **@shopify/flash-list** | Not compatible during active drag due to aggressive cell recycling. Use with normal rendering and switch to DraggableList for reorder mode. |
| **Variable heights** | Items are measured via `onLayout`. Provide `getItemLayout` to skip the measurement pass for slightly faster initial render. |

## Accessibility

### Screen Reader Support

Each item exposes accessibility actions for reordering without gestures:

- **Move Up** — Moves the item one position up
- **Move Down** — Moves the item one position down
- **Move to Top** — Moves the item to the first position
- **Move to Bottom** — Moves the item to the last position

Items announce their position (e.g., "Item 3 of 10") and pass through `accessibilityRole` and `accessibilityLabel`.

### Known Limitations

- Native drag-and-drop accessibility APIs on iOS/Android don't directly support custom reorder gestures. The "Move Up/Down" accessibility actions are the best cross-platform alternative.
- During an active drag, intermediate positions are not announced to screen readers.
- VoiceOver/TalkBack users interact through the accessibility actions, not through the drag gesture itself.

## Troubleshooting

### "Reanimated module not found"

Ensure the Reanimated Babel plugin is in your `babel.config.js` and is **listed last**:

```js
plugins: ['react-native-reanimated/plugin']
```

Then clear the Metro cache:

```bash
npx react-native start --reset-cache
```

### "Gestures are not working"

Make sure your app root is wrapped in `<GestureHandlerRootView>`:

```tsx
import { GestureHandlerRootView } from 'react-native-gesture-handler';
<GestureHandlerRootView style={{ flex: 1 }}>...</GestureHandlerRootView>
```

If `DraggableList` is inside a modal or nested navigator, you may need an additional `GestureHandlerRootView` wrapping that navigator.

### "Items don't animate smoothly"

- Ensure you're not running heavy JS-thread work during the drag.
- Check that you're not using `console.log` in `onDragging` callbacks (this runs on every frame).
- On Android, enable Hermes for better overall performance.

### Expo Support

This package works with **Expo bare workflow** and **Expo dev-client** (via `expo prebuild`). It does **not** work in Expo Go because it requires native modules (Reanimated + Gesture Handler).

## Migration from react-native-draggable-flatlist

| `react-native-draggable-flatlist` | `react-native-draggable-kit` |
|---|---|
| `<DraggableFlatList>` | `<DraggableList>` |
| `onDragEnd={({ data }) => ...}` | `onReorder={({ data }) => ...}` |
| `renderItem={({ drag, isActive })` | `renderItem={({ isDragging })` — `isDragging` is a SharedValue |
| `drag()` callback | Use `<DragHandle>` or `dragActivationMode` prop |
| `autoscrollThreshold` | `autoScroll={{ threshold: 50 }}` |
| `autoscrollSpeed` | `autoScroll={{ maxSpeed: 10 }}` |
| `activationDistance` | `dragActivationDelay` (ms-based, not distance) |
| FlatList-based | ScrollView-based (all items mounted) |

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development setup and guidelines.

## License

MIT © react-native-draggable-kit contributors
