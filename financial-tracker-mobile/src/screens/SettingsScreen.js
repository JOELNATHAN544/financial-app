import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Switch,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Spacing } from '../constants/Theme';
import { api } from '../api';
import { useTheme } from '../context/ThemeContext';

const SettingsScreen = ({ onLogout, navigation }) => {
    const { colors, isDark, toggleTheme } = useTheme();
    const styles = getStyles(colors);

    const [soundEnabled, setSoundEnabled] = React.useState(true);
    const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to log out?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Logout', style: 'destructive', onPress: onLogout }
            ]
        );
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            'Delete Account',
            'Are you sure you want to delete your account? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete('/api/users/me');
                            Alert.alert('Account Deleted', 'Your account has been successfully deleted.');
                            onLogout();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete account. Please try again.');
                        }
                    }
                }
            ]
        );
    };

    const SettingItem = ({ icon, label, type, value, onValueChange, onPress, color }) => {
        const itemColor = color || colors.text;
        return (
            <TouchableOpacity
                style={styles.settingItem}
                onPress={onPress}
                disabled={type === 'switch'}
            >
                <View style={[styles.iconBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
                    <Ionicons name={icon} size={22} color={itemColor} />
                </View>
                <Text style={[styles.settingLabel, { color: itemColor }]}>{label}</Text>
                {type === 'switch' ? (
                    <Switch
                        value={value}
                        onValueChange={onValueChange}
                        trackColor={{ false: isDark ? '#334155' : '#cbd5e1', true: colors.primary }}
                        thumbColor={colors.white}
                    />
                ) : (
                    <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                )}
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Settings</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Appearance</Text>
                    <View style={styles.sectionCard}>
                        <SettingItem
                            icon={isDark ? "moon" : "sunny"}
                            label="Dark Mode"
                            type="switch"
                            value={isDark}
                            onValueChange={toggleTheme}
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Preferences</Text>
                    <View style={styles.sectionCard}>
                        <SettingItem
                            icon="notifications-outline"
                            label="Push Notifications"
                            type="switch"
                            value={notificationsEnabled}
                            onValueChange={setNotificationsEnabled}
                        />
                        <View style={styles.divider} />
                        <SettingItem
                            icon="volume-high-outline"
                            label="Transaction Sounds"
                            type="switch"
                            value={soundEnabled}
                            onValueChange={setSoundEnabled}
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account</Text>
                    <View style={styles.sectionCard}>
                        <SettingItem
                            icon="person-outline"
                            label="Profile Details"
                            onPress={() => navigation.navigate('Profile')}
                        />
                        <View style={styles.divider} />
                        <SettingItem
                            icon="shield-checkmark-outline"
                            label="Security & Privacy"
                            onPress={() => navigation.navigate('Security')}
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Danger Zone</Text>
                    <View style={styles.sectionCard}>
                        <SettingItem
                            icon="log-out-outline"
                            label="Log Out"
                            color={colors.text}
                            onPress={handleLogout}
                        />
                        <View style={styles.divider} />
                        <SettingItem
                            icon="trash-outline"
                            label="Delete Account"
                            color={colors.error}
                            onPress={handleDeleteAccount}
                        />
                    </View>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.version}>FinanceFlow Mobile v1.0.0</Text>
                    <Text style={styles.copyright}>© 2026 Joel Nathan. All rights reserved.</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const getStyles = (colors) => StyleSheet.create({
    container: {
        flex: 1,
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
    content: {
        padding: Spacing.lg,
        paddingBottom: 40,
    },
    section: {
        marginBottom: Spacing.xxl,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: Spacing.md,
        marginLeft: 4,
    },
    sectionCard: {
        backgroundColor: colors.cardBg,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    settingLabel: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginHorizontal: 16,
    },
    footer: {
        alignItems: 'center',
        marginTop: 20,
    },
    version: {
        color: colors.textMuted,
        fontSize: 12,
        fontWeight: '600',
    },
    copyright: {
        color: 'rgba(148, 163, 184, 0.4)',
        fontSize: 10,
        marginTop: 4,
    },
});

export default SettingsScreen;
