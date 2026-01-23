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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../api';
import { Colors, Spacing, Gradients } from '../constants/Theme';
import { useTheme } from '../context/ThemeContext';
import { StatusBar } from 'react-native';

const SecurityScreen = ({ navigation }) => {
    const { colors, isDark } = useTheme();
    const styles = getStyles(colors, isDark);
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: '',
    });
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChangePassword = async () => {
        if (!passwords.current || !passwords.new || !passwords.confirm) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (passwords.new !== passwords.confirm) {
            Alert.alert('Error', 'New passwords do not match');
            return;
        }

        if (passwords.new.length < 6) {
            Alert.alert('Error', 'New password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            await api.post('/api/auth/change-password', {
                currentPassword: passwords.current,
                newPassword: passwords.new,
            });
            Alert.alert('Success', 'Password changed successfully');
            setPasswords({ current: '', new: '', confirm: '' });
            navigation.goBack();
        } catch (error) {
            Alert.alert('Error', error.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Security & Privacy</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Change Password</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Current Password</Text>
                        <View style={styles.passwordInput}>
                            <TextInput
                                style={styles.input}
                                value={passwords.current}
                                onChangeText={(text) => setPasswords({ ...passwords, current: text })}
                                placeholder="Enter current password"
                                placeholderTextColor={colors.textMuted}
                                secureTextEntry={!showCurrent}
                                autoCapitalize="none"
                            />
                            <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)} style={styles.eyeBtn}>
                                <Ionicons name={showCurrent ? 'eye-off' : 'eye'} size={20} color={colors.textMuted} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>New Password</Text>
                        <View style={styles.passwordInput}>
                            <TextInput
                                style={styles.input}
                                value={passwords.new}
                                onChangeText={(text) => setPasswords({ ...passwords, new: text })}
                                placeholder="Enter new password"
                                placeholderTextColor={colors.textMuted}
                                secureTextEntry={!showNew}
                                autoCapitalize="none"
                            />
                            <TouchableOpacity onPress={() => setShowNew(!showNew)} style={styles.eyeBtn}>
                                <Ionicons name={showNew ? 'eye-off' : 'eye'} size={20} color={colors.textMuted} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Confirm New Password</Text>
                        <View style={styles.passwordInput}>
                            <TextInput
                                style={styles.input}
                                value={passwords.confirm}
                                onChangeText={(text) => setPasswords({ ...passwords, confirm: text })}
                                placeholder="Confirm new password"
                                placeholderTextColor={colors.textMuted}
                                secureTextEntry={!showConfirm}
                                autoCapitalize="none"
                            />
                            <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeBtn}>
                                <Ionicons name={showConfirm ? 'eye-off' : 'eye'} size={20} color={colors.textMuted} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity onPress={handleChangePassword} disabled={loading}>
                        <LinearGradient
                            colors={Gradients.indigo}
                            style={styles.saveBtn}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            {loading ? (
                                <ActivityIndicator color={colors.white} />
                            ) : (
                                <Text style={styles.saveBtnText}>Change Password</Text>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Privacy Options</Text>
                    <View style={styles.privacyCard}>
                        <Ionicons name="shield-checkmark" size={24} color={colors.success} />
                        <Text style={styles.privacyText}>Your data is encrypted and secure</Text>
                    </View>
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.xl,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    backBtn: {
        marginRight: 16,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: colors.text,
    },
    content: {
        padding: Spacing.lg,
        paddingBottom: 40,
    },
    section: {
        marginBottom: Spacing.xxl,
    },
    sectionTitle: {
        fontSize: 18,
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
    passwordInput: {
        position: 'relative',
    },
    input: {
        backgroundColor: colors.cardBg,
        borderRadius: 16,
        padding: 16,
        paddingRight: 50,
        fontSize: 16,
        color: colors.text,
        borderWidth: 1.5,
        borderColor: colors.border,
    },
    eyeBtn: {
        position: 'absolute',
        right: 16,
        top: 16,
    },
    saveBtn: {
        borderRadius: 16,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
    },
    saveBtnText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '800',
    },
    privacyCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.cardBg,
        borderRadius: 16,
        padding: Spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
        gap: 12,
    },
    privacyText: {
        flex: 1,
        color: colors.text,
        fontSize: 14,
        fontWeight: '600',
    },
});

export default SecurityScreen;
