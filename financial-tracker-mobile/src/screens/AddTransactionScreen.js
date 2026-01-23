import React, { useState } from 'react';
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
import { useAudio } from 'expo-audio';
import { api } from '../api';
import { Colors, Spacing, Gradients } from '../constants/Theme';
import { useTheme } from '../context/ThemeContext';

const CATEGORIES = [
    'Food', 'Transport', 'Rent', 'Utilities', 'Entertainment',
    'Shopping', 'Health', 'Investment', 'Education', 'Others'
];

const AddTransactionScreen = ({ navigation }) => {
    const { colors, isDark } = useTheme();
    const styles = getStyles(colors, isDark);
    const [type, setType] = useState('expense'); // 'income' or 'expense'
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Others');
    const [loading, setLoading] = useState(false);

    const successAudio = useAudio({ uri: 'https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3' });

    const playSuccessSound = async () => {
        try {
            successAudio.play();
        } catch (error) {
            console.log('Error playing sound:', error);
        }
    };

    const handleAdd = async () => {
        if (!amount || !description) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        const payload = {
            usedFor: description,
            category: category,
            date: new Date().toISOString().split('T')[0],
            debit: type === 'expense' ? parseFloat(amount) : 0,
            credit: type === 'income' ? parseFloat(amount) : 0,
        };

        setLoading(true);
        try {
            await api.post('/api/transactions', payload);
            await playSuccessSound();
            Alert.alert('Success', 'Transaction added successfully!', [
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
                    <Text style={styles.headerTitle}>Add Transaction</Text>
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
                        <Text style={styles.label}>Category</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                            {CATEGORIES.map((cat) => (
                                <TouchableOpacity
                                    key={cat}
                                    style={[
                                        styles.categoryChip,
                                        category === cat && styles.categoryChipActive
                                    ]}
                                    onPress={() => setCategory(cat)}
                                >
                                    <Text style={[
                                        styles.categoryText,
                                        category === cat && styles.categoryTextActive
                                    ]}>{cat}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

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
                        onPress={handleAdd}
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
                                <Text style={styles.submitBtnText}>Add Transaction</Text>
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
    categoryScroll: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    categoryChip: {
        backgroundColor: colors.cardBg,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        marginRight: 10,
        borderWidth: 1.5,
        borderColor: colors.border,
    },
    categoryChipActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    categoryText: {
        color: colors.textMuted,
        fontWeight: '600',
        fontSize: 14,
    },
    categoryTextActive: {
        color: colors.white,
        fontWeight: '700',
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

export default AddTransactionScreen;
