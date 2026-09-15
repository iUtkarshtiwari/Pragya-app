import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

export function TaskDetailScreen({ task, onBack }: { task: any; onBack: () => void }) {
  const [status, setStatus] = useState(task.status);
  const [completedTimestamp, setCompletedTimestamp] = useState<string | null>(task.status === 'COMPLETED' ? new Date().toLocaleString() : null);

  const handleStateTransition = (nextStatus: string) => {
    setStatus(nextStatus);
    if (nextStatus === 'COMPLETED') {
      setCompletedTimestamp(new Date().toLocaleString());
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Text style={styles.backBtnText}>← Back to Tasks</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.badgeRow}>
          <View style={styles.priorityBadge}>
            <Text style={styles.priorityText}>{task.priority}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status === 'COMPLETED' ? 'rgba(16,185,129,0.2)' : 'rgba(6,182,212,0.2)' }]}>
            <Text style={[styles.statusText, { color: status === 'COMPLETED' ? '#10b981' : '#06b6d4' }]}>{status}</Text>
          </View>
        </View>

        <Text style={styles.title}>{task.title}</Text>

        <View style={styles.metaBox}>
          <Text style={styles.metaItem}>Assigned by: <Text style={styles.whiteText}>{task.assignedBy || 'Dr. Sarah Connor'}</Text></Text>
          <Text style={styles.metaItem}>Due Date: <Text style={styles.whiteText}>{task.dueTime}</Text></Text>
          <Text style={styles.metaItem}>Estimated Duration: <Text style={styles.whiteText}>{task.durationMinutes} mins</Text></Text>
        </View>

        <Text style={styles.sectionHeader}>Description & Instructions</Text>
        <Text style={styles.description}>{task.description}</Text>

        {status === 'COMPLETED' ? (
          <View style={styles.completedBox}>
            <Text style={styles.completedText}>✓ Task Completed</Text>
            <Text style={styles.completedSub}>Completion Timestamp: {completedTimestamp}</Text>
          </View>
        ) : (
          <View style={styles.actionRow}>
            {status === 'NOT_STARTED' && (
              <TouchableOpacity style={styles.actionBtnPrimary} onPress={() => handleStateTransition('IN_PROGRESS')}>
                <Text style={styles.btnText}>Start Task</Text>
              </TouchableOpacity>
            )}

            {status === 'IN_PROGRESS' && (
              <TouchableOpacity style={styles.actionBtnSuccess} onPress={() => handleStateTransition('COMPLETED')}>
                <Text style={styles.btnTextDark}>Mark as Completed</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090d16', padding: 20, paddingTop: 50 },
  backBtn: { marginBottom: 20 },
  backBtnText: { color: '#06b6d4', fontSize: 16, fontWeight: '700' },
  badgeRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  priorityBadge: { backgroundColor: 'rgba(244,63,94,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  priorityText: { color: '#f43f5e', fontSize: 12, fontWeight: '800' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: '800' },
  title: { color: '#ffffff', fontSize: 24, fontWeight: '800', marginBottom: 20 },
  metaBox: { backgroundColor: 'rgba(18, 24, 40, 0.75)', borderRadius: 16, padding: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginBottom: 24 },
  metaItem: { color: '#94a3b8', fontSize: 14, marginBottom: 8 },
  whiteText: { color: '#ffffff', fontWeight: '700' },
  sectionHeader: { color: '#ffffff', fontSize: 18, fontWeight: '800', marginBottom: 10 },
  description: { color: '#cbd5e1', fontSize: 15, lineHeight: 22, marginBottom: 30 },
  completedBox: { backgroundColor: 'rgba(16,185,129,0.15)', borderPadding: 1, borderColor: '#10b981', padding: 20, borderRadius: 16, alignItems: 'center' },
  completedText: { color: '#10b981', fontSize: 18, fontWeight: '800', marginBottom: 4 },
  completedSub: { color: '#94a3b8', fontSize: 13 },
  actionRow: { marginTop: 20 },
  actionBtnPrimary: { backgroundColor: '#06b6d4', padding: 18, borderRadius: 14, alignItems: 'center' },
  actionBtnSuccess: { backgroundColor: '#10b981', padding: 18, borderRadius: 14, alignItems: 'center' },
  btnText: { color: '#000000', fontWeight: '800', fontSize: 16 },
  btnTextDark: { color: '#000000', fontWeight: '800', fontSize: 16 }
});
