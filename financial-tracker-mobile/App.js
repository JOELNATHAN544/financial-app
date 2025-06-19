import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';

import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import DashboardScreen from './src/screens/DashboardScreen';

const Stack = createStackNavigator();

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [jwtToken, setJwtToken] = useState(null);

  const handleLogin = (token) => {
    // Store the token (we'll implement proper storage later)
    console.log('Login successful, token:', token);
    setIsAuthenticated(true);
    setJwtToken(token);
  };

  const handleLogout = () => {
    // Clear the token (we'll implement proper storage later)
    console.log('Logging out');
    setIsAuthenticated(false);
    setJwtToken(null);
  };

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {!isAuthenticated ? (
          // Auth screens
          <>
            <Stack.Screen name="Login">
              {(props) => (
                <LoginScreen {...props} onLogin={handleLogin} />
              )}
            </Stack.Screen>
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          // App screens
          <Stack.Screen name="Dashboard">
            {(props) => (
              <DashboardScreen {...props} onLogout={handleLogout} jwtToken={jwtToken} />
            )}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
