import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { api } from '../api';
import { Colors, Spacing, Gradients } from '../constants/Theme';

const ForgotPasswordScreen = ({ navigation }) => {
    const [step, setStep] = useState(1); // 1: Request, 2: Reset
    const [identifier, setIdentifier] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleRequestReset = async () => {
        if (!identifier.trim()) {
            Alert.alert('Error', 'Username or Email is required');
            return;
        }

        setIsLoading(true);
        try {
            await api.post('/api/auth/forgot-password', { identifier });
            Alert.alert(
                'Code Sent',
                'If an account exists, a reset code was sent. We will now proceed to the reset stage.',
                [{ text: 'OK', onPress: () => setStep(2) }]
            );
        } catch (error) {
            Alert.alert('Error', 'Unable to reach server. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!code.trim() || !newPassword.trim() || !confirmPassword.trim()) {
            Alert.alert('Error', 'All fields are required');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        setIsLoading(true);
        try {
            await api.post('/api/auth/reset-password', {
                identifier,
                code,
                newPassword
            });
            Alert.alert(
                'Success!',
                'Your password has been reset. You can now log in.',
                [{ text: 'Login', onPress: () => navigation.navigate('Login') }]
            );
        } catch (error) {
            Alert.alert('Reset Failed', error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
                <View style={styles.cardContainer}>
                    <Text style={styles.title}>
                        {step === 1 ? 'Recover Password' : 'New Password'}
                    </Text>
                    <Text style={styles.subtitle}>
                        {step === 1
                            ? 'Enter your details to receive a reset code'
                            : 'Enter the code and your new secure password'}
                    </Text>

                    {step === 1 ? (
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Username or Email</Text>
                            <TextInput
                                style={styles.input}
                                value={identifier}
                                onChangeText={setIdentifier}
                                placeholder="name@example.com"
                                placeholderTextColor={Colors.textMuted}
                                autoCapitalize="none"
                            />
                            <TouchableOpacity
                                onPress={handleRequestReset}
                                disabled={isLoading}
                                style={styles.primaryBtnWrapper}
                            >
                                <LinearGradient
                                    colors={Gradients.indigo}
                                    style={styles.primaryBtn}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                >
                                    {isLoading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.btnText}>Send Reset Code</Text>}
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={{ width: '100%' }}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Reset Code</Text>
                                <TextInput
                                    style={styles.input}
                                    value={code}
                                    onChangeText={setCode}
                                    placeholder="000000"
                                    placeholderTextColor={Colors.textMuted}
                                    keyboardType="number-pad"
                                    maxLength={6}
                                />
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>New Password</Text>
                                <TextInput
                                    style={styles.input}
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                    placeholder="........"
                                    placeholderTextColor={Colors.textMuted}
                                    secureTextEntry
                                    autoCapitalize="none"
                                />
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Confirm New Password</Text>
                                <TextInput
                                    style={styles.input}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    placeholder="........"
                                    placeholderTextColor={Colors.textMuted}
                                    secureTextEntry
                                    autoCapitalize="none"
                                />
                            </View>
                            <TouchableOpacity
                                onPress={handleResetPassword}
                                disabled={isLoading}
                                style={styles.primaryBtnWrapper}
                            >
                                <LinearGradient
                                    colors={Gradients.premium}
                                    style={styles.primaryBtn}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                >
                                    {isLoading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.btnText}>Update Password</Text>}
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    )}

                    <TouchableOpacity
                        style={styles.backBtn}
                        onPress={() => step === 2 ? setStep(1) : navigation.navigate('Login')}
                        disabled={isLoading}
                    >
                        <Text style={styles.backBtnText}>Back to Sign In</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: Spacing.lg,
    },
    cardContainer: {
        backgroundColor: Colors.cardBg,
        borderRadius: 24,
        padding: Spacing.xl,
        borderWidth: 1,
        borderColor: Colors.border,
        alignItems: 'center',
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: Colors.text,
        textAlign: 'center',
        marginBottom: Spacing.xs,
    },
    subtitle: {
        fontSize: 14,
        color: Colors.textMuted,
        textAlign: 'center',
        marginBottom: Spacing.xl,
    },
    inputGroup: {
        width: '100%',
        marginBottom: Spacing.lg,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: Spacing.sm,
        marginLeft: 4,
    },
    input: {
        backgroundColor: Colors.inputBg,
        borderRadius: 12,
        padding: Spacing.md,
        fontSize: 15,
        color: Colors.text,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    primaryBtnWrapper: {
        width: '100%',
        marginTop: Spacing.lg,
    },
    primaryBtn: {
        borderRadius: 14,
        height: 54,
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: '700',
    },
    backBtn: {
        marginTop: Spacing.xl,
        alignItems: 'center',
    },
    backBtnText: {
        color: Colors.textMuted,
        fontSize: 13,
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
});

export default ForgotPasswordScreen;
