import React, { useCallback } from 'react';
import { View, FlatList, Pressable, Alert } from 'react-native';
import { useStyles } from '../../src/hooks/useStyles';
import { useParcels } from '../../src/hooks/useParcels';
import { ParcelCard } from '../../src/components/ParcelCard';
import { EmptyState } from '../../src/components/EmptyState';
import { deleteParcel, unarchiveParcel } from '../../src/db/parcels';
import type { ParcelRow } from '../../src/db/parcels';
import type { Theme } from '../../src/hooks/useStyles';

export default function ArchiveScreen() {
  const styles = useStyles(createStyles);
  const { parcels, loading, refreshing, refresh, reload } = useParcels(true);

  const handleLongPress = useCallback(
    (parcel: ParcelRow) => {
      Alert.alert(
        parcel.label || parcel.shop_name || 'Pakke',
        'Hva vil du gjøre med denne pakken?',
        [
          { text: 'Avbryt', style: 'cancel' },
          {
            text: 'Gjenopprett',
            onPress: async () => {
              await unarchiveParcel(parcel.parcel_reference);
              await reload();
            },
          },
          {
            text: 'Slett permanent',
            style: 'destructive',
            onPress: async () => {
              await deleteParcel(parcel.parcel_reference);
              await reload();
            },
          },
        ]
      );
    },
    [reload]
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={parcels}
        keyExtractor={(item) => item.parcel_reference}
        renderItem={({ item }) => (
          <Pressable onLongPress={() => handleLongPress(item)}>
            <ParcelCard parcel={item} />
          </Pressable>
        )}
        refreshing={refreshing}
        onRefresh={refresh}
        contentContainerStyle={parcels.length === 0 ? styles.emptyContainer : styles.list}
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              title="Tomt arkiv"
              message="Arkiverte pakker vises her. Hold inne en pakke for å arkivere den."
            />
          ) : null
        }
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
});
