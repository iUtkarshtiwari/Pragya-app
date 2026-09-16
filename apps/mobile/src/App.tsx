import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { DeviceSecurityService } from './services/DeviceSecurityService';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { TaskDetailScreen } from './screens/TaskDetailScreen';
import { EXAM_APP_URL } from './config';

export default function App() {
  const [isRegistered, setIsRegistered] = useState<boolean | null>(null);
  const [selectedTask, setSelectedTask] = useState<any>(null);

  const checkAuthStatus = () => {
    DeviceSecurityService.getDeviceCredentials().then(creds => {
      setIsRegistered(!!creds);
    });
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const handleLogout = async () => {
    await DeviceSecurityService.clearDeviceCredentials();
    setIsRegistered(false);
  };

  if (isRegistered === null) return <View style={styles.container} />;

  return (
    <SafeAreaView style={styles.container}>
      {!isRegistered ? (
        <OnboardingScreen onRegistrationSuccess={() => setIsRegistered(true)} />
      ) : selectedTask ? (
        <TaskDetailScreen task={selectedTask} onBack={() => setSelectedTask(null)} />
      ) : (
        <DashboardScreen 
          onOpenExamInvitation={() => {
            window.open(`${EXAM_APP_URL}/exam?token=EXAM_TOKEN_ALEX_CHEN_2026`, '_blank');
          }}
          onSelectTask={(task) => setSelectedTask(task)}
          onLogout={handleLogout}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090d16' }
});
