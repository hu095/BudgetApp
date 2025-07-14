import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, Button, FlatList, StyleSheet,
  TouchableOpacity, Keyboard, TouchableWithoutFeedback, Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function GroupScreen() {
  const [groupName, setGroupName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    const saved = await AsyncStorage.getItem('groups');
    if (saved) setGroups(JSON.parse(saved));
  };

  const saveGroups = async (newGroups) => {
    setGroups(newGroups);
    await AsyncStorage.setItem('groups', JSON.stringify(newGroups));
  };

  const generateCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

  const createGroup = () => {
    if (!groupName.trim()) return;
    const newCode = generateCode();
    const newGroup = {
      id: Date.now().toString(),
      name: groupName.trim(),
      code: newCode,
    };
    const updatedGroups = [newGroup, ...groups];
    saveGroups(updatedGroups);
    setGroupName('');
  };

  const joinGroup = () => {
    const trimmedCode = joinCode.trim().toUpperCase();
    if (!trimmedCode) return;

    const exists = groups.find(g => g.code === trimmedCode);
    if (exists) {
      Alert.alert('提示', '你已加入過此群組');
    } else {
      Alert.alert('錯誤', '無此群組代碼');
    }
    setJoinCode('');
  };

  const copyCode = async (code) => {
    await Clipboard.setStringAsync(code);
    Alert.alert('已複製', `代碼 ${code} 已複製到剪貼簿`);
  };

  const deleteGroup = (id) => {
    Alert.alert('確認', '確定要刪除此群組嗎？', [
      { text: '取消' },
      {
        text: '刪除',
        onPress: () => {
          const updated = groups.filter(g => g.id !== id);
          saveGroups(updated);
        },
        style: 'destructive',
      },
    ]);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        {/* 建立群組區塊 */}
        <View style={styles.section}>
          <Text style={styles.subtitle}>建立群組</Text>
          <TextInput
            style={styles.input}
            placeholder="輸入群組名稱"
            value={groupName}
            onChangeText={setGroupName}
          />
          <TouchableOpacity style={styles.primaryButton} onPress={createGroup}>
            <Text style={styles.primaryButtonText}>建立群組</Text>
          </TouchableOpacity>
        </View>

        {/* 加入群組區塊 */}
        <View style={styles.section}>
          <Text style={styles.subtitle}>加入群組</Text>
          <TextInput
            style={styles.input}
            placeholder="輸入群組代碼"
            value={joinCode}
            onChangeText={setJoinCode}
            autoCapitalize="characters"
          />
          <TouchableOpacity style={styles.primaryButton} onPress={joinGroup}>
            <Text style={styles.primaryButtonText}>加入群組</Text>
          </TouchableOpacity>
        </View>

        {/* 群組列表 */}
        <Text style={[styles.subtitle, { marginTop: 30 }]}>已加入的群組</Text>
        <FlatList
          data={groups}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.groupItem}>
              <View style={styles.groupHeader}>
                <Text style={styles.groupName}>{item.name}</Text>
                <TouchableOpacity onPress={() => deleteGroup(item.id)}>
                  <MaterialCommunityIcons name="trash-can-outline" size={22} color="#cc0000" />
                </TouchableOpacity>
              </View>
              <View style={styles.groupInfo}>
                <Text style={styles.codeText}>代碼: {item.code}</Text>
                <TouchableOpacity onPress={() => copyCode(item.code)}>
                  <MaterialCommunityIcons name="content-copy" size={20} color="#333" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fefefe',
    padding: 20,
    paddingTop: 40,
  },
  section: {
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    fontSize: 16,
  },
  primaryButton: {
    backgroundColor: '#2f95dc',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  groupItem: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  groupName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#444',
  },
  groupInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  codeText: {
    fontSize: 14,
    marginRight: 6,
    color: '#555',
  },
});
