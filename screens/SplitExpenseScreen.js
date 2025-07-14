import React, { useState } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native';

export default function SplitExpenseScreen() {
  const [payer, setPayer] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [members, setMembers] = useState([
    { id: '1', name: '小明', share: '' },
    { id: '2', name: '小華', share: '' },
  ]);
  const [results, setResults] = useState([]);

  const calculateSplit = () => {
    if (!payer || !totalAmount) return;
    const total = parseFloat(totalAmount);
    const updated = members.map(m => ({
      ...m,
      share: (total / members.length).toFixed(0)
    }));
    setMembers(updated);

    const resultsList = updated.map(m => ({
      id: m.id,
      text: `${m.name} 應付 ${m.share} 元`
    }));
    setResults(resultsList);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>分帳頁</Text>

      <TextInput
        style={styles.input}
        placeholder="付款人"
        value={payer}
        onChangeText={setPayer}
      />
      <TextInput
        style={styles.input}
        placeholder="總金額"
        value={totalAmount}
        onChangeText={setTotalAmount}
        keyboardType="numeric"
      />
      <Button title="計算平均分帳" onPress={calculateSplit} />

      <Text style={styles.subtitle}>分帳結果</Text>
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.resultItem}>
            <Text>{item.text}</Text>
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
  subtitle: {
    fontSize: 18,
    marginVertical: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  resultItem: {
    backgroundColor: '#f2f2f2',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
});
