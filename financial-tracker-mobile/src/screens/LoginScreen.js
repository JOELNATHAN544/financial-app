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
  Image,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { api, API_BASE_URL } from '../api';
import { Colors, Spacing, Gradients } from '../constants/Theme';

const LoginScreen = ({ navigation, onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both username and password');
      return;
    }

    setIsLoading(true);
    try {
      const data = await api.post('/api/auth/login', { username, password });
      await api.saveTokens(data.jwt, data.refreshToken);
      onLogin(data.jwt);
    } catch (error) {
      const msg = error.message === 'Network request failed'
        ? `Network request failed. Ensure your phone is on the same Wi-Fi as your computer. Current Backend URL: ${API_BASE_URL}`
        : error.message;
      Alert.alert('Login Error', msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      if (!API_BASE_URL) throw new Error('API_BASE_URL is not defined');

      const authUrl = `${API_BASE_URL}/oauth2/authorization/google`;
      console.log('Opening Auth URL:', authUrl);

      const result = await WebBrowser.openBrowserAsync(authUrl).catch(async (e) => {
        console.warn('WebBrowser failed, trying Linking:', e);
        return await Linking.openURL(authUrl);
      });

    } catch (error) {
      Alert.alert('Google Login Error', 'Could not open browser. Please try again or check your internet connection.');
      console.error('Google Login Error:', error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.cardContainer}>
          <TouchableOpacity
            style={styles.backTopBtn}
            onPress={() => navigation.navigate('Welcome')}
          >
            <Ionicons name="chevron-back" size={24} color={Colors.textMuted} />
            <Text style={styles.backTopText}>Back</Text>
          </TouchableOpacity>

          <LinearGradient
            colors={Gradients.premium}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoCircle}
          >
            <Text style={styles.logoText}>$</Text>
          </LinearGradient>

          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Manage your finances with elegance</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username or Email</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Enter username or email"
              placeholderTextColor={Colors.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, { flex: 1, borderTopRightRadius: 0, borderBottomRightRadius: 0 }]}
                value={password}
                onChangeText={setPassword}
                placeholder="........"
                placeholderTextColor={Colors.textMuted}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={22}
                  color={Colors.textMuted}
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('ForgotPassword')}
              style={styles.forgotPassLink}
            >
              <Text style={styles.forgotPassText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={handleLogin}
            disabled={isLoading}
            style={styles.loginBtnWrapper}
          >
            <LinearGradient
              colors={Gradients.indigo}
              style={styles.primaryBtn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {isLoading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.btnText}>Sign In</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.googleBtn}
            onPress={handleGoogleLogin}
          >
            <View style={styles.googleBtnContent}>
              <Image
                source={require('../../assets/google_logo.png')}
                style={{ width: 24, height: 24 }}
                resizeMode="contain"
              />
              <Text style={styles.googleBtnText}>Log in with Google</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.secondaryBtnText}>
              Don't have an account? <Text style={styles.linkHighlight}>Create one</Text>
            </Text>
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
    maxWidth: 500,
    alignSelf: 'center',
    width: '100%',
  },
  backTopBtn: {
    position: 'absolute',
    top: 20,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backTopText: {
    color: Colors.textMuted,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    marginTop: 20,
  },
  logoText: {
    color: Colors.white,
    fontSize: 32,
    fontWeight: '800',
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  inputGroup: {
    width: '100%',
    marginBottom: Spacing.xl, // More space
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
    marginLeft: 4,
  },
  input: {
    backgroundColor: Colors.inputBg,
    borderRadius: 16,
    padding: Spacing.md,
    fontSize: 17, // Larger font
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
    height: 64, // Larger input
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eyeButton: {
    paddingHorizontal: Spacing.lg,
    height: 64,
    backgroundColor: Colors.inputBg,
    justifyContent: 'center',
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 0,
  },
  forgotPassLink: {
    alignSelf: 'flex-end',
    marginTop: Spacing.sm,
  },
  forgotPassText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  loginBtnWrapper: {
    width: '100%',
    marginTop: Spacing.md,
  },
  primaryBtn: {
    borderRadius: 16,
    height: 58,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  btnText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.xl,
    width: '100%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    marginHorizontal: Spacing.md,
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  googleBtn: {
    width: '100%',
    height: 64,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  googleBtnText: {
    color: Colors.text,
    fontSize: 17,
    fontWeight: '700',
    marginLeft: 16,
  },
  googleBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  secondaryBtn: {
    marginTop: Spacing.sm,
    paddingBottom: 10,
  },
  secondaryBtnText: {
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },
  linkHighlight: {
    color: Colors.primary,
    fontWeight: '700',
  },
});

export default LoginScreen;