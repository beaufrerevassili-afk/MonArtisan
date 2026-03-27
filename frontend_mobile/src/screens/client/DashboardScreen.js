import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';

export default function ClientDashboard({ navigation }) {
  const [data, setData]       = useState(null);
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    charger();
  }, []);

  async function charger(refreshing = false) {
    if (refreshing) setRefresh(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser(payload);
      }
      const { data: d } = await api.get('/dashboard/client');
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

  if (loading) return <View style={styles.loader}><ActivityIndicator size="large" color="#007AFF" /></View>;

  const resume = data?.resume || {};

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refresh} onRefresh={() => charger(true)} tintColor="#007AFF" />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Bonjour, {user?.nom?.split(' ')[0]} 👋</Text>
          <Text style={styles.subGreeting}>Que cherchez-vous aujourd'hui ?</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Sortir</Text>
        </TouchableOpacity>
      </View>

      {/* Recherche CTA */}
      <TouchableOpacity
        style={styles.searchBtn}
        onPress={() => navigation.navigate('RechercheArtisans')}
      >
        <Text style={styles.searchBtnText}>🔍  Rechercher un artisan</Text>
      </TouchableOpacity>

      {/* Nouvelle mission */}
      <TouchableOpacity
        style={styles.newMissionBtn}
        onPress={() => navigation.navigate('NouvelleMission')}
      >
        <Text style={styles.newMissionText}>+ Créer une demande de mission</Text>
      </TouchableOpacity>

      {/* Stats */}
      <Text style={styles.sectionTitle}>Mes statistiques</Text>
      <View style={styles.statsGrid}>
        <StatCard label="Missions" valeur={resume.missions_total || 0} icone="📋" />
        <StatCard label="En cours" valeur={resume.missions_en_cours || 0} icone="🔧" couleur="#34C759" />
        <StatCard label="Terminées" valeur={resume.missions_terminees || 0} icone="✅" />
        <StatCard label="Budget total" valeur={`${(resume.budget_total || 0).toLocaleString('fr-FR')}€`} icone="💰" couleur="#007AFF" />
      </View>

      {/* Missions récentes */}
      <Text style={styles.sectionTitle}>Mes missions</Text>
      {(data?.mes_missions || []).length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>Aucune mission pour l'instant</Text>
        </View>
      ) : (data.mes_missions || []).map(m => (
        <TouchableOpacity
          key={m.id}
          style={styles.missionCard}
          onPress={() => navigation.navigate('SuiviMission', { mission: m })}
        >
          <View style={styles.missionHeader}>
            <Text style={styles.missionTitre}>{m.titre}</Text>
            <Text style={styles.missionBudget}>{m.budget?.toLocaleString('fr-FR')} €</Text>
          </View>
          <Text style={styles.missionDesc} numberOfLines={1}>{m.description}</Text>
          <View style={styles.missionFooter}>
            <StatutBadge statut={m.statut} />
            <PrioriteBadge priorite={m.priorite} />
          </View>
        </TouchableOpacity>
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
  const colors = { en_attente: '#FEF3C7', assignee: '#DBEAFE', en_cours: '#D1FAE5', terminee: '#F3F4F6', annulee: '#FEE2E2' };
  const textColors = { en_attente: '#92400E', assignee: '#1E40AF', en_cours: '#065F46', terminee: '#6B7280', annulee: '#991B1B' };
  const labels = { en_attente: 'En attente', assignee: 'Assignée', en_cours: 'En cours', terminee: 'Terminée', annulee: 'Annulée' };
  return (
    <View style={{ backgroundColor: colors[statut] || '#F3F4F6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}>
      <Text style={{ fontSize: 11, fontWeight: '600', color: textColors[statut] || '#6B7280' }}>{labels[statut] || statut}</Text>
    </View>
  );
}

function PrioriteBadge({ priorite }) {
  if (!priorite || priorite === 'normale') return null;
  const colors = { urgente: '#FEE2E2', haute: '#FEF3C7', basse: '#F3F4F6' };
  const textColors = { urgente: '#991B1B', haute: '#92400E', basse: '#6B7280' };
  return (
    <View style={{ backgroundColor: colors[priorite], paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20, marginLeft: 6 }}>
      <Text style={{ fontSize: 11, fontWeight: '600', color: textColors[priorite] }}>{priorite}</Text>
    </View>
  );
}

function atob(str) {
  return Buffer.from(str, 'base64').toString('binary');
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#F5F5F5' },
  loader:          { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
  greeting:        { fontSize: 22, fontWeight: '700', color: '#1A1A2E' },
  subGreeting:     { fontSize: 13, color: '#6B7280', marginTop: 2 },
  logoutBtn:       { backgroundColor: '#FEE2E2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  logoutText:      { fontSize: 12, color: '#DC2626', fontWeight: '600' },
  searchBtn:       { backgroundColor: '#FFFFFF', margin: 16, marginBottom: 8, borderRadius: 16, paddingVertical: 16, paddingHorizontal: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  searchBtnText:   { fontSize: 15, fontWeight: '500', color: '#007AFF', textAlign: 'center' },
  newMissionBtn:   { backgroundColor: '#34C759', margin: 16, marginTop: 0, borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
  newMissionText:  { color: '#FFFFFF', fontWeight: '600', fontSize: 15 },
  sectionTitle:    { fontSize: 16, fontWeight: '700', color: '#1A1A2E', marginHorizontal: 16, marginTop: 8, marginBottom: 12 },
  statsGrid:       { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 8, marginBottom: 8 },
  statCard:        { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, width: '46%', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  statIcon:        { fontSize: 22 },
  statValeur:      { fontSize: 20, fontWeight: '700', marginTop: 4, color: '#1A1A2E' },
  statLabel:       { fontSize: 11, color: '#6B7280', marginTop: 2 },
  missionCard:     { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginHorizontal: 16, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  missionHeader:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  missionTitre:    { fontSize: 15, fontWeight: '600', color: '#1A1A2E', flex: 1 },
  missionBudget:   { fontSize: 15, fontWeight: '700', color: '#007AFF', marginLeft: 8 },
  missionDesc:     { fontSize: 12, color: '#6B7280', marginBottom: 10 },
  missionFooter:   { flexDirection: 'row', alignItems: 'center' },
  emptyCard:       { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 30, marginHorizontal: 16, alignItems: 'center' },
  emptyText:       { color: '#9CA3AF', fontSize: 14 },
});
