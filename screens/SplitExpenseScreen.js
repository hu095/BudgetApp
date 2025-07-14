import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@split_expense_members';

export default function SplitExpenseScreen() {
  const [newMemberName, setNewMemberName] = useState('');
  const [members, setMembers] = useState([]);
  const [totalAmount, setTotalAmount] = useState('');
  const [results, setResults] = useState([]);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const loadMembers = async () => {
      try {
        const storedMembers = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedMembers) {
          setMembers(JSON.parse(storedMembers));
        } else {
          setMembers([
            { id: '1', name: '小明', selected: true },
            { id: '2', name: '小華', selected: true },
          ]);
        }
      } catch (e) {
        console.error('讀取成員失敗', e);
      }
    };
    loadMembers();
  }, []);

  useEffect(() => {
    const saveMembers = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(members));
      } catch (e) {
        console.error('儲存成員失敗', e);
      }
    };
    saveMembers();
  }, [members]);

  const addMember = () => {
    const name = newMemberName.trim();
    if (!name) return;
    setMembers(prev => [
      ...prev,
      { id: Date.now().toString(), name, selected: true },
    ]);
    setNewMemberName('');
  };

  const removeMember = (id) => {
    setMembers(prev => prev.filter(m => m.id !== id));
  };

  const toggleSelectMember = (id) => {
    setMembers(prev =>
      prev.map(m => m.id === id ? { ...m, selected: !m.selected } : m)
    );
  };

  const calculateSplit = () => {
    if (!totalAmount) return;
    const total = parseFloat(totalAmount);
    if (isNaN(total)) return;

    const selectedMembers = members.filter(m => m.selected);
    if (selectedMembers.length === 0) {
      alert('請至少選擇一位成員');
      return;
    }

    const share = (total / selectedMembers.length).toFixed(0);
    const resultList = selectedMembers.map(m => ({
      id: m.id,
      text: `${m.name} 應付 ${share} 元`
    }));

    setResults(resultList);
    setHistory(prev => [
      {
        id: Date.now().toString(),
        date: new Date().toLocaleString(),
        amount: total,
        members: resultList,
      },
      ...prev,
    ]);
  };

  const clearAmount = () => {
    setTotalAmount('');
    setResults([]);
  };

  const deleteHistoryItem = (id) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <TouchableOpacity
        activeOpacity={1}
        style={{ flex: 1 }}
        onPress={() => Keyboard.dismiss()}
      >
        <Text style={styles.title}>分帳計算器</Text>

        <View style={styles.row}>
          <TextInput
            style={styles.input}
            placeholder="新增成員名稱"
            value={newMemberName}
            onChangeText={setNewMemberName}
            onSubmitEditing={addMember}
            returnKeyType="done"
          />
          <Button title="新增" onPress={addMember} />
        </View>

        <Text style={styles.sectionTitle}>成員（點圈選擇）</Text>
        {members.length === 0 && <Text style={styles.empty}>尚無成員</Text>}
        <FlatList
          data={members}
          keyExtractor={item => item.id}
          style={{ maxHeight: 130 }}
          renderItem={({ item }) => (
            <View style={styles.memberRow}>
              <TouchableOpacity onPress={() => toggleSelectMember(item.id)}>
                <Text style={[
                  styles.circle,
                  { backgroundColor: item.selected ? '#4caf50' : '#fff' }
                ]}></Text>
              </TouchableOpacity>
              <Text style={styles.memberName}>{item.name}</Text>
              <TouchableOpacity onPress={() => removeMember(item.id)}>
                <Text style={styles.remove}>刪除</Text>
              </TouchableOpacity>
            </View>
          )}
        />

        <Text style={styles.sectionTitle}>總金額</Text>
        <TextInput
          style={styles.amountInput}
          keyboardType="numeric"
          placeholder="輸入金額"
          value={totalAmount}
          onChangeText={setTotalAmount}
        />

        <View style={styles.buttonRow}>
          <Button title="計算" onPress={calculateSplit} />
          <Button title="清除" color="gray" onPress={clearAmount} />
        </View>

        <ScrollView style={styles.scrollArea}>
          <Text style={styles.sectionTitle}>分帳結果</Text>
          {results.length === 0 && <Text style={styles.empty}>尚無結果</Text>}
          {results.map(r => (
            <Text key={r.id} style={styles.resultText}>{r.text}</Text>
          ))}

          <Text style={styles.sectionTitle}>歷史紀錄</Text>
          {history.length === 0 && <Text style={styles.empty}>尚無紀錄</Text>}
          {history.map(item => (
            <View key={item.id} style={styles.historyBox}>
              <View style={styles.historyHeader}>
                <Text style={styles.historyText}>🕒 {item.date}</Text>
                <TouchableOpacity onPress={() => deleteHistoryItem(item.id)}>
                  <Text style={styles.deleteIcon}>🗑️</Text>
                </TouchableOpacity>
              </View>
              <Text>總金額：{item.amount}</Text>
              <Text>分帳人數：{item.members.length}</Text>
            </View>
          ))}
        </ScrollView>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fefefe',
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
    backgroundColor: '#fff',
  },
  amountInput: {
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
    fontSize: 18,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
    color: '#444',
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    backgroundColor: '#e0f7fa',
    padding: 8,
    borderRadius: 6,
  },
  circle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#4caf50',
    marginRight: 10,
  },
  memberName: {
    flex: 1,
    fontSize: 14,
  },
  remove: {
    color: '#d32f2f',
    fontSize: 13,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  scrollArea: {
    flexGrow: 1,
    maxHeight: 300,
  },
  resultText: {
    fontSize: 16,
    marginBottom: 5,
    paddingHorizontal: 10,
  },
  historyBox: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  historyText: {
    fontWeight: '600',
  },
  deleteIcon: {
    fontSize: 18,
    color: '#d32f2f',
  },
  empty: {
    fontStyle: 'italic',
    color: '#888',
  },
});
