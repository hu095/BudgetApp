// ReportScreen.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions, Button
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PieChart } from 'react-native-chart-kit';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useIsFocused, useNavigation } from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;

export default function ReportScreen() {
  const isFocused = useIsFocused();
  const navigation = useNavigation();

  const [tab, setTab] = useState('支出');
  const [range, setRange] = useState('月');
  const [dateRange, setDateRange] = useState('');
  const [customStart, setCustomStart] = useState(null);
  const [customEnd, setCustomEnd] = useState(null);
  const [showPicker, setShowPicker] = useState({ type: null });

  const [transactions, setTransactions] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (isFocused) {
      loadTransactions();
    }
  }, [isFocused]);

  useEffect(() => {
    filterAndSummarize();
  }, [transactions, tab, range, customStart, customEnd]);

  const loadTransactions = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('transactions');
      if (jsonValue) {
        setTransactions(JSON.parse(jsonValue));
      }
    } catch (e) {
      console.error('載入交易資料錯誤', e);
    }
  };

  const formatDate = (d) => `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())}`;
  const pad = (n) => (n < 10 ? '0' + n : n);

  const getRangeDates = () => {
    const now = new Date();
    let start, end = now;

    if (range === '月') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else if (range === '近6個月') {
      start = new Date(now.getFullYear(), now.getMonth() - 5, 1);
      end = now;
    } else if (range === '年') {
      start = new Date(now.getFullYear(), 0, 1);
      end = new Date(now.getFullYear(), 11, 31);
    } else if (range === '自訂') {
      if (!customStart || !customEnd) return [null, null];
      start = customStart;
      end = customEnd;
    }
    return [start, end];
  };

  const filterAndSummarize = () => {
    const [start, end] = getRangeDates();
    if (!start || !end) {
      setDateRange('請選擇起訖日期');
      return;
    }

    setDateRange(`${formatDate(start)} ~ ${formatDate(end)}`);

    const filtered = transactions.filter(tx => {
      const txDate = new Date(tx.date);
      return (tab === '結餘' || tx.type === tab) && txDate >= start && txDate <= end;
    });

    const categoryMap = {};
    let totalAmount = 0;

    filtered.forEach(tx => {
      const amt = parseFloat(tx.amount) * (tx.type === '支出' ? -1 : 1);
      const cat = tx.category;
      if (!categoryMap[cat]) categoryMap[cat] = 0;
      categoryMap[cat] += amt;

      if (tab === '結餘') {
        totalAmount += amt;
      } else {
        totalAmount += Math.abs(amt);
      }
    });

    const data = Object.entries(categoryMap).map(([name, amount], i) => ({
      name,
      amount: Math.abs(amount),
      color: chartColors[i % chartColors.length],
      legendFontColor: '#333',
      legendFontSize: 12,
    }));

    setFilteredData(filtered);
    setChartData(data);
    setTotal(totalAmount);
  };

  const shiftRange = (dir) => {
    const unit = range === '月' ? 'month' : range === '年' ? 'year' : null;
    if (!unit) return;

    const [start] = getRangeDates();
    const delta = dir === 'prev' ? -1 : 1;

    const newStart = new Date(start);
    if (unit === 'month') newStart.setMonth(newStart.getMonth() + delta);
    if (unit === 'year') newStart.setFullYear(newStart.getFullYear() + delta);

    const newEnd = unit === 'month'
      ? new Date(newStart.getFullYear(), newStart.getMonth() + 1, 0)
      : new Date(newStart.getFullYear(), 11, 31);

    setRange('自訂');
    setCustomStart(newStart);
    setCustomEnd(newEnd);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.tabRow}>
        {['支出', '收入', '結餘'].map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.rangeRow}>
        {['月', '近6個月', '年', '自訂'].map(r => (
          <TouchableOpacity
            key={r}
            style={[styles.rangeBtn, range === r && styles.rangeActive]}
            onPress={() => setRange(r)}
          >
            <Text style={range === r ? { color: '#000' } : undefined}>{r}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.dateRow}>
        <TouchableOpacity onPress={() => shiftRange('prev')}><Text style={styles.arrow}>{'<'}</Text></TouchableOpacity>
        <Text style={styles.dateText}>{dateRange}</Text>
        <TouchableOpacity onPress={() => shiftRange('next')}><Text style={styles.arrow}>{'>'}</Text></TouchableOpacity>

        {range === '自訂' && (
          <>
            <Button title="選開始" onPress={() => setShowPicker({ type: 'start' })} />
            <Button title="選結束" onPress={() => setShowPicker({ type: 'end' })} />
          </>
        )}
      </View>

      {showPicker.type && (
        <DateTimePicker
          value={showPicker.type === 'start' ? (customStart || new Date()) : (customEnd || new Date())}
          mode="date"
          onChange={(e, d) => {
            setShowPicker({ type: null });
            if (!d) return;
            showPicker.type === 'start' ? setCustomStart(d) : setCustomEnd(d);
          }}
        />
      )}

      {chartData.length > 0 ? (
        <>
          <PieChart
            data={chartData}
            width={screenWidth}
            height={240}
            accessor="amount"
            backgroundColor="transparent"
            paddingLeft="20"
            absolute
            chartConfig={{ color: () => '#000' }}
            hasLegend={false}
          />
          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>總{tab}</Text>
            <Text style={styles.totalAmount}>${total.toLocaleString()}</Text>
          </View>
        </>
      ) : (
        <Text style={{ textAlign: 'center', marginVertical: 20, color: '#888' }}>此區間無資料</Text>
      )}

      <View style={styles.legendBox}>
        {chartData.map((item, idx) => (
          <View key={idx} style={styles.legendItem}>
            <View style={[styles.colorDot, { backgroundColor: item.color }]} />
            <Text>{item.name} {((item.amount / total) * 100).toFixed(1)}%</Text>
          </View>
        ))}
      </View>

      <View style={styles.detailBox}>
        <View style={styles.detailHeader}>
          <Text style={styles.detailTitle}>{tab}明細</Text>
          <Button title="新增收支" onPress={() => navigation.navigate('AddTransaction')} />
        </View>
        {filteredData.map(tx => (
          <View key={tx.id} style={styles.detailItem}>
            <Text>{tx.category}（{tx.date}）</Text>
            <Text style={styles.detailAmount}>${tx.amount}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const chartColors = ['#f85a8f', '#fbc02d', '#fb8c00', '#0097a7', '#00d2b2', '#8e24aa', '#43a047'];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20, paddingTop: 50 },
  tabRow: { flexDirection: 'row', alignSelf: 'center', marginBottom: 20, borderWidth: 1, borderRadius: 10, overflow: 'hidden' },
  tab: { padding: 8, paddingHorizontal: 20, backgroundColor: '#fff' },
  tabActive: { backgroundColor: '#ffd54f' },
  tabText: { color: '#555', fontSize: 16 },
  tabTextActive: { color: '#000', fontWeight: 'bold' },
  rangeRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10, borderBottomWidth: 1, paddingBottom: 10 },
  rangeBtn: { padding: 6, paddingHorizontal: 12 },
  rangeActive: { backgroundColor: '#ffd54f', borderRadius: 6 },
  dateRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 15, flexWrap: 'wrap' },
  arrow: { fontSize: 20, paddingHorizontal: 10 },
  dateText: { fontSize: 16, fontWeight: '600' },
  totalBox: { position: 'absolute', top: 240, left: screenWidth / 2 - 70, width: 140, alignItems: 'center' },
  totalLabel: { fontSize: 14, color: '#555' },
  totalAmount: { fontSize: 20, fontWeight: 'bold' },
  legendBox: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 20, marginBottom: 20, paddingHorizontal: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', width: '45%', marginVertical: 4 },
  colorDot: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
  detailBox: { borderWidth: 1, borderRadius: 10, padding: 10 },
  detailHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  detailTitle: { fontWeight: 'bold', fontSize: 16 },
  detailItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 0.5, borderColor: '#ccc' },
  detailAmount: { fontWeight: '600' },
});
