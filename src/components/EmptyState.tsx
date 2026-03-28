import React from 'react';
import { View, Text } from 'react-native';
import { useStyles } from '../hooks/useStyles';
import type { Theme } from '../hooks/useStyles';

interface EmptyStateProps {
  title: string;
  message: string;
}

export function EmptyState({ title, message }: EmptyStateProps) {
  const styles = useStyles(createStyles);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const createStyles = (theme: Theme) => ({
  container: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: theme.spacing.xl,
  },
  title: {
    ...theme.typography.subtitle,
    marginBottom: theme.spacing.sm,
  },
  message: {
    ...theme.typography.caption,
    textAlign: 'center' as const,
  },
});
