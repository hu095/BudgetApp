import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, Button, StyleSheet } from 'react-native';

// --- screens 資料夾裡的頁面匯入 ---
import LoginScreen from './screens/LoginScreen';
import AccountOverviewScreen from './screens/AccountOverviewScreen';
import AddTransactionScreen from './screens/AddTransactionScreen';
import GroupScreen from './screens/GroupScreen';
import SplitExpenseScreen from './screens/SplitExpenseScreen';
import ReportScreen from './screens/ReportScreen';
import NotificationScreen from './screens/NotificationScreen';

// --- Bottom Tabs 設定 ---
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="帳戶總覽" component={AccountOverviewScreen} />
      <Tab.Screen name="新增收支" component={AddTransactionScreen} />
      <Tab.Screen name="分帳群組" component={GroupScreen} />
      <Tab.Screen name="分帳頁" component={SplitExpenseScreen} />
      <Tab.Screen name="月結報表" component={ReportScreen} />
      <Tab.Screen name="通知" component={NotificationScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
