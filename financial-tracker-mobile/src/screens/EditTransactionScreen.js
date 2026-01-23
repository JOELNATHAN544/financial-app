import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../api';
import { Colors, Spacing, Gradients } from '../constants/Theme';

const EditTransactionScreen = ({ route, navigation }) => {
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
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="close" size={28} color={Colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Edit Transaction</Text>
                </View>

                <View style={styles.typeSelector}>
                    <TouchableOpacity
                        style={[styles.typeBtn, type === 'expense' && styles.typeBtnActiveExpense]}
                        onPress={() => setType('expense')}
                    >
                        <Ionicons name="arrow-up-circle-outline" size={20} color={type === 'expense' ? Colors.white : Colors.error} />
                        <Text style={[styles.typeText, type === 'expense' && styles.typeTextActive]}>Expense</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.typeBtn, type === 'income' && styles.typeBtnActiveIncome]}
                        onPress={() => setType('income')}
                    >
                        <Ionicons name="arrow-down-circle-outline" size={20} color={type === 'income' ? Colors.white : Colors.success} />
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
                            placeholderTextColor={Colors.textMuted}
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
                            placeholderTextColor={Colors.textMuted}
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
                                <ActivityIndicator color={Colors.white} />
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
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
        color: Colors.text,
    },
    typeSelector: {
        flexDirection: 'row',
        backgroundColor: Colors.cardBg,
        borderRadius: 16,
        padding: 6,
        marginBottom: Spacing.xxl,
        borderWidth: 1,
        borderColor: Colors.border,
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
        backgroundColor: Colors.error,
    },
    typeBtnActiveIncome: {
        backgroundColor: Colors.success,
    },
    typeText: {
        color: Colors.textMuted,
        fontWeight: '700',
        marginLeft: 8,
    },
    typeTextActive: {
        color: Colors.white,
    },
    form: {
        flex: 1,
    },
    inputGroup: {
        marginBottom: Spacing.xl,
    },
    label: {
        color: Colors.text,
        fontSize: 15,
        fontWeight: '700',
        marginBottom: Spacing.sm,
        marginLeft: 4,
    },
    input: {
        backgroundColor: Colors.cardBg,
        borderRadius: 16,
        padding: 16,
        fontSize: 17,
        color: Colors.text,
        borderWidth: 1.5,
        borderColor: Colors.border,
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
        color: Colors.white,
        fontSize: 18,
        fontWeight: '800',
    },
});

export default EditTransactionScreen;
