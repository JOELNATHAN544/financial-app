import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import TransactionList from '../components/TransactionList';
import { api } from '../api';
import { Colors, Spacing, Gradients } from '../constants/Theme';

const DashboardScreen = ({ onLogout }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const latestTransaction = [...transactions].sort((a, b) => {
    const dateCompare = new Date(b.date) - new Date(a.date);
    return dateCompare !== 0 ? dateCompare : b.id - a.id;
  })[0];

  const currentBalance = latestTransaction ? Number(latestTransaction.balance) : 0;

  const stats = transactions.reduce((acc, t) => {
    const date = new Date(t.date);
    const now = new Date();
    if (date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
      acc.income += Number(t.credit || 0);
      acc.expenses += Number(t.debit || 0);
    }
    return acc;
  }, { income: 0, expenses: 0 });

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const data = await api.get('/api/transactions');
        setTransactions(data);
      } catch (error) {
        Alert.alert('Error', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/transactions/${id}`);
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      Alert.alert('Delete Error', error.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>FinanceFlow</Text>
          <Text style={styles.dateText}>{new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
        </View>
        <TouchableOpacity onPress={onLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <LinearGradient
          colors={Gradients.premium}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.balanceCard}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.balanceLabel}>Current Balance</Text>
            <View style={styles.chip}>
              <Text style={styles.chipText}>Premium</Text>
            </View>
          </View>
          <Text style={styles.balanceAmount}>{currentBalance.toLocaleString('en-CM')} <Text style={styles.currency}>FCFA</Text></Text>

          <View style={styles.balanceStats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Income</Text>
              <Text style={styles.statValue}>+{stats.income.toLocaleString('en-CM')}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Expenses</Text>
              <Text style={styles.statValue}>-{stats.expenses.toLocaleString('en-CM')}</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.listContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity onPress={() => Alert.alert('History', 'View all transactions')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <TransactionList
            transactions={transactions}
            onEdit={(t) => Alert.alert('Edit', `Edit ${t.usedFor}`)}
            onDelete={handleDelete}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
  },
  dateText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '500',
    marginTop: 2,
  },
  logoutBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: Colors.cardBg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  logoutText: {
    color: Colors.error,
    fontWeight: '700',
    fontSize: 12,
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  balanceCard: {
    marginHorizontal: Spacing.lg,
    padding: Spacing.xl,
    borderRadius: 28,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  chipText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  balanceAmount: {
    color: Colors.white,
    fontSize: 34,
    fontWeight: '800',
    marginBottom: Spacing.xl,
  },
  currency: {
    fontSize: 18,
    fontWeight: '400',
    opacity: 0.8,
  },
  balanceStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: 20,
    padding: Spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  statValue: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '800',
  },
  listContainer: {
    marginTop: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  viewAllText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 13,
  },
});

export default DashboardScreen;