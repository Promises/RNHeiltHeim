import React, { useState, useCallback } from 'react';
import { View, FlatList, Pressable, Text, Alert } from 'react-native';
import { useStyles } from '../../src/hooks/useStyles';
import { useParcels } from '../../src/hooks/useParcels';
import { ParcelCard } from '../../src/components/ParcelCard';
import { AddParcelModal } from '../../src/components/AddParcelModal';
import { EmptyState } from '../../src/components/EmptyState';
import { archiveParcel } from '../../src/db/parcels';
import type { ParcelRow } from '../../src/db/parcels';
import type { Theme } from '../../src/hooks/useStyles';

export default function ParcelsScreen() {
  const styles = useStyles(createStyles);
  const { parcels, loading, refreshing, refresh, reload } = useParcels(false);
  const [modalVisible, setModalVisible] = useState(false);

  const handleArchive = useCallback(async (parcel: ParcelRow) => {
    Alert.alert(
      'Arkiver pakke',
      `Vil du arkivere "${parcel.label || parcel.shop_name || 'denne pakken'}"?`,
      [
        { text: 'Avbryt', style: 'cancel' },
        {
          text: 'Arkiver',
          onPress: async () => {
            await archiveParcel(parcel.parcel_reference);
            await reload();
          },
        },
      ]
    );
  }, [reload]);

  return (
    <View style={styles.container}>
      <FlatList
        data={parcels}
        keyExtractor={(item) => item.parcel_reference}
        renderItem={({ item }) => (
          <Pressable onLongPress={() => handleArchive(item)}>
            <ParcelCard parcel={item} />
          </Pressable>
        )}
        refreshing={refreshing}
        onRefresh={refresh}
        contentContainerStyle={parcels.length === 0 ? styles.emptyContainer : styles.list}
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              title="Ingen pakker"
              message="Trykk + for å legge til en pakke med sporingsnummer"
            />
          ) : null
        }
      />
      <Pressable
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.fabText}>+</Text>
      </Pressable>
      <AddParcelModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAdded={reload}
      />
    </View>
  );
}

const createStyles = (theme: Theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  list: {
    paddingVertical: theme.spacing.sm,
  },
  emptyContainer: {
    flex: 1,
  },
  fab: {
    position: 'absolute' as const,
    right: theme.spacing.lg,
    bottom: theme.spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.accent,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabPressed: {
    opacity: 0.8,
  },
  fabText: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '300' as const,
    marginTop: -2,
  },
});
