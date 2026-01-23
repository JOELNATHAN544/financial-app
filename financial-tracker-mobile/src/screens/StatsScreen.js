import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ActivityIndicator,
    StatusBar,
    ScrollView,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../api';
import { Colors, Spacing } from '../constants/Theme';

const StatsScreen = () => {
    const [categoryData, setCategoryData] = useState([]);
    const [budgets, setBudgets] = useState([]);
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [categories, budgetData, advisor] = await Promise.all([
                api.get('/api/reports/expense-by-category'),
                api.get('/api/budgets/current'),
                api.get('/api/advisor/insights')
            ]);
            setCategoryData(categories);
            setBudgets(budgetData);
            setInsights(advisor);
        } catch (error) {
            console.error('Failed to load stats:', error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [])
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>Analyzing your finances...</Text>
            </View>
        );
    }

    const totalExpenses = categoryData.reduce((sum, cat) => sum + (cat.amount || 0), 0);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Insights</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* AI Advisor Insights */}
                {insights && (
                    <View style={styles.insightCard}>
                        <View style={styles.insightHeader}>
                            <Ionicons name="bulb" size={24} color="#f59e0b" />
                            <Text style={styles.insightTitle}>Financial Advisor</Text>
                        </View>
                        <Text style={styles.insightText}>{insights.advice}</Text>
                    </View>
                )}

                {/* Expense Breakdown */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Expense by Category</Text>
                    {categoryData.length === 0 ? (
                        <Text style={styles.emptyText}>No expense data yet</Text>
                    ) : (
                        categoryData.map((cat, index) => {
                            const amount = cat.amount || 0;
                            const percent = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
                            return (
                                <View key={index} style={styles.categoryItem}>
                                    <View style={styles.categoryHeader}>
                                        <Text style={styles.categoryName}>{cat.category || 'Unknown'}</Text>
                                        <Text style={styles.categoryAmount}>{amount.toLocaleString()} FCFA</Text>
                                    </View>
                                    <View style={styles.progressBar}>
                                        <LinearGradient
                                            colors={['#6366f1', '#8b5cf6']}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                            style={[styles.progressFill, { width: `${percent}%` }]}
                                        />
                                    </View>
                                    <Text style={styles.percentText}>{percent.toFixed(1)}%</Text>
                                </View>
                            );
                        })
                    )}
                </View>

                {/* Budget Status */}
                {budgets.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Budget Health</Text>
                        {budgets.map((budget, index) => (
                            <View key={index} style={styles.budgetItem}>
                                <View style={styles.budgetHeader}>
                                    <Text style={styles.budgetName}>{budget.category}</Text>
                                    <Text style={[
                                        styles.budgetPercent,
                                        { color: budget.percent > 100 ? Colors.error : Colors.success }
                                    ]}>
                                        {budget.percent}%
                                    </Text>
                                </View>
                                <View style={styles.budgetBar}>
                                    <View style={[
                                        styles.budgetFill,
                                        {
                                            width: `${Math.min(budget.percent, 100)}%`,
                                            backgroundColor: budget.percent > 100 ? Colors.error : Colors.success
                                        }
                                    ]} />
                                </View>
                            </View>
                        ))}
                    </View>
                )}
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
    loadingText: {
        color: Colors.textMuted,
        fontSize: 12,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginTop: 16,
    },
    header: {
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.xl,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: Colors.text,
    },
    content: {
        padding: Spacing.lg,
        paddingBottom: 100,
    },
    insightCard: {
        backgroundColor: Colors.cardBg,
        borderRadius: 20,
        padding: Spacing.lg,
        marginBottom: Spacing.xl,
        borderWidth: 1,
        borderColor: '#f59e0b44',
    },
    insightHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    insightTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#f59e0b',
        marginLeft: 12,
    },
    insightText: {
        fontSize: 14,
        lineHeight: 22,
        color: Colors.text,
        fontWeight: '600',
    },
    section: {
        marginBottom: Spacing.xxl,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: Colors.text,
        marginBottom: Spacing.lg,
    },
    emptyText: {
        color: Colors.textMuted,
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
        paddingVertical: Spacing.xl,
    },
    categoryItem: {
        backgroundColor: Colors.cardBg,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    categoryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    categoryName: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.text,
    },
    categoryAmount: {
        fontSize: 14,
        fontWeight: '800',
        color: Colors.primary,
        fontFamily: 'monospace',
    },
    progressBar: {
        height: 8,
        backgroundColor: Colors.border,
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressFill: {
        height: '100%',
        borderRadius: 4,
    },
    percentText: {
        fontSize: 11,
        fontWeight: '700',
        color: Colors.textMuted,
        textAlign: 'right',
    },
    budgetItem: {
        backgroundColor: Colors.cardBg,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    budgetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    budgetName: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.text,
    },
    budgetPercent: {
        fontSize: 14,
        fontWeight: '900',
    },
    budgetBar: {
        height: 6,
        backgroundColor: Colors.border,
        borderRadius: 3,
        overflow: 'hidden',
    },
    budgetFill: {
        height: '100%',
        borderRadius: 3,
    },
});

export default StatsScreen;
