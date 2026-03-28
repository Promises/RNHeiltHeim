import React from 'react';
import { View, Text, ScrollView, Pressable, Alert, RefreshControl } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useStyles } from '../../src/hooks/useStyles';
import { useTheme } from '../../src/styles/theme';
import { useTrackingDetails } from '../../src/hooks/useTrackingDetails';
import { StatusBadge } from '../../src/components/StatusBadge';
import { TrackingTimeline } from '../../src/components/TrackingTimeline';
import { archiveParcel, deleteParcel } from '../../src/db/parcels';
import type { ParcelStatus } from '../../src/api/types';
import type { Theme } from '../../src/hooks/useStyles';

export default function ParcelDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const styles = useStyles(createStyles);
  const { colors } = useTheme();
  const router = useRouter();
  const { parcel, events, loading, refreshing, refresh } = useTrackingDetails(id);

  if (loading || !parcel) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Laster...</Text>
      </View>
    );
  }

  const isArchived = parcel.is_archived === 1;

  const handleArchive = () => {
    Alert.alert('Arkiver pakke', 'Vil du arkivere denne pakken?', [
      { text: 'Avbryt', style: 'cancel' },
      {
        text: 'Arkiver',
        onPress: async () => {
          await archiveParcel(parcel.parcel_reference);
          router.back();
        },
      },
    ]);
  };

  const handleDelete = () => {
    Alert.alert('Slett pakke', 'Denne handlingen kan ikke angres.', [
      { text: 'Avbryt', style: 'cancel' },
      {
        text: 'Slett',
        style: 'destructive',
        onPress: async () => {
          await deleteParcel(parcel.parcel_reference);
          router.back();
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={refresh}
          tintColor={colors.accent}
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>
          {parcel.label || parcel.shop_name || 'Ukjent avsender'}
        </Text>
        {parcel.status && (
          <StatusBadge status={parcel.status as ParcelStatus} />
        )}
      </View>

      {parcel.label && parcel.shop_name && (
        <Text style={styles.shopName}>Fra {parcel.shop_name}</Text>
      )}

      {parcel.estimated_delivery_content && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estimert levering</Text>
          <Text style={styles.sectionBody}>{parcel.estimated_delivery_content}</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Detaljer</Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Sporingsnummer</Text>
          <Text style={styles.detailMono}>{parcel.parcel_reference}</Text>
        </View>
        {parcel.delivery_postal_area && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Leveres til</Text>
            <Text style={styles.detailValue}>
              {parcel.delivery_postal_code} {parcel.delivery_postal_area}
            </Text>
          </View>
        )}
        {parcel.delivery_type && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Leveringstype</Text>
            <Text style={styles.detailValue}>{parcel.delivery_type}</Text>
          </View>
        )}
        {parcel.sender_postal_area && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Avsender</Text>
            <Text style={styles.detailValue}>
              {parcel.sender_postal_code} {parcel.sender_postal_area}
            </Text>
          </View>
        )}
      </View>

      {events.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hendelser</Text>
          <TrackingTimeline events={events} />
        </View>
      )}

      <View style={styles.actions}>
        {isArchived ? (
          <Pressable
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDelete}
          >
            <Text style={styles.deleteText}>Slett permanent</Text>
          </Pressable>
        ) : (
          <Pressable style={styles.actionButton} onPress={handleArchive}>
            <Text style={styles.archiveText}>Arkiver</Text>
          </Pressable>
        )}
      </View>
    </ScrollView>
  );
}

const createStyles = (theme: Theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xl * 2,
  },
  loadingText: {
    ...theme.typography.body,
    textAlign: 'center' as const,
    marginTop: theme.spacing.xl,
  },
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
    marginBottom: theme.spacing.xs,
  },
  title: {
    ...theme.typography.title,
    fontSize: 24,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  shopName: {
    ...theme.typography.caption,
    marginBottom: theme.spacing.md,
  },
  section: {
    marginTop: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.subtitle,
    marginBottom: theme.spacing.md,
  },
  sectionBody: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  detailRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  detailLabel: {
    ...theme.typography.caption,
  },
  detailValue: {
    ...theme.typography.body,
    fontSize: 14,
  },
  detailMono: {
    ...theme.typography.mono,
    fontSize: 12,
  },
  actions: {
    marginTop: theme.spacing.xl,
  },
  actionButton: {
    padding: theme.spacing.md,
    borderRadius: 10,
    alignItems: 'center' as const,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  deleteButton: {
    backgroundColor: theme.colors.error + '22',
  },
  archiveText: {
    ...theme.typography.body,
    fontWeight: '600' as const,
    color: theme.colors.accent,
  },
  deleteText: {
    ...theme.typography.body,
    fontWeight: '600' as const,
    color: theme.colors.error,
  },
});
