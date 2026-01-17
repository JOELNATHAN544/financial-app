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

  const handleEdit = (transaction) => {
    Alert.alert('Edit', `Edit transaction: ${transaction.usedFor}`);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/transactions/${id}`, jwtToken);
      setTransactions(transactions.filter(t => t.id !== id));
    } catch (error) {
      Alert.alert('Delete Error', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Financial Tracker</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.welcomeText}>Welcome to your Financial Dashboard!</Text>
        <Text style={styles.subtitleText}>
          Your transactions and financial data will appear here.
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color="#6366f1" style={{ marginTop: 40 }} />
        ) : (
          <TransactionList transactions={transactions} onEdit={handleEdit} onDelete={handleDelete} />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  logoutText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
    color: '#1f2937',
  },
  subtitleText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#6b7280',
  },
});

export default DashboardScreen; 