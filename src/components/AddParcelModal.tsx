import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useStyles } from '../hooks/useStyles';
import { useTheme } from '../styles/theme';
import { fetchTracking } from '../api/tracking';
import { insertParcelFromAPI } from '../db/parcels';
import { upsertEvents } from '../db/events';
import type { Theme } from '../hooks/useStyles';

interface AddParcelModalProps {
  visible: boolean;
  onClose: () => void;
  onAdded: () => void;
}

export function AddParcelModal({ visible, onClose, onAdded }: AddParcelModalProps) {
  const styles = useStyles(createStyles);
  const { colors } = useTheme();
  const [trackingNumber, setTrackingNumber] = useState('');
  const [label, setLabel] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdd = async () => {
    const trimmed = trackingNumber.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);

    try {
      const tracking = await fetchTracking(trimmed);
      if (!tracking) {
        setError('Fant ingen pakke med dette sporingsnummeret');
        return;
      }

      await insertParcelFromAPI(tracking, label.trim() || undefined);
      await upsertEvents(tracking.parcelReference, tracking.events);

      setTrackingNumber('');
      setLabel('');
      onAdded();
      onClose();
    } catch {
      setError('Kunne ikke hente pakkeinformasjon. Sjekk nettverket ditt.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTrackingNumber('');
    setLabel('');
    setError(null);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.sheet}>
          <Text style={styles.title}>Legg til pakke</Text>

          <Text style={styles.inputLabel}>Sporingsnummer</Text>
          <TextInput
            style={styles.input}
            value={trackingNumber}
            onChangeText={setTrackingNumber}
            placeholder="F.eks. 370724763379145853"
            placeholderTextColor={colors.textTertiary}
            keyboardType="number-pad"
            autoFocus
          />

          <Text style={styles.inputLabel}>Kallenavn (valgfritt)</Text>
          <TextInput
            style={styles.input}
            value={label}
            onChangeText={setLabel}
            placeholder="F.eks. Sko fra Zalando"
            placeholderTextColor={colors.textTertiary}
          />

          {error && <Text style={styles.error}>{error}</Text>}

          <View style={styles.buttons}>
            <Pressable style={styles.cancelButton} onPress={handleClose}>
              <Text style={styles.cancelText}>Avbryt</Text>
            </Pressable>
            <Pressable
              style={[styles.addButton, loading && styles.addButtonDisabled]}
              onPress={handleAdd}
              disabled={loading || !trackingNumber.trim()}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.addText}>Legg til</Text>
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const createStyles = (theme: Theme) => ({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end' as const,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl + 16,
  },
  title: {
    ...theme.typography.subtitle,
    fontSize: 22,
    marginBottom: theme.spacing.lg,
  },
  inputLabel: {
    ...theme.typography.caption,
    marginBottom: theme.spacing.xs,
  },
  input: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 10,
    padding: theme.spacing.md,
    ...theme.typography.body,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  error: {
    color: theme.colors.error,
    fontSize: 14,
    marginBottom: theme.spacing.md,
  },
  buttons: {
    flexDirection: 'row' as const,
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  cancelButton: {
    flex: 1,
    padding: theme.spacing.md,
    borderRadius: 10,
    alignItems: 'center' as const,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  cancelText: {
    ...theme.typography.body,
    fontWeight: '600' as const,
  },
  addButton: {
    flex: 1,
    padding: theme.spacing.md,
    borderRadius: 10,
    alignItems: 'center' as const,
    backgroundColor: theme.colors.accent,
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  addText: {
    ...theme.typography.body,
    fontWeight: '600' as const,
    color: '#fff',
  },
});
