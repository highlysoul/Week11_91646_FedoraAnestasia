import React from 'react';
import {
  Alert,
  Button,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';

import { supabase } from '../lib/supabase';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function sendNotification(
  title: string,
  body: string
) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
    },
    trigger: null,
  });
}

const Index = () => {

  React.useEffect(() => {
    Notifications.requestPermissionsAsync();
  }, []);

  const addData = async () => {
    try {

      // request permission lokasi
      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required.'
        );

        return;
      }

      // ambil lokasi sekarang
      const location =
        await Location.getCurrentPositionAsync({});

      const latitude = location.coords.latitude;
      const longitude = location.coords.longitude;

      // insert ke Supabase
      const { error } = await supabase
        .from('users')
        .insert([
          {
            first: 'Ada',
            last: 'Lovelace',
            birth: 1815,
            latitude,
            longitude,
          },
        ]);

      if (error) throw error;

      // notif sukses
      await sendNotification(
        'Success',
        `Data berhasil ditambahkan.\nLatitude: ${latitude}\nLongitude: ${longitude}`
      );

      Alert.alert(
        'Success',
        'Data added successfully.'
      );

    } catch (error: any) {

      // notif gagal
      await sendNotification(
        'Failed',
        `Gagal menambahkan data.\n${error?.message}`
      );

      Alert.alert(
        'Error',
        error?.message ?? 'Failed to add data.'
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Supabase connection test
      </Text>

      <Button
        title="Add Data"
        onPress={addData}
      />
    </View>
  );
};

export default Index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f5f7fb',
  },

  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    color: '#1f2937',
  },
});