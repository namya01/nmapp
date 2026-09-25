/**
 * EventRecapFeed Screen
 * Global browsable timeline of all past committee events,
 * with stats badges, photo previews, and society filters.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet
} from 'react-native';
import { colors, typography } from '../theme/colors';
import { EventRecap, Committee } from '../types';
import { api } from '../services/api';

interface EventRecapFeedProps {
  onSelectEvent: (eventId: string) => void;
  onSelectCommittee: (committeeId: string) => void;
}

export const EventRecapFeed: React.FC<EventRecapFeedProps> = ({
  onSelectEvent,
  onSelectCommittee
}) => {
  const [events, setEvents] = useState<EventRecap[]>([]);
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [selectedCommitteeId, setSelectedCommitteeId] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadFeed() {
      try {
        const [feedRes, commRes] = await Promise.all([
          api.events.getFeed(),
          api.committees.getAll()
        ]);
        if (feedRes.events) setEvents(feedRes.events);
        if (commRes.committees) setCommittees(commRes.committees);
      } catch (err) {
        console.error('Failed to load event feed:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadFeed();
  }, []);

  const filteredEvents = selectedCommitteeId === 'all'
    ? events
    : events.filter(e => e.committee_id === selectedCommitteeId);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Campus Event Recaps</Text>
        <Text style={styles.subtitle}>
          Official event reports, attendee analytics, revenue totals & photo galleries
        </Text>
      </View>

      {/* Filter Horizontal Carousel */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        <TouchableOpacity
          style={[styles.filterChip, selectedCommitteeId === 'all' && styles.filterChipActive]}
          onPress={() => setSelectedCommitteeId('all')}
        >
          <Text style={[styles.filterText, selectedCommitteeId === 'all' && styles.filterTextActive]}>
            All Committees
          </Text>
        </TouchableOpacity>

        {committees.map(c => (
          <TouchableOpacity
            key={c.id}
            style={[styles.filterChip, selectedCommitteeId === c.id && styles.filterChipActive]}
            onPress={() => setSelectedCommitteeId(c.id)}
          >
            <Text style={[styles.filterText, selectedCommitteeId === c.id && styles.filterTextActive]}>
              {c.name.split('(')[0].trim()}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Feed Cards */}
      {isLoading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <View style={styles.eventsList}>
          {filteredEvents.map(event => {
            const coverImage = event.media && event.media.length > 0
              ? event.media[0]
              : 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800';

            return (
              <TouchableOpacity
                key={event.id}
                style={styles.card}
                onPress={() => onSelectEvent(event.id)}
                activeOpacity={0.85}
              >
                {/* Cover Image */}
                <View style={styles.imageContainer}>
                  <Image source={{ uri: coverImage }} style={styles.coverImage} resizeMode="cover" />
                  <View style={styles.committeeTag}>
                    <Text style={styles.committeeTagText}>
                      {event.committee_name || 'Society Event'}
                    </Text>
                  </View>
                  {event.media && event.media.length > 1 && (
                    <View style={styles.photoCountBadge}>
                      <Text style={styles.photoCountText}>📷 {event.media.length} photos</Text>
                    </View>
                  )}
                </View>

                {/* Card Body */}
                <View style={styles.cardBody}>
                  <View style={styles.metaRow}>
                    <Text style={styles.eventDate}>📅 {event.event_date || 'Past Event'}</Text>
                    <Text style={styles.readMoreHint}>Full Report →</Text>
                  </View>

                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventDesc} numberOfLines={2}>
                    {event.description}
                  </Text>

                  {/* JSONB Stats Row */}
                  {event.stats && (
                    <View style={styles.statsRow}>
                      {event.stats.attendees && (
                        <View style={styles.statMetric}>
                          <Text style={styles.statValue}>
                            {event.stats.attendees.toLocaleString()}
                          </Text>
                          <Text style={styles.statLabel}>Attendees</Text>
                        </View>
                      )}

                      {event.stats.revenue && (
                        <View style={styles.statMetric}>
                          <Text style={[styles.statValue, styles.statValueGreen]}>
                            ₹{Number(event.stats.revenue).toLocaleString()}
                          </Text>
                          <Text style={styles.statLabel}>Revenue Raised</Text>
                        </View>
                      )}

                      {event.stats.projects_submitted && (
                        <View style={styles.statMetric}>
                          <Text style={[styles.statValue, styles.statValueCyan]}>
                            {event.stats.projects_submitted}
                          </Text>
                          <Text style={styles.statLabel}>Projects</Text>
                        </View>
                      )}
                    </View>
                  )}

                  {/* Achievements Snippet */}
                  {event.achievements && (
                    <View style={styles.achievementBox}>
                      <Text style={styles.achievementText} numberOfLines={2}>
                        🏆 {event.achievements}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}

          {filteredEvents.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No event recaps found for this selection.</Text>
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
  header: {
    marginBottom: 14
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
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 12
  },
  filterChip: {
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  filterText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontWeight: '600'
  },
  filterTextActive: {
    color: '#ffffff'
  },
  eventsList: {
    gap: 16,
    marginTop: 6
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: 'hidden'
  },
  imageContainer: {
    height: 180,
    width: '100%',
    position: 'relative',
    backgroundColor: '#000'
  },
  coverImage: {
    width: '100%',
    height: '100%'
  },
  committeeTag: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(10, 15, 29, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)'
  },
  committeeTagText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700'
  },
  photoCountBadge: {
    position: 'absolute',
    bottom: 10,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4
  },
  photoCountText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600'
  },
  cardBody: {
    padding: 16
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  eventDate: {
    color: colors.textMuted,
    fontSize: 11
  },
  readMoreHint: {
    color: colors.primaryLight,
    fontSize: 11,
    fontWeight: '700'
  },
  eventTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: '700',
    marginBottom: 6
  },
  eventDesc: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    lineHeight: 18,
    marginBottom: 12
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: colors.surface,
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  statMetric: {
    flex: 1,
    alignItems: 'center'
  },
  statValue: {
    color: colors.textPrimary,
    fontSize: typography.sizes.sm,
    fontWeight: '700'
  },
  statValueGreen: {
    color: colors.success
  },
  statValueCyan: {
    color: colors.secondaryLight
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 9,
    textTransform: 'uppercase',
    marginTop: 2
  },
  achievementBox: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderLeftWidth: 3,
    borderLeftColor: colors.warning,
    padding: 8,
    borderRadius: 4
  },
  achievementText: {
    color: '#fbbf24',
    fontSize: 11,
    lineHeight: 16
  },
  emptyState: {
    padding: 40,
    alignItems: 'center'
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: typography.sizes.xs
  }
});
