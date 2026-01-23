import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../api';
import { Spacing, Gradients } from '../constants/Theme';
import { useTheme } from '../context/ThemeContext';

const DashboardScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [insights, setInsights] = useState(null);
  const [categories, setCategories] = useState([]);
  const [latestTransactions, setLatestTransactions] = useState([]);
  const [forecast, setForecast] = useState(null);

  const fetchData = async () => {
    try {
      const insightsData = await api.get('/api/advisor/insights');
      setInsights(insightsData);
      setForecast(insightsData.stats);

      const catData = await api.get('/api/reports/expense-by-category');
      setCategories(catData);

      const txData = await api.get('/api/transactions');
      setLatestTransactions(txData);

    } catch (error) {
      console.error('Fetch Error:', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  const currentBalance = latestTransactions.reduce((acc, t) => {
    return acc + (Number(t.credit || 0) - Number(t.debit || 0));
  }, 0);

  const stats = latestTransactions.reduce((acc, t) => {
    const date = new Date(t.date);
    const now = new Date();
    if (date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
      acc.income += Number(t.credit || 0);
      acc.expenses += Number(t.debit || 0);
    }
    return acc;
  }, { income: 0, expenses: 0 });

  const totalExpenses = categories.reduce((sum, c) => sum + (c.amount || 0), 0);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* StatusBar controlled by App.js but can force specific style here if needed */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>FinanceFlow</Text>
          <Text style={styles.dateText}>{new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('Settings')}
          style={styles.profileBtn}
        >
          <View style={styles.profileCircle}>
            <Ionicons name="person" size={20} color={colors.primary} />
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Balance Card - Always Dark Text on Gradient */}
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
          {(() => {
            const formattedList = currentBalance.toLocaleString('en-CM');
            const len = formattedList.length;
            let fontSize = 38;
            if (len > 10) fontSize = 32;
            if (len > 13) fontSize = 26;
            if (len > 15) fontSize = 22;

            return (
              <Text style={[styles.balanceAmount, { fontSize }]} numberOfLines={1} adjustsFontSizeToFit>
                {formattedList} <Text style={[styles.currency, { fontSize: fontSize * 0.6 }]}>FCFA</Text>
              </Text>
            );
          })()}

          <View style={styles.balanceStats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Income (Mo)</Text>
              <Text style={styles.statValue}>+ {stats.income.toLocaleString('en-CM')}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Expenses (Mo)</Text>
              <Text style={styles.statValue}>- {stats.expenses.toLocaleString('en-CM')}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Quick Actions */}
        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Add')}>
            <LinearGradient colors={['#6366f1', '#4f46e5']} style={styles.actionIcon}>
              <Ionicons name="add" size={24} color={'#fff'} />
            </LinearGradient>
            <Text style={styles.actionLabel}>Add</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Transactions')}>
            <View style={styles.actionIconGray}>
              <Ionicons name="swap-horizontal" size={22} color={colors.text} />
            </View>
            <Text style={styles.actionLabel}>History</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Stats')}>
            <View style={styles.actionIconGray}>
              <Ionicons name="bar-chart" size={22} color={colors.text} />
            </View>
            <Text style={styles.actionLabel}>Stats</Text>
          </TouchableOpacity>
        </View>

        {/* AI Smart Advisor */}
        {insights?.advice && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Smart Advisor</Text>
            <View style={styles.advisorCard}>
              <View style={styles.advisorHeader}>
                <Ionicons name="sparkles" size={20} color="#f59e0b" />
                <Text style={styles.advisorTitle}>AI Insights</Text>
              </View>
              {insights.advice.slice(0, 2).map((item, idx) => (
                <Text key={idx} style={styles.advisorText}>• {item}</Text>
              ))}
            </View>
          </View>
        )}

        {/* Balance Forecast */}
        {forecast && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Balance Forecast</Text>
            {/* Forecast Card: Use consistent card bg in light mode, or dark gradient if desired. keeping gradient for pop */}
            <LinearGradient colors={isDark ? ['#0f172a', '#1e293b'] : ['#f1f5f9', '#ffffff']} style={styles.forecastCard}>
              <View style={styles.forecastRow}>
                <View>
                  <Text style={styles.forecastLabel}>Projected End of Month</Text>
                  <Text style={styles.forecastValue}>
                    {Number(forecast.projectedEndOfMonthBalance || 0).toLocaleString('en-CM')} FCFA
                  </Text>
                </View>
                <Ionicons
                  name={forecast.spendingTrend === 'SAVING' ? "trending-up" : "trending-down"}
                  size={32}
                  color={forecast.spendingTrend === 'SAVING' ? colors.success : colors.error}
                />
              </View>
              <Text style={styles.trendText}>
                Trend: <Text style={{ color: colors.text }}>{forecast.spendingTrend || 'Stable'}</Text>
              </Text>
            </LinearGradient>
          </View>
        )}

        {/* Expenses by Category */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Expenses by Category</Text>
          {categories.length === 0 ? (
            <Text style={styles.emptyText}>No data available yet.</Text>
          ) : (
            categories.slice(0, 4).map((cat, index) => {
              const percent = totalExpenses > 0 ? ((cat.amount || 0) / totalExpenses) * 100 : 0;
              return (
                <View key={index} style={styles.catItem}>
                  <View style={styles.catHeader}>
                    <Text style={styles.catName}>{cat.category}</Text>
                    <Text style={styles.catPercent}>{percent.toFixed(1)}%</Text>
                  </View>
                  <View style={styles.catBarBg}>
                    <LinearGradient
                      colors={['#8b5cf6', '#ec4899']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[styles.catBarFill, { width: `${percent}%` }]}
                    />
                  </View>
                </View>
              );
            })
          )}
          <TouchableOpacity onPress={() => navigation.navigate('Stats')} style={styles.seeMoreBtn}>
            <Text style={styles.seeMoreText}>View All Analytics</Text>
            <Ionicons name="arrow-forward" size={14} color={colors.primary} />
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const getStyles = (colors, isDark) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
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
    fontSize: 26,
    fontWeight: '900',
    color: colors.text,
  },
  dateText: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '600',
    marginTop: 2,
  },
  profileBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.cardBg,
    borderWidth: 1.5,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileCircle: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  balanceCard: {
    marginHorizontal: Spacing.lg,
    padding: Spacing.xl,
    borderRadius: 32,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  chipText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '900',
  },
  balanceAmount: {
    color: '#ffffff',
    fontSize: 38,
    fontWeight: '900',
    marginBottom: Spacing.xl,
  },
  currency: {
    fontSize: 20,
    fontWeight: '500',
    opacity: 0.8,
  },
  balanceStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 24,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 34,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  statValue: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  actionBtn: {
    alignItems: 'center',
  },
  actionIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionIconGray: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: colors.cardBg,
    borderWidth: 1.5,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  sectionContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginBottom: Spacing.md,
  },
  advisorCard: {
    backgroundColor: colors.cardBg,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: isDark ? '#f59e0b44' : '#f59e0b22',
  },
  advisorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  advisorTitle: {
    color: '#f59e0b',
    fontSize: 16,
    fontWeight: '800',
    marginLeft: 8,
  },
  advisorText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 6,
  },
  forecastCard: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  forecastRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  forecastLabel: {
    color: colors.textMuted,
    fontSize: 14,
    marginBottom: 4,
  },
  forecastValue: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '700',
  },
  trendText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  catItem: {
    marginBottom: 12,
  },
  catHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  catName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  catPercent: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '700',
  },
  catBarBg: {
    height: 8,
    backgroundColor: colors.cardBg,
    borderRadius: 4,
    overflow: 'hidden',
  },
  catBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  seeMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  seeMoreText: {
    color: colors.primary,
    fontWeight: '700',
    marginRight: 4,
  },
  emptyText: {
    color: colors.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 10,
  }
});

export default DashboardScreen;