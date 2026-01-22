import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Colors, Spacing } from '../constants/Theme';

function formatDate(dateArr) {
  if (!Array.isArray(dateArr) || dateArr.length < 3) return 'Invalid Date';
  const [year, month, day] = dateArr;
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

const TransactionList = ({ transactions, onEdit, onDelete }) => {
  if (!transactions.length) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No transactions yet.</Text>
      </View>
    );
  }

  const renderItem = ({ item }) => (
    <View style={styles.transactionCard}>
      <View style={styles.cardLeft}>
        <View style={[styles.indicator, { backgroundColor: item.credit ? Colors.success : Colors.error }]} />
        <View>
          <Text style={styles.usedFor} numberOfLines={1}>{item.usedFor}</Text>
          <Text style={styles.dateText}>{formatDate(item.date)}</Text>
        </View>
      </View>

      <View style={styles.cardRight}>
        <Text style={[styles.amount, { color: item.credit ? Colors.success : Colors.error }]}>
          {item.credit ? `+${Number(item.credit).toLocaleString()}` : `-${Number(item.debit).toLocaleString()}`}
        </Text>
        <Text style={styles.balanceText}>Balance: {Number(item.balance).toLocaleString()}</Text>

        <View style={styles.actions}>
          <TouchableOpacity onPress={() => onEdit(item)} style={styles.actionBtn}>
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onDelete(item.id)} style={styles.actionBtn}>
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={[...transactions].sort((a, b) => b.id - a.id)}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        scrollEnabled={false} // Since it's inside a ScrollView in Dashboard
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: Spacing.md,
  },
  transactionCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 18,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  indicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: Spacing.md,
  },
  usedFor: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  dateText: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '500',
  },
  cardRight: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  balanceText: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    marginTop: 8,
  },
  actionBtn: {
    marginLeft: 12,
  },
  editText: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  deleteText: {
    color: Colors.error,
    fontSize: 11,
    fontWeight: '700',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default TransactionList;