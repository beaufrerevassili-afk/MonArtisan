import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';

export default function ArtisanDashboard({ navigation }) {
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
          const parts = token.split('.');
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('binary'));
          setUser(payload);
        } catch {}
      }
      const { data: d } = await api.get('/dashboard/artisan');
      setData(d);
    } finally {
      setLoading(false);
      setRefresh(false);
    }
  }

  async function pointer(missionId, action) {
    try {
      const statut = action === 'arriver' ? 'en_cours' : 'terminee';
      await api.put(`/missions/${missionId}/statut`, { statut });
      Alert.alert(action === 'arriver' ? 'Arrivée enregistrée' : 'Départ enregistré', 'Pointage effectué avec succès');
      charger();
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.erreur || 'Erreur de pointage');
    }
  }

  async function logout() {
    await AsyncStorage.multiRemove(['token', 'role']);
    navigation.replace('Login');
  }

  if (loading) return <View style={styles.loader}><ActivityIndicator size="large" color="#5B5BD6" /></View>;

  const resume = data?.resume || {};

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refresh} onRefresh={() => charger(true)} tintColor="#5B5BD6" />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Bonjour, {user?.nom?.split(' ')[0]} 👷</Text>
          <Text style={styles.subGreeting}>Vos missions d'aujourd'hui</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn} accessibilityRole="button" accessibilityLabel="Se déconnecter">
          <Text style={styles.logoutText}>Sortir</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <StatCard label="Assignées" valeur={resume.missions_assignees || 0} icone="📋" />
        <StatCard label="En cours" valeur={resume.missions_en_cours || 0} icone="🔧" couleur="#34C759" />
        <StatCard label="Terminées" valeur={resume.missions_terminees || 0} icone="✅" />
      </View>

      {/* Missions */}
      <Text style={styles.sectionTitle}>Mes missions</Text>
      {(data?.mes_missions || []).length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>Aucune mission assignée</Text>
        </View>
      ) : (data.mes_missions || []).map(m => (
        <View key={m.id} style={styles.missionCard}>
          <View style={styles.missionHeader}>
            <Text style={styles.missionTitre}>{m.titre}</Text>
            <StatutBadge statut={m.statut} />
          </View>
          <Text style={styles.missionDesc} numberOfLines={2}>{m.description}</Text>
          {m.dateDebut && (
            <Text style={styles.missionDate}>📅 {m.dateDebut}</Text>
          )}
          <Text style={styles.missionBudget}>{m.budget?.toLocaleString('fr-FR')} €</Text>

          {/* Boutons pointage */}
          <View style={styles.actionsRow}>
            {m.statut === 'assignee' && (
              <TouchableOpacity
                style={styles.arriverBtn}
                onPress={() => pointer(m.id, 'arriver')}
                accessibilityRole="button"
                accessibilityLabel="Arriver sur le chantier"
              >
                <Text style={styles.arriverBtnText}>📍 Arriver sur chantier</Text>
              </TouchableOpacity>
            )}
            {m.statut === 'en_cours' && (
              <TouchableOpacity
                style={styles.quitterBtn}
                onPress={() => pointer(m.id, 'quitter')}
                accessibilityRole="button"
                accessibilityLabel="Quitter le chantier"
              >
                <Text style={styles.quitterBtnText}>🏁 Quitter le chantier</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      ))}

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

function StatCard({ label, valeur, icone, couleur = '#6B7280' }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statIcon}>{icone}</Text>
      <Text style={[styles.statValeur, { color: couleur }]}>{valeur}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function StatutBadge({ statut }) {
  const colors = { en_attente: '#FEF3C7', assignee: '#DBEAFE', en_cours: '#D1FAE5', terminee: '#F3F4F6' };
  const textColors = { en_attente: '#92400E', assignee: '#1E40AF', en_cours: '#065F46', terminee: '#6B7280' };
  const labels = { en_attente: 'En attente', assignee: 'Assignée', en_cours: 'En cours', terminee: 'Terminée' };
  return (
    <View style={{ backgroundColor: colors[statut] || '#F3F4F6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}>
      <Text style={{ fontSize: 11, fontWeight: '600', color: textColors[statut] || '#6B7280' }}>{labels[statut] || statut}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#F5F5F5' },
  loader:       { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
  greeting:     { fontSize: 22, fontWeight: '700', color: '#1A1A2E' },
  subGreeting:  { fontSize: 13, color: '#6B7280', marginTop: 2 },
  logoutBtn:    { backgroundColor: '#FEE2E2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  logoutText:   { fontSize: 12, color: '#DC2626', fontWeight: '600' },
  statsRow:     { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 8 },
  statCard:     { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14, flex: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  statIcon:     { fontSize: 20 },
  statValeur:   { fontSize: 22, fontWeight: '700', color: '#1A1A2E', marginTop: 4 },
  statLabel:    { fontSize: 11, color: '#6B7280', marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A2E', marginHorizontal: 16, marginTop: 8, marginBottom: 12 },
  missionCard:  { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginHorizontal: 16, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  missionHeader:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  missionTitre: { fontSize: 15, fontWeight: '600', color: '#1A1A2E', flex: 1, marginRight: 8 },
  missionDesc:  { fontSize: 12, color: '#6B7280', lineHeight: 18, marginBottom: 8 },
  missionDate:  { fontSize: 12, color: '#6B7280', marginBottom: 4 },
  missionBudget:{ fontSize: 16, fontWeight: '700', color: '#5B5BD6', marginBottom: 12 },
  actionsRow:   { gap: 8 },
  arriverBtn:   { backgroundColor: '#34C759', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  arriverBtnText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },
  quitterBtn:   { backgroundColor: '#FF9500', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  quitterBtnText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },
  emptyCard:    { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 30, marginHorizontal: 16, alignItems: 'center' },
  emptyText:    { color: '#9CA3AF', fontSize: 14 },
});
