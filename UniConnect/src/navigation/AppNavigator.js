import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import FeedScreen from '../screens/FeedScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ChatRoomScreen from '../screens/ChatRoomScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import UserPublicProfileScreen from '../screens/UserPublicProfileScreen';
import SearchScreen from '../screens/SearchScreen';

import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

const AuthStack = createStackNavigator();
const AppStack = createStackNavigator();
const Tab = createBottomTabNavigator();
const ChatStack = createStackNavigator();

function ChatsStackScreen() {
  return (
    <ChatStack.Navigator screenOptions={{ headerShown: false }}>
      <ChatStack.Screen name="DashboardMain" component={DashboardScreen} />
      <ChatStack.Screen name="ChatRoom" component={ChatRoomScreen} />
    </ChatStack.Navigator>
  );
}

function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#111' },
        tabBarActiveTintColor: '#5de07a',
        tabBarInactiveTintColor: '#888',
      }}
    >
      <Tab.Screen
        name="Feed"
        component={FeedScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="newspaper" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Chats"
        component={ChatsStackScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-sharp" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function AuthStackScreen() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

function AppStackScreen() {
  return (
    <AppStack.Navigator screenOptions={{ headerShown: false }}>
      <AppStack.Screen name="AppTabs" component={AppTabs} />
      <AppStack.Screen name="UserPublicProfile" component={UserPublicProfileScreen} />
    </AppStack.Navigator>
  );
}

export default function AppNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    // You can return a splash screen or loading indicator here
    return null;
  }

  return (
    <NavigationContainer>
      {user ? <AppStackScreen /> : <AuthStackScreen />}
    </NavigationContainer>
  );
}
