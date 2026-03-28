import React from 'react';
import { View, Text } from 'react-native';
import { useStyles } from '../hooks/useStyles';
import { useTheme } from '../styles/theme';
import type { EventRow } from '../db/events';
import type { Theme } from '../hooks/useStyles';

interface TrackingTimelineProps {
  events: EventRow[];
}

function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('nb-NO', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function TrackingTimeline({ events }: TrackingTimelineProps) {
  const styles = useStyles(createStyles);
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {events.map((event, index) => {
        const isFirst = index === 0;
        const isLast = index === events.length - 1;

        return (
          <View key={event.id} style={styles.row}>
            <View style={styles.timeline}>
              <View
                style={[
                  styles.dot,
                  isFirst && { backgroundColor: colors.accent, width: 14, height: 14, borderRadius: 7 },
                ]}
              />
              {!isLast && <View style={styles.line} />}
            </View>
            <View style={[styles.content, isLast && { paddingBottom: 0 }]}>
              <View style={styles.meta}>
                <Text style={styles.timestamp}>{formatDateTime(event.created_at)}</Text>
                {event.location && (
                  <Text style={styles.location}>{event.location}</Text>
                )}
              </View>
              <Text style={[styles.message, isFirst && styles.messageHighlight]}>
                {event.content}
              </Text>
              {event.description && (
                <Text style={styles.description}>{event.description}</Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const createStyles = (theme: Theme) => ({
  container: {
    paddingLeft: theme.spacing.md,
  },
  row: {
    flexDirection: 'row' as const,
  },
  timeline: {
    alignItems: 'center' as const,
    width: 24,
    marginRight: theme.spacing.md,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.border,
    marginTop: 4,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: theme.colors.borderLight,
    marginVertical: 4,
  },
  content: {
    flex: 1,
    paddingBottom: theme.spacing.lg,
  },
  meta: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: theme.spacing.xs,
    gap: theme.spacing.sm,
  },
  timestamp: {
    ...theme.typography.caption,
    color: theme.colors.textTertiary,
  },
  location: {
    ...theme.typography.caption,
    color: theme.colors.accent,
  },
  message: {
    ...theme.typography.body,
  },
  messageHighlight: {
    fontWeight: '600' as const,
  },
  description: {
    ...theme.typography.caption,
    marginTop: theme.spacing.xs,
    color: theme.colors.textSecondary,
  },
});
