/**
 * EventRecapDetail Screen
 * Comprehensive event summary view featuring multi-image gallery slider,
 * detailed JSONB analytics tiles, official achievements, and organizer provenance.
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
import { EventRecap } from '../types';
import { api } from '../services/api';

interface EventRecapDetailProps {
  eventId: string;
  onBack: () => void;
}

export const EventRecapDetail: React.FC<EventRecapDetailProps> = ({
  eventId,
  onBack
}) => {
  const [event, setEvent] = useState<EventRecap | null>(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadEvent() {
      try {
        const res = await api.events.getDetail(eventId);
        if (res.event) setEvent(res.event);
      } catch (err) {
        console.error('Failed to load event recap:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadEvent();
  }, [eventId]);

  if (isLoading || !event) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const mediaList = event.media && event.media.length > 0
    ? event.media
    : ['https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=1000'];

  const activePhoto = mediaList[selectedPhotoIndex] || mediaList[0];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>← Back to Events</Text>
      </TouchableOpacity>

      {/* Main Photo Hero */}
      <View style={styles.heroImageWrapper}>
        <Image source={{ uri: activePhoto }} style={styles.heroImage} resizeMode="cover" />
        <View style={styles.photoIndexBadge}>
          <Text style={styles.photoIndexText}>
            {selectedPhotoIndex + 1} / {mediaList.length}
          </Text>
        </View>
      </View>

      {/* Photo Gallery Thumbnails */}
      {mediaList.length > 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbnailsRow}>
          {mediaList.map((url, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.thumbBox, selectedPhotoIndex === idx && styles.thumbBoxActive]}
              onPress={() => setSelectedPhotoIndex(idx)}
            >
              <Image source={{ uri: url }} style={styles.thumbImage} resizeMode="cover" />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Title & Date */}
      <View style={styles.titleSection}>
        <View style={styles.dateBadge}>
          <Text style={styles.dateBadgeText}>📅 {event.event_date || 'Past Event'}</Text>
        </View>
        <Text style={styles.title}>{event.title}</Text>
      </View>

      {/* Official Analytics / JSONB Stats Grid */}
      {event.stats && Object.keys(event.stats).length > 0 && (
        <View style={styles.statsCard}>
          <Text style={styles.statsCardHeading}>📊 Official Event Metrics & Analytics</Text>
          <View style={styles.statsGrid}>
            {Object.entries(event.stats).map(([key, val], idx) => {
              const formattedKey = key.replace(/_/g, ' ').toUpperCase();
              const isRevenue = key.toLowerCase().includes('revenue');
              return (
                <View key={idx} style={styles.statTile}>
                  <Text style={[styles.statValue, isRevenue && styles.textGreen]}>
                    {isRevenue ? `₹${Number(val).toLocaleString()}` : typeof val === 'number' ? val.toLocaleString() : String(val)}
                  </Text>
                  <Text style={styles.statLabel}>{formattedKey}</Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Description */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionHeading}>📝 Event Overview</Text>
        <Text style={styles.bodyText}>{event.description}</Text>
      </View>

      {/* Key Achievements */}
      {event.achievements && (
        <View style={[styles.sectionCard, styles.achievementCard]}>
          <Text style={styles.achievementHeading}>🏆 Key Milestones & Achievements</Text>
          <Text style={styles.achievementContent}>{event.achievements}</Text>
        </View>
      )}

      {/* Verified Provenance / Poster Attribution */}
      <View style={styles.provenanceCard}>
        <View style={styles.provenanceAvatarBox}>
          <Image
            source={{ uri: event.posted_by_user?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400' }}
            style={styles.provenanceAvatar}
          />
        </View>
        <View style={styles.provenanceDetails}>
          <Text style={styles.provenanceAuthor}>
            Verified Recap by {event.posted_by_user?.full_name || 'Authorized Member'}
          </Text>
          <Text style={styles.provenanceRole}>
            Authenticated via Institutional Committee Email & 45-Day Active Session
          </Text>
        </View>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background
  },
  backButton: {
    paddingVertical: 8,
    marginBottom: 8
  },
  backButtonText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    fontWeight: '600'
  },
  heroImageWrapper: {
    height: 240,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  heroImage: {
    width: '100%',
    height: '100%'
  },
  photoIndexBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  photoIndexText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700'
  },
  thumbnailsRow: {
    flexDirection: 'row',
    marginTop: 10,
    marginBottom: 14
  },
  thumbBox: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent'
  },
  thumbBoxActive: {
    borderColor: colors.primary
  },
  thumbImage: {
    width: '100%',
    height: '100%'
  },
  titleSection: {
    marginTop: 12,
    marginBottom: 16
  },
  dateBadge: {
    backgroundColor: colors.surface,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: 8
  },
  dateBadgeText: {
    color: colors.textMuted,
    fontSize: 11
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.sizes.xl,
    fontWeight: '800',
    lineHeight: 28
  },
  statsCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 16,
    marginBottom: 16
  },
  statsCardHeading: {
    color: colors.secondaryLight,
    fontSize: typography.sizes.xs,
    fontWeight: '700',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  statTile: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center'
  },
  statValue: {
    color: colors.textPrimary,
    fontSize: typography.sizes.lg,
    fontWeight: '800'
  },
  textGreen: {
    color: colors.success
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 9,
    marginTop: 4,
    fontWeight: '600'
  },
  sectionCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 16,
    marginBottom: 16
  },
  sectionHeading: {
    color: colors.textPrimary,
    fontSize: typography.sizes.sm,
    fontWeight: '700',
    marginBottom: 8
  },
  bodyText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    lineHeight: 22
  },
  achievementCard: {
    backgroundColor: 'rgba(245, 158, 11, 0.05)',
    borderColor: 'rgba(245, 158, 11, 0.3)'
  },
  achievementHeading: {
    color: colors.warning,
    fontSize: typography.sizes.sm,
    fontWeight: '700',
    marginBottom: 8
  },
  achievementContent: {
    color: '#fef3c7',
    fontSize: typography.sizes.sm,
    lineHeight: 22
  },
  provenanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  provenanceAvatarBox: {
    marginRight: 12
  },
  provenanceAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.primary
  },
  provenanceDetails: {
    flex: 1
  },
  provenanceAuthor: {
    color: colors.textPrimary,
    fontSize: typography.sizes.xs,
    fontWeight: '700'
  },
  provenanceRole: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 2
  }
});
