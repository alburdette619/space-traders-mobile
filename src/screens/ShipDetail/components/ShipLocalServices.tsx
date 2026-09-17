import { useNavigation } from '@react-navigation/native';
import { StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Icon,
  Surface,
  Text,
  TouchableRipple,
  useTheme,
} from 'react-native-paper';

import { type Ship } from '@/src/api/models/models-Ship/ship';
import { ShipNavStatus } from '@/src/api/models/models-ShipNavStatus/shipNavStatus';
import { useGetWaypoint } from '@/src/api/models/systems/systems';
import { WaypointServiceChips } from '@/src/components/WaypointServiceChips';
import { flexStyles, gapStyles } from '@/src/theme/globalStyles';

export const ShipLocalServices = ({ ship }: { ship: Ship }) => {
  const { navigate } = useNavigation();
  const { colors, roundness } = useTheme();
  const isInTransit = ship.nav.status === ShipNavStatus.IN_TRANSIT;
  const { data, isError, isPending } = useGetWaypoint(
    ship.nav.systemSymbol,
    ship.nav.waypointSymbol,
    {
      query: {
        enabled: !isInTransit,
        staleTime: Infinity,
      },
    },
  );
  const waypoint = data?.data;

  if (isInTransit) {
    return null;
  }

  return (
    <Surface
      elevation={0}
      style={[
        styles.surface,
        {
          backgroundColor: colors.surfaceVariant,
          borderColor: colors.outlineVariant,
          borderRadius: roundness,
        },
      ]}
    >
      <TouchableRipple
        accessibilityLabel={`Open waypoint ${ship.nav.waypointSymbol}`}
        accessibilityRole="button"
        onPress={() =>
          navigate('WaypointDetail', {
            systemSymbol: ship.nav.systemSymbol,
            waypointSymbol: ship.nav.waypointSymbol,
          })
        }
      >
        <View>
          <View style={[flexStyles.flexRow, gapStyles.gapMedium, styles.link]}>
            <Icon
              color={colors.secondary}
              size={24}
              source="map-marker-outline"
            />
            <Text style={flexStyles.flex} variant="titleMedium">
              Open Waypoint
            </Text>
            <Icon
              color={colors.onSurfaceVariant}
              size={22}
              source="chevron-right"
            />
          </View>

          <View style={styles.services}>
            {isPending ? (
              <View style={[flexStyles.flexRow, gapStyles.gapMedium]}>
                <ActivityIndicator size="small" />
                <Text
                  style={{ color: colors.onSurfaceVariant }}
                  variant="bodySmall"
                >
                  Checking local services…
                </Text>
              </View>
            ) : isError || !waypoint ? (
              <Text style={{ color: colors.error }} variant="bodySmall">
                Local services could not be loaded.
              </Text>
            ) : (
              <WaypointServiceChips traits={waypoint.traits} />
            )}
          </View>
        </View>
      </TouchableRipple>
    </Surface>
  );
};

const styles = StyleSheet.create({
  link: {
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  services: {
    paddingBottom: 12,
    paddingHorizontal: 12,
  },
  surface: {
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
});
