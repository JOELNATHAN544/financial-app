import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    Alert,
    StatusBar,
    TextInput,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../api';
import { Colors, Spacing, Gradients } from '../constants/Theme';
import { useTheme } from '../context/ThemeContext';

const CATEGORIES = [
    'Food', 'Transport', 'Rent', 'Utilities', 'Entertainment',
    'Shopping', 'Health', 'Investment', 'Education', 'Others'
];

const FREQUENCIES = ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'];

const RecurringScreen = () => {
    const { colors, isDark } = useTheme();
    const styles = getStyles(colors, isDark);
    const [recurring, setRecurring] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        description: '',
        category: 'Others',
        amount: '',
        frequency: 'MONTHLY',
    });

    const fetchRecurring = async () => {
        try {
            const data = await api.get('/api/recurring');
            setRecurring(data);
        } catch (error) {
            console.error('Error fetching recurring:', error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchRecurring();
        }, [])
    );

    const handleSubmit = async () => {
        if (!formData.description || !formData.amount) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }

        try {
            await api.post('/api/recurring', {
                ...formData,
                amount: parseFloat(formData.amount),
                currency: 'XAF',
            });
            Alert.alert('Success', 'Recurring transaction scheduled!');
            setFormData({ description: '', category: 'Others', amount: '', frequency: 'MONTHLY' });
            setShowForm(false);
            fetchRecurring();
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    const handleDelete = async (id) => {
        Alert.alert(
            'Confirm Delete',
            'Delete this recurring transaction?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/api/recurring/${id}`);
                            fetchRecurring();
                        } catch (error) {
                            Alert.alert('Error', error.message);
                        }
                    }
                },
            ]
        );
    };

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
                <Text style={styles.headerTitle}>Recurring</Text>
                <TouchableOpacity
                    onPress={() => setShowForm(!showForm)}
                    style={styles.addBtn}
                >
                    <Ionicons name={showForm ? "close" : "add"} size={24} color={colors.white} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {showForm && (
                    <View style={styles.formCard}>
                        <Text style={styles.formTitle}>Schedule Recurring</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Description</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.description}
                                onChangeText={(text) => setFormData({ ...formData, description: text })}
                                placeholder="e.g. Netflix Subscription"
                                placeholderTextColor={colors.textMuted}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Category</Text>
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

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Amount (FCFA)</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.amount}
                                onChangeText={(text) => setFormData({ ...formData, amount: text })}
                                placeholder="e.g. 5000"
                                placeholderTextColor={colors.textMuted}
                                keyboardType="numeric"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Frequency</Text>
                            <View style={styles.frequencyContainer}>
                                {FREQUENCIES.map(freq => (
                                    <TouchableOpacity
                                        key={freq}
                                        style={[
                                            styles.freqChip,
                                            formData.frequency === freq && styles.freqChipActive
                                        ]}
                                        onPress={() => setFormData({ ...formData, frequency: freq })}
                                    >
                                        <Text style={[
                                            styles.freqText,
                                            formData.frequency === freq && styles.freqTextActive
                                        ]}>{freq}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <TouchableOpacity onPress={handleSubmit}>
                            <LinearGradient
                                colors={Gradients.indigo}
                                style={styles.submitBtn}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                <Text style={styles.submitText}>Add Recurring</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                )}

                {recurring.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="repeat-outline" size={64} color={colors.textMuted} />
                        <Text style={styles.emptyText}>No recurring transactions</Text>
                        <Text style={styles.emptyHint}>Tap + to schedule automatic payments</Text>
                    </View>
                ) : (
                    <View style={styles.recurringList}>
                        {recurring.map((item) => (
                            <View key={item.id} style={styles.recurringCard}>
                                <View style={styles.cardHeader}>
                                    <View>
                                        <Text style={styles.frequency}>{item.frequency}</Text>
                                        <Text style={styles.description}>{item.description}</Text>
                                    </View>
                                    <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
                                        <Ionicons name="trash-outline" size={20} color={colors.error} />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.cardFooter}>
                                    <Text style={styles.category}>{item.category}</Text>
                                    <Text style={styles.amount}>{Number(item.amount).toLocaleString()} FCFA</Text>
                                </View>

                                <View style={styles.nextRun}>
                                    <Ionicons name="calendar-outline" size={12} color={colors.textMuted} />
                                    <Text style={styles.nextRunText}>
                                        Next: {new Date(item.nextRunDate).toLocaleDateString()}
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
        paddingVertical: Spacing.xl,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: colors.text,
    },
    addBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: Spacing.lg,
        paddingBottom: 100,
    },
    formCard: {
        backgroundColor: colors.cardBg,
        borderRadius: 20,
        padding: Spacing.lg,
        marginBottom: Spacing.xl,
        borderWidth: 1,
        borderColor: colors.border,
    },
    formTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: colors.text,
        marginBottom: Spacing.lg,
    },
    inputGroup: {
        marginBottom: Spacing.lg,
    },
    label: {
        color: colors.text,
        fontSize: 14,
        fontWeight: '700',
        marginBottom: Spacing.sm,
        marginLeft: 4,
    },
    input: {
        backgroundColor: colors.cardBg,
        borderRadius: 16,
        padding: 16,
        fontSize: 16,
        color: colors.text,
        borderWidth: 1.5,
        borderColor: colors.border,
    },
    categoryScroll: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    categoryChip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 10,
        backgroundColor: colors.cardBg,
        borderWidth: 1.5,
        borderColor: colors.border,
        marginRight: 8,
    },
    categoryChipActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    categoryText: {
        color: colors.textMuted,
        fontWeight: '700',
        fontSize: 12,
    },
    categoryTextActive: {
        color: colors.white,
    },
    frequencyContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    freqChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: colors.cardBg,
        borderWidth: 1.5,
        borderColor: colors.border,
    },
    freqChipActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    freqText: {
        color: colors.textMuted,
        fontWeight: '700',
        fontSize: 12,
    },
    freqTextActive: {
        color: colors.white,
    },
    submitBtn: {
        borderRadius: 16,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
    },
    submitText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '800',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 80,
    },
    emptyText: {
        color: colors.text,
        fontSize: 16,
        fontWeight: '700',
        marginTop: 16,
    },
    emptyHint: {
        color: colors.textMuted,
        fontSize: 13,
        marginTop: 8,
    },
    recurringList: {
        gap: 16,
    },
    recurringCard: {
        backgroundColor: colors.cardBg,
        borderRadius: 20,
        padding: Spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    frequency: {
        fontSize: 10,
        fontWeight: '900',
        color: colors.primary,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginBottom: 4,
    },
    description: {
        fontSize: 18,
        fontWeight: '800',
        color: colors.text,
    },
    deleteBtn: {
        padding: 4,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    category: {
        color: colors.textMuted,
        fontSize: 13,
        fontWeight: '600',
    },
    amount: {
        color: colors.error,
        fontSize: 15,
        fontWeight: '900',
    },
    nextRun: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        gap: 6,
    },
    nextRunText: {
        color: colors.textMuted,
        fontSize: 10,
        fontWeight: '700',
        fontFamily: 'monospace',
    },
});

export default RecurringScreen;
