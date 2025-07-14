import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Modal, TextInput, Button, Alert, Platform, TouchableWithoutFeedback, Keyboard
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ICONS = [
  { name: 'cash', label: '現金' },
  { name: 'credit-card', label: '信用卡' },
  { name: 'bank', label: '銀行' },
  { name: 'wallet', label: '錢包' },
];

const CURRENCIES = [
  { symbol: 'NT$', rate: 1 },
  { symbol: 'USD$', rate: 0.033 },
  { symbol: 'JPY¥', rate: 3.65 },
];

export default function AccountOverviewScreen() {
  const [accounts, setAccounts] = useState([]);
  const [sortKey, setSortKey] = useState('balance');
  const [modalVisible, setModalVisible] = useState(false);
  const [editAccount, setEditAccount] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [currencyIndex, setCurrencyIndex] = useState(0);
  const [sortMenuVisible, setSortMenuVisible] = useState(false);

  const [form, setForm] = useState({
    id: '',
    name: '',
    balance: '',
    creditLimit: '',
    icon: ICONS[0].name,
    currency: CURRENCIES[0].symbol,
  });

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    saveAccountsToStorage();
  }, [accounts]);

  const loadAccounts = async () => {
    try {
      const json = await AsyncStorage.getItem('accounts');
      if (json) setAccounts(JSON.parse(json));
    } catch (e) {
      console.error('Load error:', e);
    }
  };

  const saveAccountsToStorage = async () => {
    try {
      await AsyncStorage.setItem('accounts', JSON.stringify(accounts));
    } catch (e) {
      console.error('Save error:', e);
    }
  };

  const sortedAccounts = [...accounts].sort((a, b) => {
    if (sortKey === 'balance') return b.balance - a.balance;
    return 0;
  });

  const totalBalance = accounts.reduce(
    (sum, acc) => sum + acc.balance * CURRENCIES[currencyIndex].rate,
    0
  );

  const resetForm = () => {
    setForm({
      id: '',
      name: '',
      balance: '',
      creditLimit: '',
      icon: ICONS[0].name,
      currency: CURRENCIES[0].symbol,
    });
  };

  const openAddModal = () => {
    setEditAccount(null);
    resetForm();
    setModalVisible(true);
  };

  const saveAccount = () => {
    if (!form.name || form.balance === '') {
      Alert.alert('錯誤', '請填寫名稱與餘額');
      return;
    }

    const newAcc = {
      id: editAccount?.id || (Date.now() + Math.random()).toString(),
      name: form.name,
      balance: parseFloat(form.balance),
      creditLimit: form.creditLimit ? parseFloat(form.creditLimit) : undefined,
      icon: form.icon,
      currency: form.currency,
    };

    const updated = editAccount
      ? accounts.map(acc => (acc.id === editAccount.id ? newAcc : acc))
      : [...accounts, newAcc];

    setAccounts(updated);
    setModalVisible(false);
  };

  const deleteAccount = id => {
    Alert.alert('確認', '確定要刪除嗎？', [
      { text: '取消' },
      {
        text: '刪除', style: 'destructive', onPress: () => {
          setAccounts(accounts.filter(acc => acc.id !== id));
          setDetailModalVisible(false);
        },
      },
    ]);
  };

  const exportCSV = async () => {
    const header = '名稱,餘額,信用額度,圖示,幣別\n';
    const rows = accounts.map(acc =>
      `${acc.name},${acc.balance},${acc.creditLimit || ''},${acc.icon},${acc.currency}`
    ).join('\n');
    const csv = header + rows;

    const filename = FileSystem.documentDirectory + 'accounts.csv';
    await FileSystem.writeAsStringAsync(filename, csv);
    if (Platform.OS !== 'web') {
      await Sharing.shareAsync(filename, { mimeType: 'text/csv' });
    } else {
      Alert.alert('匯出', 'Web 不支援分享功能');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.totalText}>
          總資產 ({CURRENCIES[currencyIndex].symbol})：{totalBalance.toFixed(2)}
        </Text>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity onPress={() => setSortMenuVisible(!sortMenuVisible)} style={styles.iconButton}>
            <MaterialCommunityIcons name="menu" size={26} color="#2f95dc" />
          </TouchableOpacity>
        </View>
      </View>

      {sortMenuVisible && (
        <View style={styles.sortMenu}>
          <TouchableOpacity onPress={() => { setSortKey('balance'); setSortMenuVisible(false); }}>
            <Text style={styles.sortOption}>依餘額排序</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={exportCSV}>
            <Text style={styles.sortOption}>匯出 CSV</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setCurrencyIndex((currencyIndex + 1) % CURRENCIES.length)}>
            <Text style={styles.sortOption}>切換貨幣</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={sortedAccounts}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.accountItem} onPress={() => {
            setSelectedAccount(item);
            setDetailModalVisible(true);
          }}>
            <View style={styles.row}>
              <Text style={styles.accountName}>
                <MaterialCommunityIcons name={item.icon} size={20} /> {item.name}
              </Text>
              <Text style={[styles.balance, { color: item.balance < 0 ? 'red' : 'green' }]}>
                {CURRENCIES[currencyIndex].symbol} {(item.balance * CURRENCIES[currencyIndex].rate).toFixed(2)}
              </Text>
            </View>
            {item.creditLimit && (
              <Text style={styles.creditLimit}>信用額度：{item.creditLimit}</Text>
            )}
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
        <MaterialCommunityIcons name="plus" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Modal：新增 / 編輯帳戶 */}
      <Modal transparent visible={modalVisible} animationType="fade">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.modalContainer}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <MaterialCommunityIcons name="close" size={24} color="#555" />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>{editAccount ? '編輯帳戶' : '新增帳戶'}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="帳戶名稱"
                  value={form.name}
                  onChangeText={text => setForm({ ...form, name: text })}
                />
                <TextInput
                  style={styles.input}
                  placeholder="餘額"
                  keyboardType="numeric"
                  value={form.balance}
                  onChangeText={text => setForm({ ...form, balance: text })}
                />
                <TextInput
                  style={styles.input}
                  placeholder="信用額度 (選填)"
                  keyboardType="numeric"
                  value={form.creditLimit}
                  onChangeText={text => setForm({ ...form, creditLimit: text })}
                />
                <View style={styles.iconRow}>
                  {ICONS.map(icon => (
                    <TouchableOpacity
                      key={icon.name}
                      style={[
                        styles.iconCircle,
                        form.icon === icon.name && { backgroundColor: '#2f95dc33' },
                      ]}
                      onPress={() => setForm({ ...form, icon: icon.name })}
                    >
                      <MaterialCommunityIcons name={icon.name} size={30} />
                    </TouchableOpacity>
                  ))}
                </View>
                <Button title="儲存帳戶" onPress={saveAccount} />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Modal：帳戶詳情 */}
      <Modal visible={detailModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{selectedAccount?.name} 詳情</Text>
            <Text>餘額：{selectedAccount?.balance}</Text>
            {selectedAccount?.creditLimit && <Text>信用額度：{selectedAccount.creditLimit}</Text>}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 }}>
              <Button title="編輯" onPress={() => {
                setEditAccount(selectedAccount);
                setModalVisible(true);
                setDetailModalVisible(false);
              }} />
              <Button title="刪除" onPress={() => deleteAccount(selectedAccount.id)} color="red" />
              <Button title="關閉" onPress={() => setDetailModalVisible(false)} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 16, paddingTop: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  totalText: { fontSize: 18, fontWeight: 'bold', color: '#2f95dc' },
  iconButton: { padding: 6, marginLeft: 10 },
  sortMenu: { backgroundColor: '#eee', borderRadius: 6, padding: 10, marginBottom: 10 },
  sortOption: { fontSize: 16, paddingVertical: 6 },
  accountItem: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 10,
  },
  accountName: { fontSize: 16, fontWeight: 'bold' },
  balance: { fontSize: 16 },
  creditLimit: { fontSize: 14, color: '#555' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    backgroundColor: '#2f95dc',
    borderRadius: 30,
    padding: 15,
    elevation: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  closeButton: { position: 'absolute', top: 10, right: 10, zIndex: 1 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  input: {
    borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 6, marginBottom: 10,
  },
  iconRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 15 },
  iconCircle: { padding: 8, borderRadius: 8 },
});
