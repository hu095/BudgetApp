import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';

export default function AccountOverviewScreen() {
  // 模擬帳戶資料
  const accounts = [
    { id: '1', name: '現金', balance: 5000 },
    { id: '2', name: '信用卡', balance: -3000, creditLimit: 20000 },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>帳戶總覽</Text>
      <FlatList
        data={accounts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.accountItem}>
            <Text>{item.name}</Text>
            <Text>餘額：{item.balance} 元</Text>
            {item.creditLimit && (
              <Text>信用額度：{item.creditLimit} 元</Text>
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
  accountItem: {
    backgroundColor: '#f2f2f2',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
});
