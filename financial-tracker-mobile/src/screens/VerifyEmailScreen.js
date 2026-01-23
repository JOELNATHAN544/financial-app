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
import { useTheme } from '../context/ThemeContext';
import { StatusBar } from 'react-native';

const VerifyEmailScreen = ({ navigation, route }) => {
    const { colors, isDark } = useTheme();
    const styles = getStyles(colors, isDark);
    const { username: initialUsername } = route.params || {};
    const [username, setUsername] = useState(initialUsername || '');
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleVerify = async () => {
        if (!username.trim() || !code.trim()) {
            Alert.alert('Error', 'Username and code are required');
            return;
        }

        setIsLoading(true);
        try {
            await api.post('/api/auth/verify-email', { username, code });
            Alert.alert(
                'Verified!',
                'Your email has been verified. You can now log in.',
                [{ text: 'Great', onPress: () => navigation.navigate('Login') }]
            );
        } catch (error) {
            Alert.alert('Verification Failed', error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        if (!username.trim()) {
            Alert.alert('Error', 'Please enter your username to resend the code');
            return;
        }

        setIsLoading(true);
        try {
            await api.post('/api/auth/resend-verification', { username });
            Alert.alert('Resent', 'A new verification code has been sent to your email.');
        } catch (error) {
            Alert.alert('Error', error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
            <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
                <View style={styles.cardContainer}>
                    <Text style={styles.title}>Check your Inbox</Text>
                    <Text style={styles.subtitle}>Enter the 6-digit code we sent to your email</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Username</Text>
                        <TextInput
                            style={[styles.input, initialUsername && styles.inputDisabled]}
                            value={username}
                            onChangeText={setUsername}
                            placeholder="Your username"
                            placeholderTextColor={colors.textMuted}
                            autoCapitalize="none"
                            editable={!initialUsername}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Verification Code</Text>
                        <TextInput
                            style={styles.input}
                            value={code}
                            onChangeText={setCode}
                            placeholder="000000"
                            placeholderTextColor={colors.textMuted}
                            keyboardType="number-pad"
                            maxLength={6}
                        />
                    </View>

                    <TouchableOpacity
                        onPress={handleVerify}
                        disabled={isLoading}
                        style={styles.primaryBtnWrapper}
                    >
                        <LinearGradient
                            colors={Gradients.indigo}
                            style={styles.primaryBtn}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            {isLoading ? (
                                <ActivityIndicator color={colors.white} />
                            ) : (
                                <Text style={styles.btnText}>Verify Account</Text>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.secondaryBtn}
                        onPress={handleResend}
                        disabled={isLoading}
                    >
                        <Text style={styles.secondaryBtnText}>
                            Didn't get the code? <Text style={styles.linkHighlight}>Resend</Text>
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.backBtn}
                        onPress={() => navigation.navigate('Login')}
                    >
                        <Text style={styles.backBtnText}>Back to Sign In</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const getStyles = (colors, isDark) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: Spacing.lg,
    },
    cardContainer: {
        backgroundColor: colors.cardBg,
        borderRadius: 24,
        padding: Spacing.xl,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: colors.text,
        textAlign: 'center',
        marginBottom: Spacing.xs,
    },
    subtitle: {
        fontSize: 14,
        color: colors.textMuted,
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
        color: colors.text,
        marginBottom: Spacing.sm,
        marginLeft: 4,
    },
    input: {
        backgroundColor: colors.inputBg,
        borderRadius: 12,
        padding: Spacing.md,
        fontSize: 15,
        color: colors.text,
        borderWidth: 1,
        borderColor: colors.border,
    },
    inputDisabled: {
        opacity: 0.6,
    },
    primaryBtnWrapper: {
        width: '100%',
        marginTop: Spacing.md,
    },
    primaryBtn: {
        borderRadius: 14,
        height: 54,
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '700',
    },
    secondaryBtn: {
        marginTop: Spacing.xl,
    },
    secondaryBtnText: {
        color: colors.textMuted,
        fontSize: 13,
        fontWeight: '500',
    },
    linkHighlight: {
        color: colors.primary,
        fontWeight: '700',
    },
    backBtn: {
        marginTop: Spacing.lg,
    },
    backBtnText: {
        color: colors.textMuted,
        fontSize: 12,
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
});

export default VerifyEmailScreen;
