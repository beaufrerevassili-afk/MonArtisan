import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';

export default function PatronDashboard({ navigation }) {
  const [data, setData]       = useState(null);
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => { charger(); }, []);

  async function charger(refreshing = false) {
    if (refreshing) setRefresh(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        try {
          const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString('binary'));
          setUser(payload);
        } catch {}
      }
      const { data: d } = await api.get('/dashboard/patron');
      setData(d);
    } finally {
      setLoading(false);
      setRefresh(false);
    }
  }

  async function logout() {
    await AsyncStorage.multiRemove(['token', 'role']);
    navigation.replace('Login');
  }

  if (loading) return <View style={styles.loader}><ActivityIndicator size="large" color="#5B5BD6" /></View>;

  const resume = data?.resume_missions || {};

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refresh} onRefresh={() => charger(true)} tintColor="#5B5BD6" />}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Bonjour, {user?.nom?.split(' ')[0]} 🏢</Text>
          <Text style={styles.subGreeting}>Tableau de bord patron</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn} accessibilityRole="button" accessibilityLabel="Se déconnecter">
          <Text style={styles.logoutText}>Sortir</Text>
        </TouchableOpacity>
      </View>

      {/* Finance KPIs */}
      <View style={styles.financeCard}>
        <Text style={styles.financeCA}>{(data?.finances?.chiffre_affaire_annuel || 0).toLocaleString('fr-FR')} €</Text>
        <Text style={styles.financeLabel}>Chiffre d'affaires annuel</Text>
        <View style={styles.financeRow}>
          <View style={styles.financeStat}>
            <Text style={styles.financeStatVal}>{(data?.finances?.benefice_net || 0).toLocaleString('fr-FR')} €</Text>
            <Text style={styles.financeStatLabel}>Bénéfice net</Text>
          </View>
          <View style={styles.financeStat}>
            <Text style={styles.financeStatVal}>{(data?.finances?.tresorerie || 0).toLocaleString('fr-FR')} €</Text>
            <Text style={styles.financeStatLabel}>Trésorerie</Text>
          </View>
        </View>
      </View>

      {/* Stats missions */}
      <Text style={styles.sectionTitle}>Missions</Text>
      <View style={styles.statsGrid}>
        <StatCard label="Total"      valeur={resume.total || 0}      icone="📋" />
        <StatCard label="En attente" valeur={resume.en_attente || 0} icone="⏳" couleur="#F59E0B" />
        <StatCard label="En cours"   valeur={resume.en_cours || 0}   icone="🔧" couleur="#34C759" />
        <StatCard label="Urgentes"   valeur={resume.urgentes || 0}   icone="🚨" couleur="#EF4444" />
      </View>

      {/* Équipe */}
      <Text style={styles.sectionTitle}>Équipe</Text>
      <View style={styles.equipeCard}>
        <View style={styles.equipeItem}>
          <Text style={styles.equipeVal}>{data?.equipe?.artisans_total || 0}</Text>
          <Text style={styles.equipeLabel}>Artisans</Text>
        </View>
        <View style={styles.equipeDivider} />
        <View style={styles.equipeItem}>
          <Text style={styles.equipeVal}>{data?.equipe?.artisans_actifs || 0}</Text>
          <Text style={styles.equipeLabel}>Actifs</Text>
        </View>
        <View style={styles.equipeDivider} />
        <View style={styles.equipeItem}>
          <Text style={styles.equipeVal}>{data?.equipe?.clients_total || 0}</Text>
          <Text style={styles.equipeLabel}>Clients</Text>
        </View>
      </View>

      {/* Accès rapides */}
      <Text style={styles.sectionTitle}>Modules</Text>
      <View style={styles.modulesGrid}>
        {[
          { label: 'Missions',  icone: '📋', route: 'PatronMissions' },
          { label: 'Finance',   icone: '💰', route: null },
          { label: 'Équipe',    icone: '👥', route: null },
          { label: 'QSE',       icone: '🦺', route: null },
        ].map(m => (
          <TouchableOpacity
            key={m.label}
            style={styles.moduleCard}
            onPress={() => m.route ? navigation.navigate(m.route) : null}
            accessibilityRole="button"
            accessibilityLabel={m.label}
          >
            <Text style={styles.moduleIcon}>{m.icone}</Text>
            <Text style={styles.moduleLabel}>{m.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

function StatCard({ label, valeur, icone, couleur = '#1A1A2E' }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statIcon}>{icone}</Text>
      <Text style={[styles.statValeur, { color: couleur }]}>{valeur}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#F5F5F5' },
  loader:          { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
  greeting:        { fontSize: 22, fontWeight: '700', color: '#1A1A2E' },
  subGreeting:     { fontSize: 13, color: '#6B7280', marginTop: 2 },
  logoutBtn:       { backgroundColor: '#FEE2E2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  logoutText:      { fontSize: 12, color: '#DC2626', fontWeight: '600' },
  financeCard:     { backgroundColor: '#5B5BD6', borderRadius: 20, margin: 16, padding: 20 },
  financeCA:       { fontSize: 32, fontWeight: '700', color: '#FFFFFF' },
  financeLabel:    { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 4, marginBottom: 16 },
  financeRow:      { flexDirection: 'row', gap: 24 },
  financeStat:     {},
  financeStatVal:  { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  financeStatLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  sectionTitle:    { fontSize: 16, fontWeight: '700', color: '#1A1A2E', marginHorizontal: 16, marginTop: 8, marginBottom: 12 },
  statsGrid:       { flexDirection: 'row', paddingHorizontal: 12, gap: 8, marginBottom: 8 },
  statCard:        { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14, flex: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  statIcon:        { fontSize: 18 },
  statValeur:      { fontSize: 20, fontWeight: '700', marginTop: 4, color: '#1A1A2E' },
  statLabel:       { fontSize: 10, color: '#6B7280', marginTop: 2 },
  equipeCard:      { backgroundColor: '#FFFFFF', borderRadius: 16, marginHorizontal: 16, padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  equipeItem:      { alignItems: 'center' },
  equipeVal:       { fontSize: 28, fontWeight: '700', color: '#1A1A2E' },
  equipeLabel:     { fontSize: 11, color: '#6B7280', marginTop: 4 },
  equipeDivider:   { width: 1, height: 40, backgroundColor: '#E5E7EB' },
  modulesGrid:     { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 8 },
  moduleCard:      { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, width: '46%', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  moduleIcon:      { fontSize: 30, marginBottom: 8 },
  moduleLabel:     { fontSize: 13, fontWeight: '600', color: '#374151' },
});
