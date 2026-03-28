import React from 'react';
import { View, Text } from 'react-native';
import { useStyles } from '../hooks/useStyles';
import { useTheme } from '../styles/theme';
import { STATUS_LABELS, getStatusColor } from '../constants/status';
import type { ParcelStatus } from '../api/types';
import type { Theme } from '../hooks/useStyles';

interface StatusBadgeProps {
  status: ParcelStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const styles = useStyles(createStyles);
  const { colors } = useTheme();
  const color = getStatusColor(status, colors);

  return (
    <View style={[styles.badge, { backgroundColor: color + '22' }]}>
      <Text style={[styles.text, { color }]}>{STATUS_LABELS[status]}</Text>
    </View>
  );
}

const createStyles = (theme: Theme) => ({
  badge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: 6,
    alignSelf: 'flex-start' as const,
  },
  text: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
});
