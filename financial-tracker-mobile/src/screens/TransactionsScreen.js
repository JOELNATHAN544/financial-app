import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    Alert,
    FlatList,
    StatusBar,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../api';
import { useTheme } from '../context/ThemeContext';

const TransactionsScreen = () => {
    const { colors, isDark } = useTheme();
    const styles = getStyles(colors, isDark);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();

    const fetchTransactions = async () => {
        try {
            const data = await api.get('/api/transactions');

            // Calculate running balance
            // 1. Sort Ascending (Oldest first)
            const sortedAsc = [...data].sort((a, b) => {
                const dateA = new Date(Array.isArray(a.date) ? new Date(a.date[0], a.date[1] - 1, a.date[2]) : a.date);
                const dateB = new Date(Array.isArray(b.date) ? new Date(b.date[0], b.date[1] - 1, b.date[2]) : b.date);
                return dateA - dateB || a.id - b.id;
            });

            let runningBalance = 0;
            const withBalance = sortedAsc.map(t => {
                const credit = Number(t.credit || 0);
                const debit = Number(t.debit || 0);
                runningBalance += (credit - debit);
                return { ...t, runningBalance };
            });

            // 2. Sort Descending for Display (Newest first)
            const sortedDesc = withBalance.reverse();

            setTransactions(sortedDesc);
        } catch (error) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchTransactions();
        });
        return unsubscribe;
    }, [navigation]);

    const handleDelete = async (id) => {
        Alert.alert(
            'Confirm Delete',
            'Are you sure you want to delete this transaction?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/api/transactions/${id}`);
                            // Re-fetch to recalculate running balances correctly
                            fetchTransactions();
                        } catch (error) {
                            Alert.alert('Delete Error', error.message);
                        }
                    }
                },
            ]
        );
    };

    const formatDate = (date) => {
        if (!date) return 'Unknown Date';
        if (Array.isArray(date)) {
            // [year, month, day]
            return new Date(date[0], date[1] - 1, date[2]).toLocaleDateString();
        }
        return new Date(date).toLocaleDateString();
    }

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.transactionCard}
            onPress={() => navigation.navigate('EditTransaction', { transaction: item })}
        >
            <View style={[styles.iconContainer, { backgroundColor: item.credit > 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)' }]}>
                <Ionicons
                    name={item.credit > 0 ? "arrow-down-outline" : "arrow-up-outline"}
                    size={20}
                    color={item.credit > 0 ? "#22c55e" : "#ef4444"}
                />
            </View>
            <View style={styles.details}>
                <Text style={styles.usedFor}>{item.usedFor}</Text>
                <Text style={styles.category}>{item.category || 'Uncategorized'}</Text>
                <Text style={styles.date}>{formatDate(item.date)}</Text>
            </View>
            <View style={styles.amountContainer}>
                <Text style={[styles.amount, { color: item.credit > 0 ? "#22c55e" : "#ef4444" }]}>
                    {item.credit > 0 ? `+${item.credit.toLocaleString()}` : `-${item.debit.toLocaleString()}`}
                </Text>
                <Text style={styles.runningBal}>
                    Bal: {item.runningBalance?.toLocaleString()}
                </Text>
                <View style={styles.actions}>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('EditTransaction', { transaction: item })}
                        style={styles.actionBtn}
                    >
                        <Ionicons name="pencil-outline" size={16} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => handleDelete(item.id)}
                        style={styles.actionBtn}
                    >
                        <Ionicons name="trash-outline" size={16} color={colors.error} />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Transactions</Text>
            </View>

            <FlatList
                data={transactions}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="receipt-outline" size={64} color={colors.textMuted} />
                        <Text style={styles.emptyText}>No transactions found</Text>
                    </View>
                }
            />
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
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.xl,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: colors.text,
    },
    listContent: {
        padding: Spacing.lg,
        paddingBottom: 100,
    },
    transactionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.cardBg,
        borderRadius: 18,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    details: {
        flex: 1,
    },
    usedFor: {
        color: colors.text,
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 2,
    },
    category: {
        color: colors.primary,
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 2,
    },
    date: {
        color: colors.textMuted,
        fontSize: 12,
        fontWeight: '500',
    },
    amountContainer: {
        alignItems: 'flex-end',
    },
    amount: {
        fontSize: 16,
        fontWeight: '800',
        marginBottom: 2,
    },
    runningBal: {
        fontSize: 11,
        color: colors.textMuted,
        fontWeight: '600',
        marginBottom: 4,
    },
    actions: {
        flexDirection: 'row',
        marginTop: 8,
    },
    actionBtn: {
        padding: 6,
        marginLeft: 8,
        backgroundColor: colors.cardBg,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
    },
    emptyText: {
        color: colors.textMuted,
        fontSize: 16,
        fontWeight: '600',
        marginTop: 16,
    },
});

export default TransactionsScreen;
