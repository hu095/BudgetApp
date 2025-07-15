// ReportScreen.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions, Button
} from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import DateTimePicker from '@react-native-community/datetimepicker';

const screenWidth = Dimensions.get('window').width;

export default function ReportScreen() {
  const [tab, setTab] = useState('支出');
  const [range, setRange] = useState('月');
  const [dateRange, setDateRange] = useState('');
  const [customStart, setCustomStart] = useState(null);
  const [customEnd, setCustomEnd] = useState(null);
  const [showPicker, setShowPicker] = useState({ type: null }); // { type: 'start'|'end' }

  // 範例資料
  const chartData = [
    { name: '信用卡', amount: 3150, color: '#f85a8f' },
    { name: '社交', amount: 800, color: '#fbc02d' },
    { name: '晚餐', amount: 720, color: '#fb8c00' },
    { name: '午餐', amount: 580, color: '#0097a7' },
    { name: '交通', amount: 110, color: '#00d2b2' },
  ];

  const total = chartData.reduce((s, i) => s + i.amount, 0);

  // 更新 dateRange
  useEffect(() => {
    const now = new Date();
    let start, end = now;

    if (range === '月') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (range === '近6個月') {
      start = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    } else if (range === '年') {
      start = new Date(now.getFullYear(), 0, 1);
      end = new Date(now.getFullYear(), 11, 31);
    } else {
      if (customStart && customEnd) { start = customStart; end = customEnd; }
      else { setDateRange('請選擇開始／結束日期'); return; }
    }

    setDateRange(formatDate(start) + ' ~ ' + formatDate(end));
  }, [range, customStart, customEnd]);

  const formatDate = d => `${d.getFullYear()}/${pad(d.getMonth()+1)}/${pad(d.getDate())}`;
  const pad = n => (n<10? '0'+n : n);

  const shiftRange = dir => {
    const now = new Date();
    if (range === '月') {
      const newMonth = now.getMonth() + (dir==='prev' ? -1 : 1);
      const d = new Date(now.getFullYear(), newMonth, 1);
      const end = new Date(d.getFullYear(), d.getMonth()+1, 0);
      setCustomStart(d); setCustomEnd(end);
      setRange('自訂');
    } else if (range === '近6個月') {
      // 略
    } else if (range === '年') {
      // 略
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.tabRow}>
        {['支出','收入','結餘'].map(t=>(
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab===t && styles.tabActive]}
            onPress={()=>setTab(t)}
          >
            <Text style={[styles.tabText, tab===t&&styles.tabTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.rangeRow}>
        {['月','近6個月','年','自訂'].map(r=>(
          <TouchableOpacity
            key={r}
            style={[styles.rangeBtn, range===r&&styles.rangeActive]}
            onPress={()=>setRange(r)}
          >
            <Text style={range===r?{color:'#000'}:undefined}>{r}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.dateRow}>
        <TouchableOpacity onPress={()=>shiftRange('prev')}><Text style={styles.arrow}>{'<'}</Text></TouchableOpacity>
        <Text style={styles.dateText}>{dateRange}</Text>
        <TouchableOpacity onPress={()=>shiftRange('next')}><Text style={styles.arrow}>{'>'}</Text></TouchableOpacity>
        {range==='自訂'&&(
          <>
            <Button title="選開始" onPress={()=>setShowPicker({ type:'start' })}/>
            <Button title="選結束" onPress={()=>setShowPicker({ type:'end' })}/>
          </>
        )}
      </View>

      {showPicker.type && (
        <DateTimePicker
          value={showPicker.type==='start'?(customStart||new Date()):(customEnd||new Date())}
          mode="date"
          onChange={(e,d)=>{
            setShowPicker({ type:null });
            if (!d) return;
            if (showPicker.type==='start') setCustomStart(d);
            else setCustomEnd(d);
          }}
        />
      )}

      <PieChart
        data={chartData}
        width={screenWidth}
        height={240}
        accessor="amount"
        backgroundColor="transparent"
        paddingLeft="20"
        absolute
        chartConfig={{color:()=>'#000'}}
        hasLegend={false}
      />

      <View style={styles.totalBox}>
        <Text style={styles.totalLabel}>總{tab}</Text>
        <Text style={styles.totalAmount}>${total.toLocaleString()}</Text>
      </View>

      <View style={styles.legendBox}>
        {chartData.map((i,idx)=>(
          <View key={idx} style={styles.legendItem}>
            <View style={[styles.colorDot,{backgroundColor:i.color}]} />
            <Text>{i.name} {((i.amount/total)*100).toFixed(1)}%</Text>
          </View>
        ))}
      </View>

      <View style={styles.detailBox}>
        <View style={styles.detailHeader}>
          <Text style={styles.detailTitle}>{tab}明細</Text>
          <Text style={styles.sortIcon}>⇅</Text>
        </View>
        {chartData.map((i,idx)=>(
          <View key={idx} style={styles.detailItem}>
            <Text>{i.name}</Text>
            <Text style={styles.detailAmount}>${i.amount.toLocaleString()}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1,backgroundColor:'#fff',padding:20,paddingTop:50 },
  tabRow:{ flexDirection:'row',alignSelf:'center',marginBottom:20,borderWidth:1,borderRadius:10,overflow:'hidden' },
  tab:{ padding:8, paddingHorizontal:20, backgroundColor:'#fff' },
  tabActive:{ backgroundColor:'#ffd54f' },
  tabText:{ color:'#555', fontSize:16 },
  tabTextActive:{ color:'#000', fontWeight:'bold' },
  rangeRow:{ flexDirection:'row',justifyContent:'space-around',marginBottom:10,borderBottomWidth:1,paddingBottom:10 },
  rangeBtn:{ padding:6, paddingHorizontal:12 },
  rangeActive:{ backgroundColor:'#ffd54f', borderRadius:6 },
  dateRow:{ flexDirection:'row',alignItems:'center',justifyContent:'center',marginVertical:15,flexWrap:'wrap' },
  arrow:{ fontSize:20, paddingHorizontal:10 },
  dateText:{ fontSize:16,fontWeight:'600' },
  totalBox:{ position:'absolute', top:240, left:screenWidth/2-70, width:140, alignItems:'center' },
  totalLabel:{ fontSize:14,color:'#555' },
  totalAmount:{ fontSize:20,fontWeight:'bold' },
  legendBox:{ flexDirection:'row',flexWrap:'wrap',justifyContent:'space-between',marginTop:20,marginBottom:20,paddingHorizontal:10 },
  legendItem:{ flexDirection:'row', alignItems:'center', width:'45%', marginVertical:4 },
  colorDot:{ width:12,height:12,borderRadius:6,marginRight:8 },
  detailBox:{ borderWidth:1,borderRadius:10,padding:10 },
  detailHeader:{ flexDirection:'row',justifyContent:'space-between',marginBottom:10 },
  detailTitle:{ fontWeight:'bold',fontSize:16 },
  sortIcon:{ fontSize:16 },
  detailItem:{ flexDirection:'row',justifyContent:'space-between',paddingVertical:8,borderBottomWidth:0.5,borderColor:'#ccc' },
  detailAmount:{ fontWeight:'600' },
});
