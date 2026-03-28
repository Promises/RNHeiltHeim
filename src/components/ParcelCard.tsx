import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useStyles } from '../hooks/useStyles';
import { StatusBadge } from './StatusBadge';
import type { ParcelRow } from '../db/parcels';
import type { ParcelStatus } from '../api/types';
import type { Theme } from '../hooks/useStyles';

interface ParcelCardProps {
  parcel: ParcelRow;
}

function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Akkurat nå';
  if (diffMins < 60) return `${diffMins} min siden`;
  if (diffHours < 24) return `${diffHours}t siden`;
  if (diffDays < 7) return `${diffDays}d siden`;
  return date.toLocaleDateString('nb-NO', { day: 'numeric', month: 'short' });
}

export function ParcelCard({ parcel }: ParcelCardProps) {
  const styles = useStyles(createStyles);
  const router = useRouter();

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => router.push(`/parcel/${parcel.parcel_reference}`)}
    >
      <View style={styles.header}>
        <Text style={styles.shopName} numberOfLines={1}>
          {parcel.label || parcel.shop_name || 'Ukjent avsender'}
        </Text>
        {parcel.status && (
          <StatusBadge status={parcel.status as ParcelStatus} />
        )}
      </View>
      {parcel.last_event_content && (
        <Text style={styles.event} numberOfLines={2}>
          {parcel.last_event_content}
        </Text>
      )}
      <View style={styles.footer}>
        {parcel.delivery_postal_area && (
          <Text style={styles.destination}>
            {parcel.delivery_postal_area}
          </Text>
        )}
        <Text style={styles.time}>
          {formatRelativeTime(parcel.last_event_at)}
        </Text>
      </View>
    </Pressable>
  );
}

const createStyles = (theme: Theme) => ({
  card: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 12,
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.xs,
  },
  cardPressed: {
    opacity: 0.7,
  },
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: theme.spacing.sm,
  },
  shopName: {
    ...theme.typography.subtitle,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  event: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  footer: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  destination: {
    ...theme.typography.caption,
  },
  time: {
    ...theme.typography.caption,
    color: theme.colors.textTertiary,
  },
});
