import { useLocales } from 'expo-localization';
import { camelCase, countBy } from 'lodash';
import { useMemo } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Chip, Icon, Surface, Text, useTheme } from 'react-native-paper';
import Animated, { StretchInY, StretchOutX } from 'react-native-reanimated';

import { useGetMyAgent } from '@/src/api/models/agents/agents';
import { useGetContracts } from '@/src/api/models/contracts/contracts';
import { useGetMyShips } from '@/src/api/models/fleet/fleet';
import { shipStatusIcons, voidRunnerIcons } from '@/src/constants/icons';
import { getFactionImageUrl } from '@/src/constants/urls';
import { useFleetAlerts } from '@/src/hooks/useFleetAlerts';
import {
  flexStyles,
  gapStyles,
  roundStyleObject,
} from '@/src/theme/globalStyles';
import { ShipStatusCounts } from '@/src/types/spaceTraders';

export const AgentHeader = () => {
  const { colors } = useTheme();
  const [locale] = useLocales();

  const { data: agent, isFetching: isFetchingAgent } = useGetMyAgent();
  const { data: ships, isFetching: isFetchingShips } = useGetMyShips();
  const { data: contracts, isFetching: isFetchingContracts } =
    useGetContracts();

  const { alerts, isCritical } = useFleetAlerts();
  console.log('AgentHeader alerts:', alerts, isCritical);

  const shipStatusCounts: ShipStatusCounts = useMemo(() => {
    if (isFetchingShips) {
      return { docked: 0, inOrbit: 0, inTransit: 0 };
    }

    const statusCounts = countBy(ships?.data || [], (ship) =>
      camelCase(ship.nav.status),
    );

    const dockedCount = statusCounts['docked'] || 0;
    const inOrbitCount = statusCounts['inOrbit'] || 0;
    const inTransitCount = statusCounts['inTransit'] || 0;

    return {
      docked: dockedCount,
      inOrbit: inOrbitCount,
      inTransit: inTransitCount,
    };
  }, [isFetchingShips, ships]);

  const formattedCredits = useMemo(() => {
    const formatter = new Intl.NumberFormat(locale.languageTag, {
      currency: locale.currencyCode || 'USD',
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
      style: 'currency',
    });
    return formatter
      .format(agent?.data.credits || 0)
      .replace(locale.currencySymbol || '$', '')
      .trim();
  }, [agent, locale]);

  return (
    <Surface
      elevation={5}
      mode="elevated"
      style={[
        { backgroundColor: colors.secondaryContainer },
        styles.headerContainer,
      ]}
    >
      <View style={[flexStyles.flexRow, gapStyles.gapMedium]}>
        {!!agent?.data.startingFaction && (
          <Image
            source={{
              uri: getFactionImageUrl(agent?.data.startingFaction),
            }}
            style={{ ...roundStyleObject(60) }}
          />
        )}
        <View style={[flexStyles.flex]}>
          <Text style={styles.agentSymbolText} variant="titleLarge">
            {agent?.data.symbol}
          </Text>
          <View style={[flexStyles.flexRow, styles.detailsContainer]}>
            <View>
              <View style={[flexStyles.flexRow, gapStyles.gapSmall]}>
                <Icon size={16} source={voidRunnerIcons.credits} />
                <Text variant="bodySmall">{formattedCredits}</Text>
              </View>
              <View style={[flexStyles.flexRow, gapStyles.gapSmall]}>
                <Icon size={16} source={voidRunnerIcons.contracts} />
                <Text variant="bodySmall">{contracts?.data.length}</Text>
              </View>
              <View style={[flexStyles.flexRow, gapStyles.gapSmall]}>
                <Icon size={16} source={shipStatusIcons.docked} />
                <Text variant="bodySmall">{`${shipStatusCounts.docked || '-'} | `}</Text>
                <Icon size={16} source={shipStatusIcons.inOrbit} />
                <Text variant="bodySmall">{`${shipStatusCounts.inOrbit || '-'} | `}</Text>
                <Icon size={16} source={shipStatusIcons.inTransit} />
                <Text variant="bodySmall">{`${shipStatusCounts.inTransit || '-'}`}</Text>
              </View>
            </View>
            {alerts.length > 0 && (
              <Animated.View entering={StretchInY} exiting={StretchOutX}>
                <Chip
                  mode="outlined"
                  style={{
                    backgroundColor: isCritical
                      ? colors.errorContainer
                      : colors.surface,
                  }}
                >
                  <View style={[flexStyles.flexRow, gapStyles.gapSmall]}>
                    <Icon size={16} source={voidRunnerIcons.alert} />
                    <Text variant="bodySmall">{`${alerts.length} Alert${alerts.length !== 1 ? 's' : ''}`}</Text>
                  </View>
                </Chip>
              </Animated.View>
            )}
          </View>
        </View>
      </View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  agentSymbolText: {
    marginBottom: 8,
  },
  detailsContainer: {
    justifyContent: 'space-between',
  },
  headerContainer: {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    paddingBottom: 8,
    paddingHorizontal: 16,
  },
});
