import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';

export default function AdminDashboard({ navigation }) {
  const [data, setData]       = useState(null);
  const [enAttente, setEnAttente] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => { charger(); }, []);

  async function charger(refreshing = false) {
    if (refreshing) setRefresh(true);
    try {
      const [dash, att] = await Promise.all([
        api.get('/dashboard/admin'),
        api.get('/admin/artisans-en-attente'),
      ]);
      setData(dash.data);
      setEnAttente(att.data.artisans);
    } finally {
      setLoading(false);
      setRefresh(false);
    }
  }

  async function valider(id, decision) {
    try {
      await api.put(`/admin/valider-artisan/${id}`, { decision });
      charger();
      Alert.alert('Succès', `Compte ${decision === 'valide' ? 'validé' : 'rejeté'}`);
    } catch {}
  }

  async function logout() {
    await AsyncStorage.multiRemove(['token', 'role']);
    navigation.replace('Login');
  }

  if (loading) return <View style={styles.loader}><ActivityIndicator size="large" color="#007AFF" /></View>;

  const stats = data?.statistiques_globales || {};

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refresh} onRefresh={() => charger(true)} tintColor="#007AFF" />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Administration</Text>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Sortir</Text>
        </TouchableOpacity>
      </View>

      {/* Stats globales */}
      <View style={styles.statsGrid}>
        <StatCard label="Utilisateurs" valeur={stats.utilisateurs_total || 0}          icone="👤" />
        <StatCard label="Clients"      valeur={stats.par_role?.clients || 0}            icone="🙋" />
        <StatCard label="Artisans"     valeur={stats.par_role?.artisans || 0}           icone="🔧" />
        <StatCard label="Missions"     valeur={stats.missions_total || 0}              icone="📋" />
      </View>

      {/* Artisans en attente */}
      {enAttente.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Comptes en attente</Text>
            <View style={styles.badge}><Text style={styles.badgeText}>{enAttente.length}</Text></View>
          </View>
          {enAttente.map(u => (
            <View key={u.id} style={styles.pendingCard}>
              <View>
                <Text style={styles.pendingNom}>{u.nom}</Text>
                <Text style={styles.pendingEmail}>{u.email}</Text>
                <Text style={styles.pendingRole}>{u.role}</Text>
              </View>
              <View style={styles.pendingActions}>
                <TouchableOpacity style={styles.validerBtn} onPress={() => valider(u.id, 'valide')}>
                  <Text style={styles.validerBtnText}>Valider</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.rejeterBtn} onPress={() => valider(u.id, 'rejete')}>
                  <Text style={styles.rejeterBtnText}>Rejeter</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </>
      )}

      {enAttente.length === 0 && (
        <View style={styles.allGoodCard}>
          <Text style={styles.allGoodText}>✅ Aucun compte en attente de validation</Text>
        </View>
      )}

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

function StatCard({ label, valeur, icone }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statIcon}>{icone}</Text>
      <Text style={styles.statValeur}>{valeur}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#F5F5F5' },
  loader:           { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
  title:            { fontSize: 22, fontWeight: '700', color: '#1A1A2E' },
  logoutBtn:        { backgroundColor: '#FEE2E2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  logoutText:       { fontSize: 12, color: '#DC2626', fontWeight: '600' },
  statsGrid:        { flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 8 },
  statCard:         { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, width: '47%', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  statIcon:         { fontSize: 24 },
  statValeur:       { fontSize: 24, fontWeight: '700', color: '#1A1A2E', marginTop: 6 },
  statLabel:        { fontSize: 12, color: '#6B7280', marginTop: 2 },
  sectionHeader:    { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 16, marginTop: 8, marginBottom: 12 },
  sectionTitle:     { fontSize: 16, fontWeight: '700', color: '#1A1A2E' },
  badge:            { backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  badgeText:        { fontSize: 12, fontWeight: '700', color: '#92400E' },
  pendingCard:      { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginHorizontal: 16, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  pendingNom:       { fontSize: 14, fontWeight: '600', color: '#1A1A2E' },
  pendingEmail:     { fontSize: 12, color: '#6B7280', marginTop: 2 },
  pendingRole:      { fontSize: 11, color: '#9CA3AF', marginTop: 2, textTransform: 'capitalize' },
  pendingActions:   { gap: 8 },
  validerBtn:       { backgroundColor: '#D1FAE5', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10 },
  validerBtnText:   { color: '#065F46', fontWeight: '600', fontSize: 12 },
  rejeterBtn:       { backgroundColor: '#FEE2E2', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10 },
  rejeterBtnText:   { color: '#991B1B', fontWeight: '600', fontSize: 12 },
  allGoodCard:      { backgroundColor: '#F0FDF4', borderRadius: 16, padding: 20, margin: 16, alignItems: 'center' },
  allGoodText:      { color: '#16A34A', fontSize: 14, fontWeight: '500' },
});
