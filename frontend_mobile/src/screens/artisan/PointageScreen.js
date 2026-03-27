import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import api from '../../services/api';

export default function PointageScreen({ route, navigation }) {
  const { mission } = route.params || {};
  const [pointage, setPointage] = useState(null);
  const [heure, setHeure] = useState(null);

  async function arriver() {
    const now = new Date();
    setHeure(now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
    setPointage('arrive');
    if (mission?.id) {
      await api.put(`/missions/${mission.id}/statut`, { statut: 'en_cours' });
    }
    Alert.alert('Arrivée enregistrée ✅', `Heure d'arrivée : ${now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`);
  }

  async function quitter() {
    const now = new Date();
    setHeure(now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
    setPointage('quitte');
    if (mission?.id) {
      await api.put(`/missions/${mission.id}/statut`, { statut: 'terminee' });
    }
    Alert.alert('Départ enregistré ✅', `Heure de départ : ${now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`);
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.titre}>{mission?.titre || 'Chantier'}</Text>
        <Text style={styles.adresse}>{mission?.description || 'Adresse du chantier'}</Text>

        {heure && (
          <View style={styles.heureContainer}>
            <Text style={styles.heureLabel}>{pointage === 'arrive' ? 'Heure d\'arrivée' : 'Heure de départ'}</Text>
            <Text style={styles.heure}>{heure}</Text>
          </View>
        )}
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.btn, styles.arriverBtn, pointage !== null && styles.btnDisabled]}
          onPress={arriver}
          disabled={pointage !== null}
        >
          <Text style={styles.btnIcon}>📍</Text>
          <Text style={styles.btnText}>Arriver sur chantier</Text>
          <Text style={styles.btnSub}>Géolocalisation automatique</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.quitterBtn, pointage !== 'arrive' && styles.btnDisabled]}
          onPress={quitter}
          disabled={pointage !== 'arrive'}
        >
          <Text style={styles.btnIcon}>🏁</Text>
          <Text style={styles.btnText}>Quitter le chantier</Text>
          <Text style={styles.btnSub}>Enregistrer la fin</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#F5F5F5', padding: 20 },
  card:             { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  titre:            { fontSize: 18, fontWeight: '700', color: '#1A1A2E' },
  adresse:          { fontSize: 13, color: '#6B7280', marginTop: 4 },
  heureContainer:   { backgroundColor: '#F0FDF4', borderRadius: 12, padding: 14, marginTop: 16, alignItems: 'center' },
  heureLabel:       { fontSize: 12, color: '#16A34A' },
  heure:            { fontSize: 28, fontWeight: '700', color: '#16A34A', marginTop: 4 },
  buttonsContainer: { gap: 16 },
  btn:              { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 24, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 4 },
  arriverBtn:       { backgroundColor: '#34C759' },
  quitterBtn:       { backgroundColor: '#FF9500' },
  btnDisabled:      { opacity: 0.4 },
  btnIcon:          { fontSize: 40, marginBottom: 10 },
  btnText:          { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  btnSub:           { fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
});
