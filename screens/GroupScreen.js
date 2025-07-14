import React, { useState } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native';

export default function GroupScreen() {
  const [groupName, setGroupName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [groups, setGroups] = useState([]);

  const createGroup = () => {
    if (!groupName) return;
    const newGroup = { id: Date.now().toString(), name: groupName };
    setGroups([newGroup, ...groups]);
    setGroupName('');
  };

  const joinGroup = () => {
    if (!joinCode) return;
    const newGroup = { id: Date.now().toString(), name: `加入的群組 (${joinCode})` };
    setGroups([newGroup, ...groups]);
    setJoinCode('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>建立 / 加入分帳群組</Text>

      <Text style={styles.subtitle}>建立群組</Text>
      <TextInput
        style={styles.input}
        placeholder="群組名稱"
        value={groupName}
        onChangeText={setGroupName}
      />
      <Button title="建立群組" onPress={createGroup} />

      <Text style={styles.subtitle}>或加入現有群組</Text>
      <TextInput
        style={styles.input}
        placeholder="輸入群組代碼"
        value={joinCode}
        onChangeText={setJoinCode}
      />
      <Button title="加入群組" onPress={joinGroup} />

      <Text style={styles.subtitle}>已加入的群組</Text>
      <FlatList
        data={groups}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.groupItem}>
            <Text>{item.name}</Text>
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
  groupItem: {
    backgroundColor: '#f2f2f2',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
});
