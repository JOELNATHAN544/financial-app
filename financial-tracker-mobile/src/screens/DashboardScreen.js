import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import TransactionList from '../components/TransactionList';
import { api } from '../api';

const DashboardScreen = ({ onLogout, jwtToken }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentBalance = transactions.length > 0
    ? Number(transactions[0].balance)
    : 0;

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const data = await api.get('/api/transactions', jwtToken);
        setTransactions(data);
      } catch (error) {
        Alert.alert('Error', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [jwtToken]);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/transactions/${id}`, jwtToken);
      setTransactions(transactions.filter(t => t.id !== id));
    } catch (error) {
      Alert.alert('Delete Error', error.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Hello, Nathan</Text>
          <Text style={styles.dateText}>{new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
        </View>
        <TouchableOpacity onPress={onLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Current Balance</Text>
        <Text style={styles.balanceAmount}>{currentBalance.toLocaleString('en-CM')} FCFA</Text>
        <View style={styles.balanceStats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Monthly Income</Text>
            <Text style={styles.statValue}>+0 FCFA</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Monthly Expenses</Text>
            <Text style={styles.statValue}>-0 FCFA</Text>
          </View>
        </View>
      </View>

      <View style={styles.listContainer}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        <TransactionList
          transactions={transactions}
          onEdit={(t) => Alert.alert('Edit', `Edit ${t.usedFor}`)}
          onDelete={handleDelete}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  dateText: {
    fontSize: 14,
    color: '#64748b',
  },
  logoutBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#fee2e2',
  },
  logoutText: {
    color: '#ef4444',
    fontWeight: '600',
  },
  balanceCard: {
    marginHorizontal: 20,
    padding: 24,
    borderRadius: 24,
    backgroundColor: '#6366f1',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  balanceLabel: {
    color: '#e0e7ff',
    fontSize: 14,
    fontWeight: '600',
  },
  balanceAmount: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '800',
    marginVertical: 8,
  },
  balanceStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    color: '#e0e7ff',
    fontSize: 10,
    textTransform: 'uppercase',
  },
  statValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
  },
  listContainer: {
    flex: 1,
    marginTop: 32,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
});

export default DashboardScreen; 