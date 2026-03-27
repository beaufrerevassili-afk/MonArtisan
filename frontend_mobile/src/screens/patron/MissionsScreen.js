import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, TextInput, Modal,
} from 'react-native';
import api from '../../services/api';

export default function PatronMissions({ navigation }) {
  const [missions, setMissions] = useState([]);
  const [filtre, setFiltre]     = useState('');
  const [loading, setLoading]   = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMission, setSelectedMission] = useState(null);
  const [artisanId, setArtisanId] = useState('');

  useEffect(() => { charger(); }, [filtre]);

  async function charger() {
    setLoading(true);
    try {
      const params = filtre ? { statut: filtre } : {};
      const { data } = await api.get('/missions', { params });
      setMissions(data.missions);
    } finally {
      setLoading(false);
    }
  }

  async function changerStatut(id, statut) {
    await api.put(`/missions/${id}/statut`, { statut });
    charger();
  }

  async function assigner() {
    if (!artisanId) return Alert.alert('Erreur', 'Entrez un ID d\'artisan');
    try {
      await api.put(`/missions/${selectedMission.id}/assigner`, { artisanId: parseInt(artisanId) });
      setModalVisible(false);
      setArtisanId('');
      charger();
      Alert.alert('Mission assignée !');
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.erreur || 'Erreur d\'assignation');
    }
  }

  const STATUTS = ['', 'en_attente', 'assignee', 'en_cours', 'terminee'];
  const LABELS  = { '': 'Tous', en_attente: 'Attente', assignee: 'Assignées', en_cours: 'En cours', terminee: 'Terminées' };

  return (
    <View style={styles.container}>
      {/* Filtres */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtreBar}>
        {STATUTS.map(s => (
          <TouchableOpacity
            key={s}
            style={[styles.filtreChip, filtre === s && styles.filtreChipActive]}
            onPress={() => setFiltre(s)}
          >
            <Text style={[styles.filtreText, filtre === s && styles.filtreTextActive]}>{LABELS[s]}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.loader}><ActivityIndicator color="#007AFF" /></View>
      ) : (
        <ScrollView style={styles.list}>
          {missions.length === 0 ? (
            <View style={styles.empty}><Text style={styles.emptyText}>Aucune mission</Text></View>
          ) : missions.map(m => (
            <View key={m.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitre}>{m.titre}</Text>
                <PrioriteBadge priorite={m.priorite} />
              </View>
              <Text style={styles.cardDesc} numberOfLines={2}>{m.description}</Text>
              <View style={styles.cardMeta}>
                <Text style={styles.cardBudget}>{m.budget?.toLocaleString('fr-FR')} €</Text>
                <StatutBadge statut={m.statut} />
              </View>

              <View style={styles.actionsRow}>
                {m.statut === 'en_attente' && (
                  <TouchableOpacity
                    style={styles.assignerBtn}
                    onPress={() => { setSelectedMission(m); setModalVisible(true); }}
                  >
                    <Text style={styles.assignerBtnText}>Assigner un artisan</Text>
                  </TouchableOpacity>
                )}
                {m.statut === 'assignee' && (
                  <TouchableOpacity style={styles.demarrerBtn} onPress={() => changerStatut(m.id, 'en_cours')}>
                    <Text style={styles.demarrerBtnText}>Démarrer</Text>
                  </TouchableOpacity>
                )}
                {m.statut === 'en_cours' && (
                  <TouchableOpacity style={styles.terminerBtn} onPress={() => changerStatut(m.id, 'terminee')}>
                    <Text style={styles.terminerBtnText}>Terminer</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
          <View style={{ height: 30 }} />
        </ScrollView>
      )}

      {/* Modal assignation */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Assigner un artisan</Text>
            <Text style={styles.modalMission}>{selectedMission?.titre}</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="ID de l'artisan (ex: 3)"
              value={artisanId}
              onChangeText={setArtisanId}
              keyboardType="numeric"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCancelBtn}>
                <Text style={styles.modalCancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={assigner} style={styles.modalConfirmBtn}>
                <Text style={styles.modalConfirmText}>Assigner</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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

function PrioriteBadge({ priorite }) {
  if (!priorite || priorite === 'normale') return null;
  const colors = { urgente: '#FEE2E2', haute: '#FEF3C7' };
  const text   = { urgente: '#991B1B', haute: '#92400E' };
  return <View style={{ backgroundColor: colors[priorite] || '#F3F4F6', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 }}><Text style={{ fontSize: 10, fontWeight: '600', color: text[priorite] || '#6B7280' }}>{priorite}</Text></View>;
}

const styles = StyleSheet.create({
  container:          { flex: 1, backgroundColor: '#F5F5F5' },
  filtreBar:          { backgroundColor: '#FFFFFF', paddingVertical: 12, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', maxHeight: 60 },
  filtreChip:         { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, marginRight: 8, backgroundColor: '#F9FAFB' },
  filtreChipActive:   { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  filtreText:         { fontSize: 13, color: '#374151' },
  filtreTextActive:   { color: '#FFFFFF', fontWeight: '600' },
  loader:             { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 60 },
  list:               { flex: 1 },
  empty:              { alignItems: 'center', marginTop: 60 },
  emptyText:          { color: '#9CA3AF', fontSize: 14 },
  card:               { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginHorizontal: 16, marginTop: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  cardHeader:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  cardTitre:          { fontSize: 15, fontWeight: '600', color: '#1A1A2E', flex: 1, marginRight: 8 },
  cardDesc:           { fontSize: 12, color: '#6B7280', marginBottom: 10, lineHeight: 18 },
  cardMeta:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardBudget:         { fontSize: 16, fontWeight: '700', color: '#007AFF' },
  actionsRow:         { gap: 8 },
  assignerBtn:        { backgroundColor: '#007AFF', borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
  assignerBtnText:    { color: '#FFFFFF', fontWeight: '600', fontSize: 13 },
  demarrerBtn:        { backgroundColor: '#34C759', borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
  demarrerBtnText:    { color: '#FFFFFF', fontWeight: '600', fontSize: 13 },
  terminerBtn:        { backgroundColor: '#6B7280', borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
  terminerBtnText:    { color: '#FFFFFF', fontWeight: '600', fontSize: 13 },
  modalOverlay:       { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent:       { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalTitle:         { fontSize: 18, fontWeight: '700', color: '#1A1A2E', marginBottom: 4 },
  modalMission:       { fontSize: 13, color: '#6B7280', marginBottom: 16 },
  modalInput:         { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, marginBottom: 16 },
  modalActions:       { flexDirection: 'row', gap: 12 },
  modalCancelBtn:     { flex: 1, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  modalCancelText:    { color: '#6B7280', fontWeight: '600' },
  modalConfirmBtn:    { flex: 1, backgroundColor: '#007AFF', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  modalConfirmText:   { color: '#FFFFFF', fontWeight: '600' },
});
