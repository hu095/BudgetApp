import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, Button, StyleSheet, ScrollView,
  TouchableOpacity, Alert, KeyboardAvoidingView, Platform,
  Keyboard, TouchableWithoutFeedback
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';

const defaultExpenseCategories = ['食物', '交通', '房租', '娛樂', '購物', '教育'];
const defaultIncomeCategories = ['薪資', '獎金', '投資', '其他'];

export default function AddTransactionScreen() {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [type, setType] = useState('支出');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState(defaultExpenseCategories);
  const [incomeCategories, setIncomeCategories] = useState(defaultIncomeCategories);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState('');

  const storageKeys = {
    expense: 'expenseCategories',
    income: 'incomeCategories',
    lastCategory: 'lastCategory',
  };

  useEffect(() => {
    loadTransactions();
    loadCategories();
    loadLastCategory();
  }, []);

  useEffect(() => {
    const defaultCat = (type === '支出' ? expenseCategories : incomeCategories)[0];
    setCategory(defaultCat);
  }, [type]);

  const loadTransactions = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('transactions');
      if (jsonValue) setTransactions(JSON.parse(jsonValue));
    } catch (e) {
      console.error('Error loading transactions:', e);
    }
  };

  const saveTransactions = async (data) => {
    try {
      await AsyncStorage.setItem('transactions', JSON.stringify(data));
    } catch (e) {
      console.error('Error saving transactions:', e);
    }
  };

  const loadCategories = async () => {
    try {
      const expense = await AsyncStorage.getItem(storageKeys.expense);
      const income = await AsyncStorage.getItem(storageKeys.income);
      if (expense) setExpenseCategories(JSON.parse(expense));
      if (income) setIncomeCategories(JSON.parse(income));
    } catch (e) {
      console.error('Error loading categories:', e);
    }
  };

  const saveCategories = async () => {
    try {
      await AsyncStorage.setItem(storageKeys.expense, JSON.stringify(expenseCategories));
      await AsyncStorage.setItem(storageKeys.income, JSON.stringify(incomeCategories));
    } catch (e) {
      console.error('Error saving categories:', e);
    }
  };

  const loadLastCategory = async () => {
    try {
      const value = await AsyncStorage.getItem(storageKeys.lastCategory);
      if (value) setCategory(value);
    } catch (e) {
      console.error('Error loading last category:', e);
    }
  };

  const saveLastCategory = async (cat) => {
    try {
      await AsyncStorage.setItem(storageKeys.lastCategory, cat);
    } catch (e) {
      console.error('Error saving last category:', e);
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
    saveLastCategory(category);
    setAmount('');
    setNote('');
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

  const addNewCategory = () => {
    const trimmed = newCategoryInput.trim();
    if (!trimmed) return;

    const targetList = type === '支出' ? expenseCategories : incomeCategories;
    const setter = type === '支出' ? setExpenseCategories : setIncomeCategories;

    if (targetList.includes(trimmed)) {
      Alert.alert('分類已存在');
      return;
    }

    const updatedList = [...targetList, trimmed];
    setter(updatedList);
    saveCategories();
    setCategory(trimmed);
    setNewCategoryInput('');
    setShowAddCategory(false);
  };

  const deleteSelectedCategory = () => {
    const targetList = type === '支出' ? expenseCategories : incomeCategories;
    const setter = type === '支出' ? setExpenseCategories : setIncomeCategories;

    if (!category) return;
    const updatedList = targetList.filter(c => c !== category);
    if (updatedList.length === 0) {
      Alert.alert('至少需要一個分類');
      return;
    }

    setter(updatedList);
    setCategory(updatedList[0]);

    if (type === '支出') {
      AsyncStorage.setItem('expenseCategories', JSON.stringify(updatedList));
    } else {
      AsyncStorage.setItem('incomeCategories', JSON.stringify(updatedList));
    }
  };

  const categories = type === '支出' ? expenseCategories : incomeCategories;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.inputRow}>
            <TouchableOpacity
              style={[styles.typeButton, type === '支出' && styles.typeSelected]}
              onPress={() => setType('支出')}
            >
              <Text style={type === '支出' ? styles.typeTextSelected : styles.typeText}>支出</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeButton, type === '收入' && styles.typeSelected]}
              onPress={() => setType('收入')}
            >
              <Text style={type === '收入' ? styles.typeTextSelected : styles.typeText}>收入</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="金額"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />

          <TextInput
            style={styles.input}
            placeholder="備註"
            value={note}
            onChangeText={setNote}
          />

          <View style={styles.pickerWrapper}>
            <Text style={{ marginBottom: 5 }}>分類：</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryContainer}>
              {categories.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryButton, category === cat && styles.categoryButtonSelected]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={category === cat ? styles.categoryTextSelected : styles.categoryText}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={{ flexDirection: 'row', marginTop: 10 }}>
              <TouchableOpacity style={styles.addCategoryButton} onPress={() => setShowAddCategory(true)}>
                <Text style={styles.addCategoryText}>＋新增分類</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.addCategoryButton, { marginLeft: 10, borderColor: 'red' }]}
                onPress={deleteSelectedCategory}
              >
                <Text style={[styles.addCategoryText, { color: 'red' }]}>🗑 刪除</Text>
              </TouchableOpacity>
            </View>

            {showAddCategory && (
              <View style={{ flexDirection: 'row', marginTop: 10, alignItems: 'center' }}>
                <TextInput
                  style={[styles.input, { flex: 1, marginRight: 10 }]}
                  placeholder="輸入新分類名稱"
                  value={newCategoryInput}
                  onChangeText={setNewCategoryInput}
                  returnKeyType="done"
                  autoFocus
                />
                <Button title="確定" onPress={addNewCategory} />
                <Button title="取消" color="grey" onPress={() => { setShowAddCategory(false); setNewCategoryInput(''); }} />
              </View>
            )}
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

          {transactions.map(item => (
            <View key={item.id} style={styles.transactionCard}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={styles.transactionAmount}>
                  {item.type === '支出' ? '－' : '＋'} ${item.amount}
                </Text>
                <TouchableOpacity onPress={() => deleteTransaction(item.id)}>
                  <Text style={styles.transactionDelete}>🗑</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.transactionDetail}>{item.date} ｜ {item.category}</Text>
              {item.note ? <Text style={styles.transactionNote}>備註：{item.note}</Text> : null}
            </View>
          ))}
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 50 },
  input: {
    borderWidth: 1, borderColor: '#ccc',
    padding: 10, marginBottom: 10,
    borderRadius: 8, flex: 1,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  pickerWrapper: { marginBottom: 20 },
  categoryContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  categoryButton: {
    borderWidth: 1,
    borderColor: '#888',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 5,
  },
  categoryButtonSelected: {
    backgroundColor: '#2f95dc',
    borderColor: '#2f95dc',
  },
  categoryText: { color: '#333' },
  categoryTextSelected: { color: 'white' },
  addCategoryButton: {
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#2f95dc',
    borderRadius: 20,
    justifyContent: 'center',
  },
  addCategoryText: {
    color: '#2f95dc',
    fontWeight: 'bold',
  },
  subtitle: { fontSize: 20, marginBottom: 10 },
  transactionCard: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2f95dc',
  },
  transactionDetail: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  transactionNote: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  transactionDelete: {
    color: 'red',
    fontSize: 16,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  typeButton: {
    flex: 1,
    padding: 10,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    alignItems: 'center',
  },
  typeSelected: {
    backgroundColor: '#2f95dc',
    borderColor: '#2f95dc',
  },
  typeText: { color: '#333' },
  typeTextSelected: { color: 'white', fontWeight: 'bold' },
});
