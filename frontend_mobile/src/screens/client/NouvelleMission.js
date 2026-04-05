import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import api from '../../services/api';

const CATEGORIES = ['Plomberie', 'Électricité', 'Menuiserie', 'Carrelage', 'Peinture', 'Maçonnerie', 'Chauffage', 'Serrurerie', 'Jardinage', 'Autres'];
const URGENCES = [
  { label: 'Urgent (aujourd\'hui)', value: 'urgent' },
  { label: 'Cette semaine',          value: 'cette_semaine' },
  { label: 'Ce mois',               value: 'ce_mois' },
];
const PIECES = ['Cuisine', 'Salle de bain', 'Salon', 'Extérieur', 'Autre'];

export default function NouvelleMission({ navigation }) {
  const [form, setForm] = useState({
    titre: '', description: '', budget: '',
    categorie: 'Plomberie', urgence: 'cette_semaine', piece: 'Autre',
  });
  const [loading, setLoading] = useState(false);

  async function soumettre() {
    if (!form.titre || !form.description || !form.budget) {
      return Alert.alert('Champs manquants', 'Titre, description et budget sont obligatoires');
    }
    setLoading(true);
    try {
      await api.post('/missions', form);
      Alert.alert('Mission envoyée !', 'Votre demande a bien été créée. Les artisans disponibles vont vous contacter.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.erreur || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.subtitle}>Décrivez votre besoin en quelques mots</Text>

      {/* Titre */}
      <View style={styles.section}>
        <Text style={styles.label}>Titre *</Text>
        <TextInput style={styles.input} placeholder="Ex: Fuite d'eau sous l'évier" value={form.titre} onChangeText={v => setForm({ ...form, titre: v })} />
      </View>

      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.label}>Description *</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          placeholder="Décrivez votre problème avec le plus de détails possible..."
          value={form.description}
          onChangeText={v => setForm({ ...form, description: v })}
          multiline
          numberOfLines={4}
        />
      </View>

      {/* Catégorie */}
      <View style={styles.section}>
        <Text style={styles.label}>Catégorie de travaux</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.chipsRow}>
            {CATEGORIES.map(c => (
              <TouchableOpacity
                key={c}
                style={[styles.chip, form.categorie === c && styles.chipActive]}
                onPress={() => setForm({ ...form, categorie: c })}
              >
                <Text style={[styles.chipText, form.categorie === c && styles.chipTextActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Urgence */}
      <View style={styles.section}>
        <Text style={styles.label}>Quand ?</Text>
        <View style={styles.chipsRow}>
          {URGENCES.map(u => (
            <TouchableOpacity
              key={u.value}
              style={[styles.chip, form.urgence === u.value && styles.chipActive]}
              onPress={() => setForm({ ...form, urgence: u.value })}
            >
              <Text style={[styles.chipText, form.urgence === u.value && styles.chipTextActive]}>{u.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Pièce */}
      <View style={styles.section}>
        <Text style={styles.label}>Pièce concernée</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.chipsRow}>
            {PIECES.map(p => (
              <TouchableOpacity
                key={p}
                style={[styles.chip, form.piece === p && styles.chipActive]}
                onPress={() => setForm({ ...form, piece: p })}
              >
                <Text style={[styles.chipText, form.piece === p && styles.chipTextActive]}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Budget */}
      <View style={styles.section}>
        <Text style={styles.label}>Budget estimé (€) *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 500"
          value={form.budget}
          onChangeText={v => setForm({ ...form, budget: v })}
          keyboardType="numeric"
        />
        <Text style={styles.hint}>Votre carte ne sera débitée qu'après validation des travaux</Text>
      </View>

      <TouchableOpacity style={[styles.submitBtn, loading && styles.submitBtnDisabled]} onPress={soumettre} disabled={loading}>
        {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.submitBtnText}>Envoyer ma demande</Text>}
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#F5F5F5' },
  subtitle:       { fontSize: 14, color: '#6B7280', padding: 20, paddingBottom: 8 },
  section:        { backgroundColor: '#FFFFFF', marginHorizontal: 16, marginBottom: 12, borderRadius: 16, padding: 16 },
  label:          { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 10 },
  input:          { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, backgroundColor: '#FFFFFF' },
  textarea:       { height: 100, textAlignVertical: 'top' },
  chipsRow:       { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip:           { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, backgroundColor: '#F9FAFB' },
  chipActive:     { backgroundColor: '#5B5BD6', borderColor: '#5B5BD6' },
  chipText:       { fontSize: 13, color: '#374151' },
  chipTextActive: { color: '#FFFFFF', fontWeight: '600' },
  hint:           { fontSize: 11, color: '#9CA3AF', marginTop: 6 },
  submitBtn:      { backgroundColor: '#5B5BD6', margin: 16, borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText:  { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
});
