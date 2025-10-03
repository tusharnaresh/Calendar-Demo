import { Event } from "@/data/mockEvents";
import { getEventColors } from "@/utils/eventColorSchemes";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AppointmentLabel } from "../event-card-components/AppointmentLabel";
import { ExternalSourceBadge } from "../event-card-components/ExternalSourceBadge";
import { SideBar } from "../event-card-components/SideBar";
import { TimeStamp } from "../event-card-components/TimeStamp";
import { VideoIcon } from "../event-card-components/VideoIcon";

interface SmallEventProps {
  event: Event;
  onPress?: (event: Event) => void;
}

export const SmallEvent: React.FC<SmallEventProps> = ({ event, onPress }) => {
  const colors = getEventColors(event);
  const cardState = event.cardState || 'active';
  const hasVideoLink =
    event.location?.videoType && event.location.videoType.length > 0;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.bg }]}
      onPress={() => onPress?.(event)}
      activeOpacity={0.7}
    >
      <SideBar color={colors.sideBar} size="small" />
      <View style={styles.content}>
        {/* Header: Title + Video Icon */}
        <View style={styles.header}>
          <Text
            style={[styles.title, { color: colors.text }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {event.title}
          </Text>
          {hasVideoLink && (
            <VideoIcon
              externalSource={event.externalSource}
              size="small"
              textColor={colors.text}
            />
          )}
        </View>
        
        {/* Subtitle: Timestamp */}
        <TimeStamp
          startTime={event.startTime}
          endTime={event.endTime}
          size="small"
        />
        
        {/* Bottom Right: Label, External Icon */}
        <View style={styles.footer}>
          <AppointmentLabel 
            label={event.label}
            textColor={colors.text}
            size="small"
            cardState={cardState}
          />
          
          <ExternalSourceBadge
            isExternal={event.isExternal}
            externalSource={event.externalSource}
            textColor={colors.text}
            size="small"
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: "100%",
    height: "100%",
    borderRadius: 4,
    marginBottom: 4,
    overflow: "hidden",
    elevation: 0.5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0.5 },
    shadowOpacity: 0.04,
    shadowRadius: 1,
    flexDirection: "row",
  },
  content: {
    flex: 1,
    padding: 6,
    justifyContent: "flex-start",
    position: "relative",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 11,
    fontWeight: "600",
    lineHeight: 13,
    flex: 1,
    marginBottom: 4,
  },
  footer: {
    position: "absolute",
    bottom: 4,
    right: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
});
