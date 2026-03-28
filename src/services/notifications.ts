import { Platform } from 'react-native';

function getNotificationsModule() {
  try {
    return require('expo-notifications');
  } catch {
    return null;
  }
}

function getDeviceModule() {
  try {
    return require('expo-device');
  } catch {
    return null;
  }
}

export async function requestNotificationPermissions(): Promise<boolean> {
  const Device = getDeviceModule();
  const Notifications = getNotificationsModule();
  if (!Device || !Notifications) return false;
  if (!Device.isDevice) return false;

  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('tracking', {
        name: 'Pakkesporing',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
      });
    }

    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === 'granted') return true;

    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

export async function sendLocalNotification(
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<void> {
  const Notifications = getNotificationsModule();
  if (!Notifications) return;

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: 'default',
        ...(Platform.OS === 'android' && { channelId: 'tracking' }),
      },
      trigger: null,
    });
  } catch {
    // Notifications not available
  }
}
