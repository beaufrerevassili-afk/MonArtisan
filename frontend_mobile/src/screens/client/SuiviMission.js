import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import api from '../../services/api';

const ETAPES = [
  { statut: 'en_attente', label: 'Demande envoyée',   icone: '📤' },
  { statut: 'assignee',   label: 'Artisan assigné',   icone: '👷' },
  { statut: 'en_cours',   label: 'Travaux en cours',  icone: '🔧' },
  { statut: 'terminee',   label: 'Mission terminée',  icone: '✅' },
];

export default function SuiviMission({ route, navigation }) {
  const { mission } = route.params;

  const etapeActuelle = ETAPES.findIndex(e => e.statut === mission.statut);

  async function annuler() {
    Alert.alert(
      'Annuler la mission ?',
      'Cette action est irréversible.',
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Oui, annuler',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.put(`/missions/${mission.id}/statut`, { statut: 'annulee' });
              navigation.goBack();
            } catch (err) {
              Alert.alert('Erreur', err.response?.data?.erreur || 'Impossible d\'annuler');
            }
          },
        },
      ]
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Infos mission */}
      <View style={styles.card}>
        <Text style={styles.titre}>{mission.titre}</Text>
        <Text style={styles.desc}>{mission.description}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.budget}>{mission.budget?.toLocaleString('fr-FR')} €</Text>
          <Text style={styles.categorie}>{mission.categorie || 'N/A'}</Text>
        </View>
      </View>

      {/* Barre de progression */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Progression</Text>
        {ETAPES.map((e, i) => {
          const fait  = i <= etapeActuelle;
          const actif = i === etapeActuelle;
          return (
            <View key={e.statut} style={styles.etapeRow}>
              <View style={[styles.etapePoint, fait ? styles.etapePointFait : styles.etapePointVide, actif && styles.etapePointActif]}>
                {fait && <Text style={styles.etapeCheck}>{i < etapeActuelle ? '✓' : e.icone}</Text>}
              </View>
              {i < ETAPES.length - 1 && <View style={[styles.etapeLine, fait && i < etapeActuelle && styles.etapeLineFait]} />}
              <View style={styles.etapeInfo}>
                <Text style={[styles.etapeLabel, actif && styles.etapeLabelActif]}>{e.label}</Text>
                {actif && <Text style={styles.etapeEtat}>En cours</Text>}
              </View>
            </View>
          );
        })}
      </View>

      {/* Notifications info */}
      <View style={[styles.card, styles.notifCard]}>
        <Text style={styles.notifText}>Vous recevrez des notifications à chaque étape : arrivée de l'artisan, devis, fin des travaux.</Text>
      </View>

      {/* Actions */}
      {mission.statut === 'en_attente' && (
        <TouchableOpacity style={styles.annulerBtn} onPress={annuler}>
          <Text style={styles.annulerBtnText}>Annuler la mission</Text>
        </TouchableOpacity>
      )}

      {mission.statut === 'terminee' && (
        <View style={styles.noteContainer}>
          <Text style={styles.noteTitle}>Notez votre artisan</Text>
          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map(s => (
              <TouchableOpacity key={s} onPress={() => Alert.alert(`Note : ${s}/5 ⭐`, 'Merci pour votre avis !')}>
                <Text style={styles.star}>⭐</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.litigeBtn} onPress={() => Alert.alert('Ouvrir un litige', 'Fonctionnalité disponible dans la version complète.')}>
            <Text style={styles.litigeBtnText}>Ouvrir un litige</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:         { flex: 1, backgroundColor: '#F5F5F5' },
  card:              { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, margin: 16, marginBottom: 0, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  titre:             { fontSize: 18, fontWeight: '700', color: '#1A1A2E', marginBottom: 6 },
  desc:              { fontSize: 13, color: '#6B7280', lineHeight: 20 },
  metaRow:           { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  budget:            { fontSize: 18, fontWeight: '700', color: '#007AFF' },
  categorie:         { fontSize: 13, color: '#6B7280', alignSelf: 'center' },
  sectionTitle:      { fontSize: 15, fontWeight: '600', color: '#1A1A2E', marginBottom: 16 },
  etapeRow:          { flexDirection: 'row', marginBottom: 8 },
  etapePoint:        { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  etapePointVide:    { backgroundColor: '#F3F4F6', borderWidth: 2, borderColor: '#E5E7EB' },
  etapePointFait:    { backgroundColor: '#007AFF' },
  etapePointActif:   { backgroundColor: '#34C759' },
  etapeCheck:        { fontSize: 14, color: '#FFFFFF' },
  etapeLine:         { position: 'absolute', left: 15, top: 34, width: 2, height: 20, backgroundColor: '#E5E7EB' },
  etapeLineFait:     { backgroundColor: '#007AFF' },
  etapeInfo:         { justifyContent: 'center' },
  etapeLabel:        { fontSize: 14, color: '#6B7280' },
  etapeLabelActif:   { fontWeight: '600', color: '#1A1A2E' },
  etapeEtat:         { fontSize: 11, color: '#34C759', fontWeight: '500', marginTop: 2 },
  notifCard:         { backgroundColor: '#EFF6FF', marginTop: 12 },
  notifText:         { fontSize: 12, color: '#3B82F6', lineHeight: 18 },
  annulerBtn:        { margin: 16, borderWidth: 1, borderColor: '#EF4444', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  annulerBtnText:    { color: '#EF4444', fontWeight: '600', fontSize: 14 },
  noteContainer:     { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, margin: 16, marginBottom: 0 },
  noteTitle:         { fontSize: 15, fontWeight: '600', color: '#1A1A2E', marginBottom: 12 },
  stars:             { flexDirection: 'row', gap: 8 },
  star:              { fontSize: 32 },
  litigeBtn:         { marginTop: 16, borderWidth: 1, borderColor: '#F59E0B', borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
  litigeBtnText:     { color: '#F59E0B', fontWeight: '600', fontSize: 13 },
});
