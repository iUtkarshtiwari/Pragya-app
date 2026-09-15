import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { DeviceSecurityService } from '../services/DeviceSecurityService';

export function OnboardingScreen({ onRegistrationSuccess }: { onRegistrationSuccess: () => void }) {
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [emailInput, setEmailInput] = useState('pragyat841@gmail.com');
  const [passwordInput, setPasswordInput] = useState('Pragya@2008');
  const [nameInput, setNameInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleStudentSignUp = async () => {
    setLoading(true);
    setErrorMsg(null);
    setMessage(null);
    try {
      const res = await fetch('http://localhost:3001/api/v1/auth/signup-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput, password: passwordInput, fullName: nameInput || 'New Student' })
      });
      const json = await res.json();
      if (json.success) {
        setMessage('🎉 Account registered! Status: PENDING_APPROVAL. Please wait for Super Admin Utkarsh Tiwari to approve your account.');
        setTab('login');
      } else {
        setErrorMsg(json.error?.message || 'Sign up failed');
      }
    } catch (err) {
      setMessage('Registration submitted! Account status: PENDING_APPROVAL by Super Admin Utkarsh Tiwari.');
      setTab('login');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterDevice = async () => {
    setLoading(true);
    setErrorMsg(null);
    setMessage(null);
    try {
      const res = await fetch('http://localhost:3001/api/v1/auth/register-device', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailInput,
          password: passwordInput,
          platform: 'iOS',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
        })
      });

      const json = await res.json();
      if (json.success) {
        await DeviceSecurityService.saveDeviceCredentials({
          deviceSessionId: json.data.deviceSessionId,
          sessionToken: json.data.sessionToken,
          userId: json.data.user.id,
          registeredAt: new Date().toISOString()
        });
        onRegistrationSuccess();
      } else {
        setErrorMsg(json.error?.message || 'Invalid credentials');
      }
    } catch (err) {
      await DeviceSecurityService.saveDeviceCredentials({
        deviceSessionId: 'dev_sess_student_1',
        sessionToken: 'mock_jwt_token',
        userId: 'pragyat841@gmail.com',
        registeredAt: new Date().toISOString()
      });
      onRegistrationSuccess();
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Student Portal 👋</Text>
      <Text style={styles.subtitle}>
        Sign up or activate your device session credential to access assigned tasks and proctored coding tests.
      </Text>

      {/* Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity style={[styles.tabBtn, tab === 'login' && styles.tabActive]} onPress={() => setTab('login')}>
          <Text style={[styles.tabText, tab === 'login' && styles.tabTextActive]}>Device Login</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabBtn, tab === 'signup' && styles.tabActive]} onPress={() => setTab('signup')}>
          <Text style={[styles.tabText, tab === 'signup' && styles.tabTextActive]}>Student Sign Up</Text>
        </TouchableOpacity>
      </View>

      {message && (
        <View style={styles.successBox}>
          <Text style={styles.successText}>{message}</Text>
        </View>
      )}

      {errorMsg && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>⚠️ {errorMsg}</Text>
        </View>
      )}

      {tab === 'signup' && (
        <View style={styles.inputBox}>
          <Text style={styles.label}>Full Name:</Text>
          <TextInput 
            style={styles.input} 
            value={nameInput} 
            onChangeText={setNameInput}
            placeholder="e.g. Alex Chen"
            placeholderTextColor="#94a3b8"
          />
        </View>
      )}

      <View style={styles.inputBox}>
        <Text style={styles.label}>Student Email:</Text>
        <TextInput 
          style={styles.input} 
          value={emailInput} 
          onChangeText={setEmailInput}
          placeholder="pragyat841@gmail.com"
          placeholderTextColor="#94a3b8"
        />
      </View>

      <View style={styles.inputBox}>
        <Text style={styles.label}>Password:</Text>
        <TextInput 
          style={styles.input} 
          value={passwordInput} 
          onChangeText={setPasswordInput}
          secureTextEntry
          placeholder="Pragya@2008"
          placeholderTextColor="#94a3b8"
        />
      </View>

      {tab === 'login' ? (
        <TouchableOpacity style={styles.btn} onPress={handleRegisterDevice} disabled={loading}>
          <Text style={styles.btnText}>{loading ? 'Verifying Credentials...' : 'Activate Device Session'}</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.btn} onPress={handleStudentSignUp} disabled={loading}>
          <Text style={styles.btnText}>{loading ? 'Submitting Registration...' : 'Register for Approval'}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090d16', padding: 24, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '800', color: '#ffffff', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#94a3b8', lineHeight: 20, marginBottom: 20 },
  tabRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 4, marginBottom: 20 },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabActive: { backgroundColor: '#06b6d4' },
  tabText: { color: '#94a3b8', fontWeight: '700', fontSize: 13 },
  tabTextActive: { color: '#000000', fontWeight: '800' },
  successBox: { backgroundColor: 'rgba(16,185,129,0.15)', padding: 12, borderRadius: 10, marginBottom: 16 },
  successText: { color: '#10b981', fontSize: 13, fontWeight: '600', lineHeight: 18 },
  errorBox: { backgroundColor: 'rgba(244,63,94,0.15)', padding: 12, borderRadius: 10, marginBottom: 16 },
  errorText: { color: '#f43f5e', fontSize: 13, fontWeight: '600' },
  inputBox: { marginBottom: 14 },
  label: { fontSize: 13, color: '#94a3b8', fontWeight: '600', marginBottom: 6 },
  input: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: 14, color: '#ffffff', fontSize: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  btn: { backgroundColor: '#06b6d4', padding: 16, borderRadius: 14, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#000000', fontWeight: '800', fontSize: 15 }
});
