import type { ParcelStatus } from '../api/types';
import type { ColorScheme } from '../styles/theme';

export const STATUS_LABELS: Record<ParcelStatus, string> = {
  REGISTERED: 'Registrert',
  IN_TRANSIT: 'Under transport',
  OUT_FOR_DELIVERY: 'Ut for levering',
  DELIVERED: 'Levert',
};

export function getStatusColor(status: ParcelStatus, colors: ColorScheme): string {
  switch (status) {
    case 'DELIVERED':
      return colors.success;
    case 'OUT_FOR_DELIVERY':
      return colors.warning;
    case 'IN_TRANSIT':
      return colors.info;
    case 'REGISTERED':
    default:
      return colors.textTertiary;
  }
}
