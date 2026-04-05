import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View } from 'react-native';

// Screens
import LoginScreen         from './src/screens/auth/LoginScreen';
import ClientDashboard     from './src/screens/client/DashboardScreen';
import RechercheArtisans   from './src/screens/client/RechercheArtisans';
import NouvelleeMission    from './src/screens/client/NouvelleMission';
import SuiviMission        from './src/screens/client/SuiviMission';
import PatronDashboard     from './src/screens/patron/DashboardScreen';
import PatronMissions      from './src/screens/patron/MissionsScreen';
import ArtisanDashboard    from './src/screens/artisan/DashboardScreen';
import PointageScreen      from './src/screens/artisan/PointageScreen';
import AdminDashboard      from './src/screens/admin/DashboardScreen';

const Stack = createStackNavigator();

export default function App() {
  const [token, setToken]   = useState(null);
  const [role, setRole]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.multiGet(['token', 'role']).then(([[, t], [, r]]) => {
      setToken(t);
      setRole(r);
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' }}>
      <ActivityIndicator size="large" color="#5B5BD6" />
    </View>
  );

  const getInitialRoute = () => {
    if (!token) return 'Login';
    const routes = { client: 'ClientDashboard', patron: 'PatronDashboard', artisan: 'ArtisanDashboard', super_admin: 'AdminDashboard' };
    return routes[role] || 'Login';
  };

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={getInitialRoute()}
        screenOptions={{
          headerStyle: { backgroundColor: '#FFFFFF', elevation: 0, shadowOpacity: 0 },
          headerTintColor: '#5B5BD6',
          headerTitleStyle: { fontWeight: '600', color: '#1A1A2E' },
          cardStyle: { backgroundColor: '#F5F5F5' },
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />

        {/* Client */}
        <Stack.Screen name="ClientDashboard"   component={ClientDashboard}   options={{ title: 'Accueil', headerLeft: null }} />
        <Stack.Screen name="RechercheArtisans" component={RechercheArtisans} options={{ title: 'Trouver un artisan' }} />
        <Stack.Screen name="NouvelleMission"   component={NouvelleeMission}  options={{ title: 'Nouvelle mission' }} />
        <Stack.Screen name="SuiviMission"      component={SuiviMission}      options={{ title: 'Suivi de mission' }} />

        {/* Patron */}
        <Stack.Screen name="PatronDashboard" component={PatronDashboard} options={{ title: 'Tableau de bord', headerLeft: null }} />
        <Stack.Screen name="PatronMissions"  component={PatronMissions}  options={{ title: 'Missions' }} />

        {/* Artisan salarié */}
        <Stack.Screen name="ArtisanDashboard" component={ArtisanDashboard} options={{ title: 'Mes missions', headerLeft: null }} />
        <Stack.Screen name="Pointage"         component={PointageScreen}   options={{ title: 'Pointage chantier' }} />

        {/* Admin */}
        <Stack.Screen name="AdminDashboard" component={AdminDashboard} options={{ title: 'Administration', headerLeft: null }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
