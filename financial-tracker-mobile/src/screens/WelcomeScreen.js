import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Gradients } from '../constants/Theme';

const WelcomeScreen = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient
                colors={Gradients.premium}
                style={styles.background}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.content}>
                    <View style={styles.logoContainer}>
                        <View style={styles.logoCircle}>
                            <Text style={styles.logoText}>$</Text>
                        </View>
                        <Text style={styles.brandName}>FinanceFlow</Text>
                        <Text style={styles.brandTagline}>Master your money with elegance</Text>
                    </View>

                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={styles.primaryBtn}
                            onPress={() => navigation.navigate('Register')}
                        >
                            <Text style={styles.primaryBtnText}>Get Started</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.secondaryBtn}
                            onPress={() => navigation.navigate('Login')}
                        >
                            <Text style={styles.secondaryBtnText}>
                                Already have an account? <Text style={styles.linkHighlight}>Sign In</Text>
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </LinearGradient>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    background: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Spacing.xxl,
        paddingHorizontal: Spacing.xl,
    },
    logoContainer: {
        alignItems: 'center',
        marginTop: 60,
    },
    logoCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.lg,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    logoText: {
        fontSize: 50,
        fontWeight: '800',
        color: Colors.white,
    },
    brandName: {
        fontSize: 42,
        fontWeight: '900',
        color: Colors.white,
        letterSpacing: -1,
    },
    brandTagline: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
        marginTop: Spacing.xs,
        fontWeight: '500',
    },
    footer: {
        width: '100%',
        paddingBottom: 40,
    },
    primaryBtn: {
        backgroundColor: Colors.white,
        height: 60,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5,
    },
    primaryBtnText: {
        color: Colors.primary,
        fontSize: 18,
        fontWeight: '800',
    },
    secondaryBtn: {
        marginTop: Spacing.lg,
        alignItems: 'center',
    },
    secondaryBtnText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 15,
        fontWeight: '500',
    },
    linkHighlight: {
        color: Colors.white,
        fontWeight: '800',
        textDecorationLine: 'underline',
    },
});

export default WelcomeScreen;
