/**
 * EventRecapEditor Screen
 * RBAC-secured event publishing workspace.
 * Gated to authorized committee emails (e.g. bbc.events@college.edu) defined in department_members.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet
} from 'react-native';
import { colors, typography } from '../theme/colors';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface EventRecapEditorProps {
  committeeId: string;
  onSuccess: (newEventId: string) => void;
  onCancel: () => void;
}

export const EventRecapEditor: React.FC<EventRecapEditorProps> = ({
  committeeId,
  onSuccess,
  onCancel
}) => {
  const { user, hasCommitteeAccess } = useAuth();
  const [title, setTitle] = useState('');
  const [eventDate, setEventDate] = useState('2026-09-20');
  const [description, setDescription] = useState('');
  const [achievements, setAchievements] = useState('');
  const [attendees, setAttendees] = useState('350');
  const [revenue, setRevenue] = useState('25000');
  const [mediaUrlInput, setMediaUrlInput] = useState(
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1000'
  );
  const [mediaList, setMediaList] = useState<string[]>([
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1000'
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // RBAC Permission Check
  const isAuthorized = hasCommitteeAccess(committeeId);

  if (!isAuthorized) {
    return (
      <View style={styles.unauthorizedBox}>
        <Text style={styles.lockEmoji}>🔒</Text>
        <Text style={styles.unauthorizedTitle}>RBAC Access Restricted</Text>
        <Text style={styles.unauthorizedDesc}>
          Only authorized committee emails (e.g. <Text style={styles.bold}>bbc.events@college.edu</Text>) recorded in department membership tables can publish recaps for this society.
        </Text>
        <Text style={styles.currentEmail}>
          Current Account Email: <Text style={styles.bold}>{user?.college_email}</Text>
        </Text>
        <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
          <Text style={styles.cancelBtnText}>Return to Committee View</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleAddMedia = () => {
    if (mediaUrlInput.trim() && !mediaList.includes(mediaUrlInput.trim())) {
      setMediaList([...mediaList, mediaUrlInput.trim()]);
      setMediaUrlInput('');
    }
  };

  const handleRemoveMedia = (index: number) => {
    setMediaList(mediaList.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Please provide an event title.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const statsPayload: Record<string, any> = {};
    if (attendees) statsPayload.attendees = parseInt(attendees, 10) || 0;
    if (revenue) statsPayload.revenue = parseInt(revenue, 10) || 0;

    try {
      const res = await api.events.createEvent(committeeId, {
        title: title.trim(),
        event_date: eventDate,
        description: description.trim(),
        achievements: achievements.trim(),
        stats: statsPayload,
        media_urls: mediaList
      });

      if (res.success && res.event) {
        onSuccess(res.event.id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create event recap. Please verify RBAC permissions.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Post Official Event Recap</Text>
        <Text style={styles.subtitle}>
          Authorized Committee Email: <Text style={styles.authBadge}>{user?.college_email}</Text>
        </Text>
      </View>

      {/* Form Fields */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Event Title</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Winter Tech Expo 2026"
          placeholderTextColor={colors.textMuted}
          value={title}
          onChangeText={setTitle}
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Event Date</Text>
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.textMuted}
          value={eventDate}
          onChangeText={setEventDate}
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Event Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describe the turnout, keynote speakers, workshops, and highlights..."
          placeholderTextColor={colors.textMuted}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Key Achievements & Milestones</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="e.g. 50+ universities participated, $10k prizes distributed, 3 startups funded..."
          placeholderTextColor={colors.textMuted}
          value={achievements}
          onChangeText={setAchievements}
          multiline
          numberOfLines={3}
        />
      </View>

      {/* JSONB Stats Builder */}
      <View style={styles.statsBuilderCard}>
        <Text style={styles.statsBuilderTitle}>📊 Event Analytics (JSONB)</Text>
        <View style={styles.statsInputsRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.smallLabel}>Attendees Count</Text>
            <TextInput
              style={styles.smallInput}
              keyboardType="numeric"
              value={attendees}
              onChangeText={setAttendees}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.smallLabel}>Revenue Raised (₹)</Text>
            <TextInput
              style={styles.smallInput}
              keyboardType="numeric"
              value={revenue}
              onChangeText={setRevenue}
            />
          </View>
        </View>
      </View>

      {/* Media Gallery URL Manager */}
      <View style={styles.mediaCard}>
        <Text style={styles.label}>Event Photos & Media URLs</Text>
        <View style={styles.mediaAddRow}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Paste high-res image URL"
            placeholderTextColor={colors.textMuted}
            value={mediaUrlInput}
            onChangeText={setMediaUrlInput}
          />
          <TouchableOpacity style={styles.addMediaBtn} onPress={handleAddMedia}>
            <Text style={styles.addMediaText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {/* Media items chip list */}
        <View style={styles.mediaList}>
          {mediaList.map((url, idx) => (
            <View key={idx} style={styles.mediaItem}>
              <Text style={styles.mediaUrlText} numberOfLines={1}>
                📷 Photo {idx + 1}: {url}
              </Text>
              <TouchableOpacity onPress={() => handleRemoveMedia(idx)}>
                <Text style={styles.removeMedia}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>Publish Official Recap</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    padding: 16,
    paddingBottom: 40
  },
  unauthorizedBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: colors.background
  },
  lockEmoji: {
    fontSize: 48,
    marginBottom: 16
  },
  unauthorizedTitle: {
    color: colors.danger,
    fontSize: typography.sizes.lg,
    fontWeight: '800',
    marginBottom: 8
  },
  unauthorizedDesc: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16
  },
  currentEmail: {
    color: colors.textMuted,
    fontSize: typography.sizes.xs,
    marginBottom: 24
  },
  bold: {
    fontWeight: '700',
    color: colors.textPrimary
  },
  cancelBtn: {
    backgroundColor: colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  cancelBtnText: {
    color: colors.textPrimary,
    fontWeight: '600'
  },
  header: {
    marginBottom: 18
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.sizes.xl,
    fontWeight: '800'
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    marginTop: 4
  },
  authBadge: {
    color: colors.secondaryLight,
    fontWeight: '700'
  },
  fieldGroup: {
    marginBottom: 14
  },
  label: {
    color: colors.textPrimary,
    fontSize: typography.sizes.xs,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase'
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.textPrimary,
    fontSize: typography.sizes.sm
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top'
  },
  statsBuilderCard: {
    backgroundColor: colors.card,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 14
  },
  statsBuilderTitle: {
    color: colors.secondaryLight,
    fontSize: typography.sizes.xs,
    fontWeight: '700',
    marginBottom: 10,
    textTransform: 'uppercase'
  },
  statsInputsRow: {
    flexDirection: 'row',
    gap: 12
  },
  smallLabel: {
    color: colors.textMuted,
    fontSize: 10,
    marginBottom: 4
  },
  smallInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: colors.textPrimary,
    fontSize: typography.sizes.sm
  },
  mediaCard: {
    marginBottom: 16
  },
  mediaAddRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8
  },
  addMediaBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    borderRadius: 10,
    justifyContent: 'center'
  },
  addMediaText: {
    color: '#fff',
    fontWeight: '700'
  },
  mediaList: {
    gap: 6
  },
  mediaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 8,
    borderRadius: 6
  },
  mediaUrlText: {
    color: colors.textSecondary,
    fontSize: 11,
    flex: 1,
    marginRight: 8
  },
  removeMedia: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: 'bold',
    paddingHorizontal: 6
  },
  errorBox: {
    backgroundColor: colors.dangerBg,
    borderColor: colors.danger,
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginBottom: 14
  },
  errorText: {
    color: colors.danger,
    fontSize: typography.sizes.xs,
    fontWeight: '600'
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  cancelText: {
    color: colors.textSecondary,
    fontWeight: '600'
  },
  submitButton: {
    flex: 2,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center'
  },
  submitButtonDisabled: {
    opacity: 0.6
  },
  submitText: {
    color: '#ffffff',
    fontWeight: '700'
  }
});
