import React, { useState } from 'react';
import { View, Text, Button, FlatList, StyleSheet } from 'react-native';

export default function NotificationScreen() {
  const [notifications, setNotifications] = useState([
    { id: '1', title: '分帳提醒', body: '你還欠房租 $5000', read: false },
    { id: '2', title: '記帳提醒', body: '別忘了今天記帳喔！', read: true },
  ]);

  const markAsRead = (id) => {
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updated);
  };

  const addNotification = () => {
    const newNotif = {
      id: Date.now().toString(),
      title: '系統通知',
      body: '這是新通知的內容。',
      read: false,
    };
    setNotifications([newNotif, ...notifications]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>推播通知</Text>
      <Button title="模擬推播" onPress={addNotification} />

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.notificationItem,
              { backgroundColor: item.read ? '#e0e0e0' : '#fffbe0' },
            ]}
          >
            <Text style={styles.notificationTitle}>{item.title}</Text>
            <Text>{item.body}</Text>
            {!item.read && (
              <Button title="標示為已讀" onPress={() => markAsRead(item.id)} />
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  notificationItem: {
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
  },
  notificationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
});
