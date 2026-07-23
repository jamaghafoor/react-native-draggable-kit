/**
 * Jest setup file.
 *
 * Mocks react-native-reanimated for testing environments where
 * native modules are not available.
 */

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  Reanimated.useFrameCallback = () => ({ isActive: false, setActive: jest.fn() });
  return Reanimated;
});

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native').View;
  return {
    GestureHandlerRootView: View,
    GestureDetector: ({ children }: { children: React.ReactNode }) => children,
    Gesture: {
      Pan: () => ({
        enabled: () => ({
          onStart: () => ({
            onUpdate: () => ({
              onEnd: () => ({
                onFinalize: () => ({
                  minDistance: () => ({
                    simultaneousWithExternalGesture: () => ({
                      activateAfterLongPress: () => ({}),
                    }),
                  }),
                }),
              }),
            }),
          }),
        }),
      }),
      Native: () => ({
        onStart: () => ({
          onEnd: () => ({}),
        }),
      }),
      Simultaneous: (..._gestures: unknown[]) => ({}),
      Race: (..._gestures: unknown[]) => ({}),
      Exclusive: (..._gestures: unknown[]) => ({}),
    },
    Directions: {},
    State: {
      UNDETERMINED: 0,
      FAILED: 1,
      BEGAN: 2,
      CANCELLED: 3,
      ACTIVE: 4,
      END: 5,
    },
  };
});

// Silence React Native warnings in test output
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
