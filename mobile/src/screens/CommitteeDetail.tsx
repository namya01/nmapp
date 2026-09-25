/**
 * CommitteeDetail Screen
 * Displays committee breakdown, department structures, authorized committee emails,
 * leadership rosters, and RBAC-gated "Post Event Recap" action.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet
} from 'react-native';
import { colors, typography } from '../theme/colors';
import { Committee, Department, EventRecap } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface CommitteeDetailProps {
  committeeId: string;
  onBack: () => void;
  onSelectEvent: (eventId: string) => void;
  onOpenEventEditor: (committeeId: string) => void;
}

export const CommitteeDetail: React.FC<CommitteeDetailProps> = ({
  committeeId,
  onBack,
  onSelectEvent,
  onOpenEventEditor
}) => {
  const { user, hasCommitteeAccess } = useAuth();
  const [committee, setCommittee] = useState<Committee | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [events, setEvents] = useState<EventRecap[]>([]);
  const [activeTab, setActiveTab] = useState<'departments' | 'events'>('departments');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [deptRes, eventRes] = await Promise.all([
          api.committees.getDepartments(committeeId),
          api.events.getByCommittee(committeeId)
        ]);
        if (deptRes.committee) setCommittee(deptRes.committee);
        if (deptRes.departments) setDepartments(deptRes.departments);
        if (eventRes.events) setEvents(eventRes.events);
      } catch (err) {
        console.error('Failed to load committee detail:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [committeeId]);

  if (isLoading || !committee) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Check if current user has RBAC edit permissions for this committee
  const canEdit = hasCommitteeAccess(committeeId);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top Navigation */}
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>← All Committees</Text>
      </TouchableOpacity>

      {/* Committee Hero Banner */}
      <View style={styles.heroCard}>
        <View style={styles.heroBadge}>
          <Text style={styles.heroIcon}>🏛️</Text>
        </View>
        <Text style={styles.heroTitle}>{committee.name}</Text>
        <Text style={styles.heroDescription}>{committee.description}</Text>

        {/* RBAC Action Banner */}
        <View style={styles.rbacNoticeRow}>
          <Text style={styles.rbacNoticeText}>
            {canEdit
              ? '🔑 You hold verified editing credentials for this society.'
              : '👀 Viewing in student read-only mode.'}
          </Text>
          {canEdit && (
            <TouchableOpacity
              style={styles.postEventBtn}
              onPress={() => onOpenEventEditor(committeeId)}
            >
              <Text style={styles.postEventText}>+ New Event Recap</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* View Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'departments' && styles.tabButtonActive]}
          onPress={() => setActiveTab('departments')}
        >
          <Text style={[styles.tabText, activeTab === 'departments' && styles.tabTextActive]}>
            Departments ({departments.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'events' && styles.tabButtonActive]}
          onPress={() => setActiveTab('events')}
        >
          <Text style={[styles.tabText, activeTab === 'events' && styles.tabTextActive]}>
            Event Recaps ({events.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Departments Tab Content */}
      {activeTab === 'departments' && (
        <View style={styles.deptList}>
          {departments.map(dept => (
            <View key={dept.id} style={styles.deptCard}>
              <View style={styles.deptHeader}>
                <Text style={styles.deptName}>{dept.name}</Text>
                <View style={styles.leadBadge}>
                  <Text style={styles.leadBadgeText}>
                    Lead: {dept.lead?.full_name || 'Designated Lead'}
                  </Text>
                </View>
              </View>

              <Text style={styles.deptDesc}>{dept.description}</Text>

              {/* Authorized Emails Display */}
              <View style={styles.authorizedBox}>
                <Text style={styles.authBoxTitle}>🔐 Authorized Committee Emails (RBAC):</Text>
                {dept.members && dept.members.length > 0 ? (
                  dept.members.map((m, idx) => (
                    <View key={idx} style={styles.authMemberRow}>
                      <Text style={styles.authMemberName}>• {m.full_name}:</Text>
                      <Text style={styles.authMemberEmail}>{m.committee_email}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.authMemberNone}>Designated institutional email required</Text>
                )}
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Event Recaps Tab Content */}
      {activeTab === 'events' && (
        <View style={styles.eventsList}>
          {events.map(ev => (
            <TouchableOpacity
              key={ev.id}
              style={styles.eventCard}
              onPress={() => onSelectEvent(ev.id)}
              activeOpacity={0.8}
            >
              <View style={styles.eventTopRow}>
                <Text style={styles.eventTitle}>{ev.title}</Text>
                <Text style={styles.eventDate}>{ev.event_date || 'Past Event'}</Text>
              </View>

              <Text style={styles.eventSnippet} numberOfLines={2}>
                {ev.description}
              </Text>

              {/* Stats Preview */}
              {ev.stats && (
                <View style={styles.statsPreviewRow}>
                  {ev.stats.attendees && (
                    <View style={styles.statChip}>
                      <Text style={styles.statChipText}>👥 {ev.stats.attendees} Attendees</Text>
                    </View>
                  )}
                  {ev.stats.revenue && (
                    <View style={styles.statChip}>
                      <Text style={styles.statChipText}>💰 ₹{ev.stats.revenue}</Text>
                    </View>
                  )}
                  {ev.media && ev.media.length > 0 && (
                    <View style={styles.statChip}>
                      <Text style={styles.statChipText}>📸 {ev.media.length} Photos</Text>
                    </View>
                  )}
                </View>
              )}

              <View style={styles.eventFooter}>
                <Text style={styles.eventAuthor}>
                  Published by {ev.posted_by_user?.full_name || 'Committee Representative'}
                </Text>
                <Text style={styles.viewFullEvent}>View Recap & Gallery →</Text>
              </View>
            </TouchableOpacity>
          ))}

          {events.length === 0 && (
            <View style={styles.noEventsCard}>
              <Text style={styles.noEventsText}>No event recaps published for this committee yet.</Text>
            </View>
          )}
        </View>
      )}
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background
  },
  backButton: {
    paddingVertical: 8,
    marginBottom: 10
  },
  backButtonText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    fontWeight: '600'
  },
  heroCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 20,
    marginBottom: 16
  },
  heroBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12
  },
  heroIcon: {
    fontSize: 24
  },
  heroTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.xl,
    fontWeight: '800',
    marginBottom: 8
  },
  heroDescription: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    lineHeight: 18,
    marginBottom: 16
  },
  rbacNoticeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  rbacNoticeText: {
    color: colors.textMuted,
    fontSize: 11,
    flex: 1,
    marginRight: 8
  },
  postEventBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8
  },
  postEventText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700'
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 4,
    marginBottom: 16
  },
  tabButton: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 8
  },
  tabButtonActive: {
    backgroundColor: colors.card
  },
  tabText: {
    color: colors.textMuted,
    fontSize: typography.sizes.xs,
    fontWeight: '600'
  },
  tabTextActive: {
    color: colors.textPrimary
  },
  deptList: {
    gap: 12
  },
  deptCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 16
  },
  deptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  deptName: {
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: '700'
  },
  leadBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4
  },
  leadBadgeText: {
    color: colors.primaryLight,
    fontSize: 10,
    fontWeight: '600'
  },
  deptDesc: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    lineHeight: 18,
    marginBottom: 12
  },
  authorizedBox: {
    backgroundColor: colors.surface,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  authBoxTitle: {
    color: colors.warning,
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'uppercase'
  },
  authMemberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2
  },
  authMemberName: {
    color: colors.textSecondary,
    fontSize: 11
  },
  authMemberEmail: {
    color: colors.secondaryLight,
    fontSize: 11,
    fontWeight: '600'
  },
  authMemberNone: {
    color: colors.textMuted,
    fontSize: 11
  },
  eventsList: {
    gap: 12
  },
  eventCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 16
  },
  eventTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6
  },
  eventTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: '700',
    flex: 1,
    marginRight: 8
  },
  eventDate: {
    color: colors.textMuted,
    fontSize: 11
  },
  eventSnippet: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    lineHeight: 18,
    marginBottom: 10
  },
  statsPreviewRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10
  },
  statChip: {
    backgroundColor: colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  statChipText: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '600'
  },
  eventFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  eventAuthor: {
    color: colors.textMuted,
    fontSize: 10
  },
  viewFullEvent: {
    color: colors.primaryLight,
    fontSize: typography.sizes.xs,
    fontWeight: '700'
  },
  noEventsCard: {
    padding: 30,
    alignItems: 'center'
  },
  noEventsText: {
    color: colors.textMuted,
    fontSize: typography.sizes.xs
  }
});
