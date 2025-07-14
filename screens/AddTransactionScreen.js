import React, { useState, useEffect } from 'react';// 測試上傳是否成功

import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

export default function AddTransactionScreen() {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [type, setType] = useState('支出');
  const [category, setCategory] = useState('食物');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('transactions');
      if (jsonValue != null) {
        setTransactions(JSON.parse(jsonValue));
      }
    } catch (e) {
      console.error('Error loading transactions:', e);
    }
  };

  const saveTransactions = async (data) => {
    try {
      const jsonValue = JSON.stringify(data);
      await AsyncStorage.setItem('transactions', jsonValue);
    } catch (e) {
      console.error('Error saving transactions:', e);
    }
  };

  const addTransaction = () => {
    if (!amount) {
      Alert.alert('錯誤', '請輸入金額');
      return;
    }
    const newTransaction = {
      id: Date.now().toString(),
      amount,
      note,
      type,
      category,
      date: date.toISOString().split('T')[0],
    };
    const newList = [newTransaction, ...transactions];
    setTransactions(newList);
    saveTransactions(newList);
    setAmount('');
    setNote('');
    setCategory('食物');
  };

  const deleteTransaction = (id) => {
    const newList = transactions.filter(item => item.id !== id);
    setTransactions(newList);
    saveTransactions(newList);
  };

  const clearAll = () => {
    Alert.alert('確認', '確定要清除所有記帳嗎？', [
      { text: '取消' },
      {
        text: '清除',
        onPress: () => {
          setTransactions([]);
          saveTransactions([]);
        }
      }
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>新增支出 / 收入</Text>
          <View style={styles.inputRow}>
            <Button title={type} onPress={() => setType(type === '支出' ? '收入' : '支出')} />
            <TextInput
              style={styles.input}
              placeholder="金額"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />
          </View>
          <TextInput
            style={styles.input}
            placeholder="備註"
            value={note}
            onChangeText={setNote}
          />
          <View style={styles.pickerWrapper}>
            <Text style={{ marginBottom: 5 }}>分類：</Text>
            <Picker
              selectedValue={category}
              onValueChange={(itemValue) => setCategory(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="🍚 食物" value="食物" />
              <Picker.Item label="🚕 交通" value="交通" />
              <Picker.Item label="🏠 房租" value="房租" />
              <Picker.Item label="🎮 娛樂" value="娛樂" />
              <Picker.Item label="🛍 購物" value="購物" />
              <Picker.Item label="📚 教育" value="教育" />
            </Picker>
          </View>
          <View style={styles.inputRow}>
            <Button title="選擇日期" onPress={() => setShowDatePicker(true)} />
            <Text>{date.toISOString().split('T')[0]}</Text>
          </View>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) setDate(selectedDate);
              }}
            />
          )}
          <Button title="新增記帳" onPress={addTransaction} />
          <View style={styles.listHeader}>
            <Text style={styles.subtitle}>記帳紀錄</Text>
            <Button title="🧹 全部清除" onPress={clearAll} color="red" />
          </View>
          {transactions.map((item) => (
            <View key={item.id} style={styles.item}>
              <Text>
                {item.date} | {item.type} | ${item.amount} | {item.category} | {item.note}
              </Text>
              <TouchableOpacity onPress={() => deleteTransaction(item.id)}>
                <Text style={{ color: 'red' }}>刪除</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    flex: 1,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 20,
    marginBottom: 10,
  },
  item: {
    backgroundColor: '#f2f2f2',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  pickerWrapper: {
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
});
