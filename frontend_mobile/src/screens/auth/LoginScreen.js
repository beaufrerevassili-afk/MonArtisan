import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, KeyboardAvoidingView,
  Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';

const COMPTES_DEMO = [
  { label: 'Client',  email: 'client@demo.com',  mdp: 'client123'  },
  { label: 'Patron',  email: 'patron@demo.com',  mdp: 'patron123'  },
  { label: 'Artisan', email: 'artisan@demo.com', mdp: 'artisan123' },
  { label: 'Admin',   email: 'admin@demo.com',   mdp: 'admin123'   },
];

const ROUTES = {
  client:      'ClientDashboard',
  patron:      'PatronDashboard',
  artisan:     'ArtisanDashboard',
  super_admin: 'AdminDashboard',
};

export default function LoginScreen({ navigation }) {
  const [email, setEmail]       = useState('');
  const [mdp, setMdp]           = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleLogin() {
    if (!email || !mdp) return Alert.alert('Erreur', 'Email et mot de passe requis');
    setLoading(true);
    try {
      const { data } = await api.post('/login', { email, motdepasse: mdp });
      await AsyncStorage.multiSet([['token', data.token], ['role', data.role]]);
      navigation.replace(ROUTES[data.role] || 'Login');
    } catch (err) {
      Alert.alert('Connexion échouée', err.response?.data?.erreur || 'Identifiants incorrects');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>Artisans</Text>
          <Text style={styles.subtitle}>Trouvez le bon artisan en 2 clics</Text>
        </View>

        {/* Formulaire */}
        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="votre@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            accessibilityLabel="Adresse email"
            accessibilityHint="Entrez votre adresse email"
          />

          <Text style={[styles.label, { marginTop: 16 }]}>Mot de passe</Text>
          <TextInput
            style={styles.input}
            value={mdp}
            onChangeText={setMdp}
            placeholder="••••••••"
            secureTextEntry
            accessibilityLabel="Mot de passe"
            accessibilityHint="Entrez votre mot de passe"
          />

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="Se connecter"
          >
            {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.btnText}>Se connecter</Text>}
          </TouchableOpacity>
        </View>

        {/* Comptes démo */}
        <View style={styles.demoContainer}>
          <Text style={styles.demoTitle}>Comptes de démonstration</Text>
          <View style={styles.demoGrid}>
            {COMPTES_DEMO.map(c => (
              <TouchableOpacity
                key={c.email}
                style={styles.demoBtn}
                onPress={() => { setEmail(c.email); setMdp(c.mdp); }}
                accessibilityRole="button"
                accessibilityLabel={`Se connecter en tant que ${c.label}`}
              >
                <Text style={styles.demoBtnLabel}>{c.label}</Text>
                <Text style={styles.demoBtnEmail}>{c.email}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#F5F5F5' },
  scroll:          { flexGrow: 1, justifyContent: 'center', padding: 20 },
  logoContainer:   { alignItems: 'center', marginBottom: 40 },
  logo:            { fontSize: 36, fontWeight: '700', color: '#5B5BD6' },
  subtitle:        { fontSize: 14, color: '#6B7280', marginTop: 6 },
  form:            { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  label:           { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 6 },
  input:           { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, backgroundColor: '#FFFFFF' },
  btn:             { backgroundColor: '#5B5BD6', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 20 },
  btnDisabled:     { opacity: 0.6 },
  btnText:         { color: '#FFFFFF', fontWeight: '600', fontSize: 15 },
  demoContainer:   { marginTop: 24, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  demoTitle:       { fontSize: 12, fontWeight: '600', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  demoGrid:        { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  demoBtn:         { backgroundColor: '#F9FAFB', borderRadius: 10, padding: 10, width: '47%' },
  demoBtnLabel:    { fontSize: 12, fontWeight: '600', color: '#374151' },
  demoBtnEmail:    { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
});
