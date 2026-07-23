import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, Text } from 'react-native';

import BasicVertical from './screens/BasicVertical';
import HorizontalList from './screens/HorizontalList';
import DragHandleDemo from './screens/DragHandleDemo';
import VariableHeight from './screens/VariableHeight';
import CustomAnimations from './screens/CustomAnimations';

const Tab = createBottomTabNavigator();

/**
 * Example app demonstrating all features of react-native-draggable-kit.
 *
 * Each tab showcases a different use case:
 * 1. Basic vertical reorder
 * 2. Horizontal reorder
 * 3. Drag-handle-only mode
 * 4. Variable-height items
 * 5. Custom drag/drop animations
 */
export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: '#1a1a2e' },
            headerTintColor: '#e0e0e0',
            tabBarStyle: { backgroundColor: '#1a1a2e', borderTopColor: '#333' },
            tabBarActiveTintColor: '#6c63ff',
            tabBarInactiveTintColor: '#888',
          }}
        >
          <Tab.Screen
            name="Vertical"
            component={BasicVertical}
            options={{
              title: 'Vertical',
              tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>↕️</Text>,
            }}
          />
          <Tab.Screen
            name="Horizontal"
            component={HorizontalList}
            options={{
              title: 'Horizontal',
              tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>↔️</Text>,
            }}
          />
          <Tab.Screen
            name="Handle"
            component={DragHandleDemo}
            options={{
              title: 'Handle',
              tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>☰</Text>,
            }}
          />
          <Tab.Screen
            name="Variable"
            component={VariableHeight}
            options={{
              title: 'Variable',
              tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📏</Text>,
            }}
          />
          <Tab.Screen
            name="Custom"
            component={CustomAnimations}
            options={{
              title: 'Custom',
              tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>✨</Text>,
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
