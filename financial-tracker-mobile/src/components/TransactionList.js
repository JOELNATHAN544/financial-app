import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

function formatDate(dateArr) {
  if (!Array.isArray(dateArr) || dateArr.length < 3) return 'Invalid Date';
  // JS months are 0-based, backend months are likely 1-based
  const [year, month, day] = dateArr;
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

const TransactionList = ({ transactions, onEdit, onDelete }) => {
  // Get current month and year
  const now = new Date();
  const monthYear = now.toLocaleString('default', { month: 'long', year: 'numeric' });

  if (!transactions.length) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No transactions yet.</Text>
      </View>
    );
  }

  return (
    <View>
      {/* Month/Year Display */}
      <View style={styles.monthHeader}>
        <Text style={styles.monthHeaderText}>{monthYear}</Text>
      </View>
      <ScrollView horizontal style={styles.tableWrapper} contentContainerStyle={{ minWidth: 700 }}>
        <View>
          {/* Table Header */}
          <View style={[styles.row, styles.headerRow]}>
            <Text style={[styles.cell, styles.headerCell, { flex: 1.2 }]}>Date</Text>
            <Text style={[styles.cell, styles.headerCell, { flex: 2 }]}>Description</Text>
            <Text style={[styles.cell, styles.headerCell, { flex: 1 }]}>Credit</Text>
            <Text style={[styles.cell, styles.headerCell, { flex: 1 }]}>Debit</Text>
            <Text style={[styles.cell, styles.headerCell, { flex: 1.2 }]}>Balance</Text>
            <Text style={[styles.cell, styles.headerCell, { flex: 1 }]}>Actions</Text>
          </View>
          {/* Table Body */}
          {transactions.map((item) => (
            <View key={item.id} style={styles.row}>
              <Text style={[styles.cell, { flex: 1.2 }]}>{formatDate(item.date)}</Text>
              <Text style={[styles.cell, { flex: 2 }]}>{item.usedFor}</Text>
              <Text style={[styles.cell, styles.credit, { flex: 1 }]}>
                {item.credit ? `+${Number(item.credit).toLocaleString('en-CM', { minimumFractionDigits: 2 })} FCFA` : '-'}
              </Text>
              <Text style={[styles.cell, styles.debit, { flex: 1 }]}>
                {item.debit ? `-${Number(item.debit).toLocaleString('en-CM', { minimumFractionDigits: 2 })} FCFA` : '-'}
              </Text>
              <Text style={[styles.cell, styles.balance, { flex: 1.2 }]}> 
                {Number(item.balance).toLocaleString('en-CM', { minimumFractionDigits: 2 })} FCFA
              </Text>
              <View style={[styles.cell, { flex: 1, flexDirection: 'row', justifyContent: 'center' }]}> 
                <TouchableOpacity onPress={() => onEdit(item)} style={styles.actionBtn}>
                  <Text style={styles.editText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onDelete(item.id)} style={styles.actionBtn}>
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  monthHeader: {
    paddingVertical: 8,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  monthHeaderText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },
  tableWrapper: {
    marginTop: 0,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#fff',
    minHeight: 48,
  },
  headerRow: {
    backgroundColor: '#6366f1',
  },
  cell: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    fontSize: 14,
    color: '#374151',
    textAlign: 'left',
  },
  headerCell: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  credit: {
    color: '#059669',
    fontWeight: 'bold',
  },
  debit: {
    color: '#dc2626',
    fontWeight: 'bold',
  },
  balance: {
    color: '#6366f1',
    fontWeight: 'bold',
  },
  actionBtn: {
    marginHorizontal: 4,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  editText: {
    color: '#2563eb',
    fontWeight: 'bold',
  },
  deleteText: {
    color: '#dc2626',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 16,
  },
});

export default TransactionList;