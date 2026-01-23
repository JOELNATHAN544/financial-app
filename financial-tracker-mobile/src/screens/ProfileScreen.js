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

const ProfileScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState({
        username: '',
        email: '',
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const userData = await api.get('/api/users/me');
            setProfile({
                username: userData.username || '',
                email: userData.email || '',
            });
        } catch (error) {
            console.error('Error fetching profile:', error);
            // Fallback for demo if API fails
            const { jwtToken } = await api.getTokens();
            if (jwtToken) {
                // Try to decode or just keep empty
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put('/api/users/me', profile);
            Alert.alert('Success', 'Profile updated successfully');
        } catch (error) {
            Alert.alert('Error', error.message || 'Failed to update profile');
        } finally {
            setSaving(false);
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
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Profile Details</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.avatarContainer}>
                    <View style={styles.avatar}>
                        <Ionicons name="person" size={48} color={Colors.primary} />
                    </View>
                    <TouchableOpacity style={styles.changePhotoBtn}>
                        <Text style={styles.changePhotoText}>Change Photo</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Username</Text>
                        <TextInput
                            style={styles.input}
                            value={profile.username}
                            onChangeText={(text) => setProfile({ ...profile, username: text })}
                            placeholder="Your username"
                            placeholderTextColor={Colors.textMuted}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={styles.input}
                            value={profile.email}
                            onChangeText={(text) => setProfile({ ...profile, email: text })}
                            placeholder="your@email.com"
                            placeholderTextColor={Colors.textMuted}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <TouchableOpacity onPress={handleSave} disabled={saving}>
                        <LinearGradient
                            colors={Gradients.indigo}
                            style={styles.saveBtn}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            {saving ? (
                                <ActivityIndicator color={Colors.white} />
                            ) : (
                                <Text style={styles.saveBtnText}>Save Changes</Text>
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.xl,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    backBtn: {
        marginRight: 16,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: Colors.text,
    },
    content: {
        padding: Spacing.lg,
    },
    avatarContainer: {
        alignItems: 'center',
        marginBottom: Spacing.xxl,
        marginTop: Spacing.lg,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Colors.cardBg,
        borderWidth: 3,
        borderColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    changePhotoBtn: {
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    changePhotoText: {
        color: Colors.primary,
        fontSize: 14,
        fontWeight: '700',
    },
    form: {
        gap: 20,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        color: Colors.text,
        fontSize: 14,
        fontWeight: '700',
        marginBottom: Spacing.sm,
        marginLeft: 4,
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
    saveBtn: {
        borderRadius: 16,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
    },
    saveBtnText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: '800',
    },
});

export default ProfileScreen;
