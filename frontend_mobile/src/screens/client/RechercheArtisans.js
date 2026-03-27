import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, TextInput, ActivityIndicator,
} from 'react-native';
import api from '../../services/api';

const CATEGORIES = ['Tous', 'Plomberie', 'Électricité', 'Menuiserie', 'Carrelage', 'Peinture', 'Maçonnerie', 'Chauffage', 'Serrurerie', 'Jardinage'];

export default function RechercheArtisans({ navigation }) {
  const [artisans, setArtisans] = useState([]);
  const [categorie, setCategorie] = useState('Tous');
  const [seulement_dispo, setSeulementDispo] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => { chercher(); }, [categorie, seulement_dispo]);

  async function chercher() {
    setLoading(true);
    try {
      const params = {};
      if (categorie !== 'Tous') params.categorie = categorie;
      if (seulement_dispo) params.disponible = true;
      const { data } = await api.get('/client/artisans', { params });
      setArtisans(data.artisans);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      {/* Filtres catégories */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catBar}>
        {CATEGORIES.map(c => (
          <TouchableOpacity
            key={c}
            style={[styles.catChip, categorie === c && styles.catChipActive]}
            onPress={() => setCategorie(c)}
          >
            <Text style={[styles.catChipText, categorie === c && styles.catChipTextActive]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Filtre disponibilité */}
      <TouchableOpacity
        style={styles.dispoToggle}
        onPress={() => setSeulementDispo(!seulement_dispo)}
      >
        <View style={[styles.toggle, seulement_dispo && styles.toggleActive]}>
          <View style={[styles.toggleThumb, seulement_dispo && styles.toggleThumbActive]} />
        </View>
        <Text style={styles.dispoText}>Disponibles uniquement</Text>
      </TouchableOpacity>

      {loading ? (
        <View style={styles.loader}><ActivityIndicator color="#007AFF" /></View>
      ) : (
        <ScrollView style={styles.list}>
          {artisans.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Aucun artisan trouvé</Text>
            </View>
          ) : artisans.map(a => (
            <View key={a.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{a.nom?.charAt(0)}</Text>
                </View>
                <View style={styles.cardInfo}>
                  <View style={styles.cardNameRow}>
                    <Text style={styles.cardName}>{a.nom}</Text>
                    {a.verified && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>Vérifié</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.cardSpecialite}>{a.specialite}</Text>
                  <View style={styles.cardMeta}>
                    <Text style={styles.stars}>{'★'.repeat(Math.round(a.note || 0))}</Text>
                    <Text style={styles.metaText}> {a.note} ({a.nbAvis} avis) • {a.distance}km • {a.prixHeure}€/h</Text>
                  </View>
                </View>
                <View style={[styles.dispoIndicator, a.disponible ? styles.dispoDot : styles.occupeDot]} />
              </View>

              {a.certifications?.length > 0 && (
                <View style={styles.certifs}>
                  {a.certifications.map(c => (
                    <View key={c} style={styles.certifBadge}>
                      <Text style={styles.certifText}>{c}</Text>
                    </View>
                  ))}
                </View>
              )}

              <TouchableOpacity
                style={[styles.contactBtn, !a.disponible && styles.contactBtnDisabled]}
                disabled={!a.disponible}
                onPress={() => navigation.navigate('NouvelleMission')}
              >
                <Text style={[styles.contactBtnText, !a.disponible && styles.contactBtnTextDisabled]}>
                  {a.disponible ? 'Contacter' : 'Indisponible'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
          <View style={{ height: 30 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:            { flex: 1, backgroundColor: '#F5F5F5' },
  catBar:               { backgroundColor: '#FFFFFF', paddingVertical: 12, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', maxHeight: 60 },
  catChip:              { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, marginRight: 8, backgroundColor: '#F9FAFB' },
  catChipActive:        { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  catChipText:          { fontSize: 13, color: '#374151' },
  catChipTextActive:    { color: '#FFFFFF', fontWeight: '600' },
  dispoToggle:          { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  toggle:               { width: 44, height: 24, borderRadius: 12, backgroundColor: '#E5E7EB', padding: 2, marginRight: 10 },
  toggleActive:         { backgroundColor: '#007AFF' },
  toggleThumb:          { width: 20, height: 20, borderRadius: 10, backgroundColor: '#FFFFFF' },
  toggleThumbActive:    { marginLeft: 20 },
  dispoText:            { fontSize: 14, color: '#374151' },
  loader:               { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 60 },
  list:                 { flex: 1 },
  empty:                { alignItems: 'center', marginTop: 60 },
  emptyText:            { color: '#9CA3AF', fontSize: 14 },
  card:                 { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginHorizontal: 16, marginTop: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  cardHeader:           { flexDirection: 'row', alignItems: 'flex-start' },
  avatar:               { width: 48, height: 48, borderRadius: 24, backgroundColor: '#DBEAFE', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText:           { color: '#1D4ED8', fontWeight: '700', fontSize: 18 },
  cardInfo:             { flex: 1 },
  cardNameRow:          { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardName:             { fontSize: 15, fontWeight: '600', color: '#1A1A2E' },
  badge:                { backgroundColor: '#DBEAFE', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10 },
  badgeText:            { fontSize: 10, color: '#1D4ED8', fontWeight: '600' },
  cardSpecialite:       { fontSize: 12, color: '#6B7280', marginTop: 2 },
  cardMeta:             { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  stars:                { color: '#F59E0B', fontSize: 12 },
  metaText:             { fontSize: 11, color: '#9CA3AF' },
  dispoIndicator:       { width: 10, height: 10, borderRadius: 5, marginLeft: 8, marginTop: 4 },
  dispoDot:             { backgroundColor: '#34C759' },
  occupeDot:            { backgroundColor: '#D1D5DB' },
  certifs:              { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  certifBadge:          { backgroundColor: '#F0FDF4', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  certifText:           { fontSize: 11, color: '#16A34A', fontWeight: '500' },
  contactBtn:           { backgroundColor: '#007AFF', borderRadius: 12, paddingVertical: 10, alignItems: 'center', marginTop: 12 },
  contactBtnDisabled:   { backgroundColor: '#F3F4F6' },
  contactBtnText:       { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },
  contactBtnTextDisabled: { color: '#9CA3AF' },
});
