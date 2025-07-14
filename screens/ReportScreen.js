import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function ReportScreen() {
  // 模擬月結統計資料
  const monthlySummary = {
    income: 25000,
    expense: 18000,
    byCategory: {
      食物: 5000,
      房租: 8000,
      娛樂: 3000,
      交通: 2000,
    },
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>月結報表</Text>
      <Text style={styles.summary}>
        本月收入：${monthlySummary.income}
      </Text>
      <Text style={styles.summary}>
        本月支出：${monthlySummary.expense}
      </Text>
      <Text style={styles.subtitle}>分類統計</Text>
      {Object.entries(monthlySummary.byCategory).map(([category, amount]) => (
        <View key={category} style={styles.categoryItem}>
          <Text>{category}：${amount}</Text>
        </View>
      ))}
      <Text style={styles.note}>（未來可接 Chart 元件畫圖表 📈）</Text>
    </ScrollView>
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
  summary: {
    fontSize: 18,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 20,
    marginVertical: 10,
  },
  categoryItem: {
    backgroundColor: '#f2f2f2',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  note: {
    marginTop: 20,
    fontStyle: 'italic',
    color: '#888',
  },
});
