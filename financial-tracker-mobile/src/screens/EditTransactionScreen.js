import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../api';
import { Colors, Spacing, Gradients } from '../constants/Theme';
import { useTheme } from '../context/ThemeContext';

const EditTransactionScreen = ({ route, navigation }) => {
    const { colors, isDark } = useTheme();
    const styles = getStyles(colors, isDark);
    const { transaction } = route.params;
    const [type, setType] = useState(transaction.credit > 0 ? 'income' : 'expense');
    const [amount, setAmount] = useState(
        String(transaction.credit > 0 ? transaction.credit : transaction.debit)
    );
    const [description, setDescription] = useState(transaction.usedFor);
    const [loading, setLoading] = useState(false);

    const handleUpdate = async () => {
        if (!amount || !description) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        const payload = {
            ...transaction,
            usedFor: description,
            debit: type === 'expense' ? parseFloat(amount) : 0,
            credit: type === 'income' ? parseFloat(amount) : 0,
        };

        setLoading(true);
        try {
            await api.put(`/api/transactions/${transaction.id}`, payload);
            Alert.alert('Success', 'Transaction updated!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="close" size={28} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Edit Transaction</Text>
                </View>

                <View style={styles.typeSelector}>
                    <TouchableOpacity
                        style={[styles.typeBtn, type === 'expense' && styles.typeBtnActiveExpense]}
                        onPress={() => setType('expense')}
                    >
                        <Ionicons name="arrow-up-circle-outline" size={20} color={type === 'expense' ? colors.white : colors.error} />
                        <Text style={[styles.typeText, type === 'expense' && styles.typeTextActive]}>Expense</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.typeBtn, type === 'income' && styles.typeBtnActiveIncome]}
                        onPress={() => setType('income')}
                    >
                        <Ionicons name="arrow-down-circle-outline" size={20} color={type === 'income' ? colors.white : colors.success} />
                        <Text style={[styles.typeText, type === 'income' && styles.typeTextActive]}>Income</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Amount (FCFA)</Text>
                        <TextInput
                            style={styles.input}
                            value={amount}
                            onChangeText={setAmount}
                            placeholder="0.00"
                            placeholderTextColor={colors.textMuted}
                            keyboardType="numeric"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Description</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={description}
                            onChangeText={setDescription}
                            placeholder="What was this for?"
                            placeholderTextColor={colors.textMuted}
                            multiline
                        />
                    </View>

                    <TouchableOpacity
                        onPress={handleUpdate}
                        disabled={loading}
                        style={styles.submitBtnWrapper}
                    >
                        <LinearGradient
                            colors={type === 'income' ? ['#22c55e', '#15803d'] : Gradients.indigo}
                            style={styles.submitBtn}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            {loading ? (
                                <ActivityIndicator color={colors.white} />
                            ) : (
                                <Text style={styles.submitBtnText}>Update Transaction</Text>
                            )}
                        </LinearGradient>
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
    scrollContent: {
        padding: Spacing.lg,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.xl,
        marginTop: Spacing.md,
    },
    backBtn: {
        marginRight: 16,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: colors.text,
    },
    typeSelector: {
        flexDirection: 'row',
        backgroundColor: colors.cardBg,
        borderRadius: 16,
        padding: 6,
        marginBottom: Spacing.xxl,
        borderWidth: 1,
        borderColor: colors.border,
    },
    typeBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
    },
    typeBtnActiveExpense: {
        backgroundColor: colors.error,
    },
    typeBtnActiveIncome: {
        backgroundColor: colors.success,
    },
    typeText: {
        color: colors.textMuted,
        fontWeight: '700',
        marginLeft: 8,
    },
    typeTextActive: {
        color: colors.white,
    },
    form: {
        flex: 1,
    },
    inputGroup: {
        marginBottom: Spacing.xl,
    },
    label: {
        color: colors.text,
        fontSize: 15,
        fontWeight: '700',
        marginBottom: Spacing.sm,
        marginLeft: 4,
    },
    input: {
        backgroundColor: colors.cardBg,
        borderRadius: 16,
        padding: 16,
        fontSize: 17,
        color: colors.text,
        borderWidth: 1.5,
        borderColor: colors.border,
    },
    textArea: {
        height: 120,
        textAlignVertical: 'top',
    },
    submitBtnWrapper: {
        marginTop: Spacing.xxl,
    },
    submitBtn: {
        borderRadius: 18,
        height: 64,
        justifyContent: 'center',
        alignItems: 'center',
    },
    submitBtnText: {
        color: colors.white,
        fontSize: 18,
        fontWeight: '800',
    },
});

export default EditTransactionScreen;
