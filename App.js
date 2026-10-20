import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from './src/utils';
import CourseListScreen from './src/screens/CourseListScreen';
import CourseDetailScreen from './src/screens/CourseDetailScreen';
import CourseFormScreen from './src/screens/CourseFormScreen';
import CategoryScreen from './src/screens/CategoryScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="CourseList"
          screenOptions={{
            headerStyle: { backgroundColor: colors.primary },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: 'bold' },
          }}>
          <Stack.Screen name="CourseList" component={CourseListScreen} options={{ title: 'Khóa học' }} />
          <Stack.Screen name="CourseDetail" component={CourseDetailScreen} options={{ title: 'Chi tiết khóa học' }} />
          <Stack.Screen name="CourseForm" component={CourseFormScreen} options={{ title: 'Thêm khóa học' }} />
          <Stack.Screen name="Category" component={CategoryScreen} options={{ title: 'Quản lý danh mục' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}