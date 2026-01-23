import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ActivityIndicator,
    Alert,
    FlatList,
    StatusBar,
    TextInput,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../api';
import { Colors, Spacing, Gradients } from '../constants/Theme';

const CATEGORIES = [
    'Food', 'Transport', 'Rent', 'Utilities', 'Entertainment',
    'Shopping', 'Health', 'Investment', 'Education', 'Others'
];

const BudgetsScreen = () => {
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ category: '', amount: '' });
    const [showForm, setShowForm] = useState(false);

    const fetchBudgets = async () => {
        try {
            const data = await api.get('/api/budgets/current');
            setBudgets(data);
        } catch (error) {
            console.error('Error fetching budgets:', error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchBudgets();
        }, [])
    );

    const handleSetBudget = async () => {
        if (!formData.category || !formData.amount) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }

        try {
            await api.post('/api/budgets', {
                category: formData.category,
                amount: parseFloat(formData.amount),
            });
            Alert.alert('Success', 'Budget updated!');
            setFormData({ category: '', amount: '' });
            setShowForm(false);
            fetchBudgets();
        } catch (error) {
            Alert.alert('Error', error.message);
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
                <Text style={styles.headerTitle}>Monthly Budgets</Text>
                <TouchableOpacity
                    onPress={() => setShowForm(!showForm)}
                    style={styles.addBtn}
                >
                    <Ionicons name={showForm ? "close" : "add"} size={24} color={Colors.white} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {showForm && (
                    <View style={styles.formCard}>
                        <Text style={styles.formTitle}>Set Budget</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Category</Text>
                            <View style={styles.pickerContainer}>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                                    {CATEGORIES.map(cat => (
                                        <TouchableOpacity
                                            key={cat}
                                            style={[
                                                styles.categoryChip,
                                                formData.category === cat && styles.categoryChipActive
                                            ]}
                                            onPress={() => setFormData({ ...formData, category: cat })}
                                        >
                                            <Text style={[
                                                styles.categoryText,
                                                formData.category === cat && styles.categoryTextActive
                                            ]}>{cat}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Monthly Limit (FCFA)</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.amount}
                                onChangeText={(text) => setFormData({ ...formData, amount: text })}
                                placeholder="e.g. 50000"
                                placeholderTextColor={Colors.textMuted}
                                keyboardType="numeric"
                            />
                        </View>

                        <TouchableOpacity onPress={handleSetBudget}>
                            <LinearGradient
                                colors={Gradients.indigo}
                                style={styles.submitBtn}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                <Text style={styles.submitText}>Set Budget</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                )}

                {budgets.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="pie-chart-outline" size={64} color={Colors.textMuted} />
                        <Text style={styles.emptyText}>No budgets set for this month</Text>
                        <Text style={styles.emptyHint}>Tap + to create your first budget</Text>
                    </View>
                ) : (
                    <View style={styles.budgetList}>
                        {budgets.map((budget) => (
                            <View key={budget.category} style={styles.budgetCard}>
                                <View style={styles.budgetHeader}>
                                    <Text style={styles.budgetCategory}>{budget.category}</Text>
                                    <Text style={[
                                        styles.budgetPercent,
                                        { color: budget.percent > 100 ? Colors.error : Colors.textMuted }
                                    ]}>
                                        {budget.percent}%
                                    </Text>
                                </View>

                                <View style={styles.progressBar}>
                                    <View style={[
                                        styles.progressFill,
                                        {
                                            width: `${Math.min(budget.percent, 100)}%`,
                                            backgroundColor: budget.percent > 100 ? Colors.error : Colors.primary
                                        }
                                    ]} />
                                </View>

                                <View style={styles.budgetFooter}>
                                    <Text style={styles.budgetAmount}>
                                        Spent: {budget.actual.toLocaleString()} FCFA
                                    </Text>
                                    <Text style={styles.budgetAmount}>
                                        Limit: {budget.budgeted.toLocaleString()} FCFA
                                    </Text>
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
    addBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: Spacing.lg,
        paddingBottom: 100,
    },
    formCard: {
        backgroundColor: Colors.cardBg,
        borderRadius: 20,
        padding: Spacing.lg,
        marginBottom: Spacing.xl,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    formTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: Colors.text,
        marginBottom: Spacing.lg,
    },
    inputGroup: {
        marginBottom: Spacing.lg,
    },
    label: {
        color: Colors.text,
        fontSize: 14,
        fontWeight: '700',
        marginBottom: Spacing.sm,
        marginLeft: 4,
    },
    pickerContainer: {
        marginBottom: 8,
    },
    categoryScroll: {
        flexDirection: 'row',
    },
    categoryChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: Colors.cardBg,
        borderWidth: 1.5,
        borderColor: Colors.border,
        marginRight: 8,
    },
    categoryChipActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    categoryText: {
        color: Colors.textMuted,
        fontWeight: '700',
        fontSize: 13,
    },
    categoryTextActive: {
        color: Colors.white,
    },
    input: {
        backgroundColor: Colors.cardBg,
        borderRadius: 16,
        padding: 16,
        fontSize: 16,
        color: Colors.text,
        borderWidth: 1.5,
        borderColor: Colors.border,
    },
    submitBtn: {
        borderRadius: 16,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
    },
    submitText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: '800',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 80,
    },
    emptyText: {
        color: Colors.text,
        fontSize: 16,
        fontWeight: '700',
        marginTop: 16,
    },
    emptyHint: {
        color: Colors.textMuted,
        fontSize: 13,
        marginTop: 8,
    },
    budgetList: {
        gap: 16,
    },
    budgetCard: {
        backgroundColor: Colors.cardBg,
        borderRadius: 20,
        padding: Spacing.lg,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    budgetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    budgetCategory: {
        color: Colors.text,
        fontSize: 18,
        fontWeight: '800',
    },
    budgetPercent: {
        fontSize: 14,
        fontWeight: '800',
    },
    progressBar: {
        height: 8,
        backgroundColor: Colors.border,
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 12,
    },
    progressFill: {
        height: '100%',
        borderRadius: 4,
    },
    budgetFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    budgetAmount: {
        color: Colors.textMuted,
        fontSize: 11,
        fontWeight: '700',
        fontFamily: 'monospace',
    },
});

export default BudgetsScreen;
