import { filter, reduce } from 'lodash';
import { useCallback, useMemo } from 'react';
import {
  ListRenderItemInfo,
  SectionList,
  StyleSheet,
  View,
} from 'react-native';
import { Divider, Text, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useGetMyShips } from '@/src/api/models/fleet/fleet';
import { useFleetAlerts } from '@/src/hooks/useFleetAlerts';
import { ShipWithAlerts } from '@/src/types/spaceTraders';

import { flexStyles, miscStyles } from '../../theme/globalStyles';
import { AgentHeader } from './components/AgentHeader';
import { ShipItem } from './components/ShipItem';

const shipSections: { data: ShipWithAlerts[]; title: string }[] = [
  { data: [], title: 'Needs Attention' },
  { data: [], title: 'En Route' },
  { data: [], title: 'Cooldown' },
  { data: [], title: 'Idle' },
] as const;

export const FleetScreen = () => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const { data: ships, isFetching: isFetchingShips } = useGetMyShips();

  const fleetAlerts = useFleetAlerts();
  const { alerts, isCritical, isFetchingAlerts } = fleetAlerts;

  const sectionedShipData = useMemo(() => {
    if (!ships?.data || isFetchingShips || isFetchingAlerts) {
      return [...shipSections];
    }

    return reduce(
      ships.data,
      (acc, ship) => {
        const shipAlerts = filter(alerts, { shipId: ship.symbol });
        const isShipAlertCritical = shipAlerts.some(
          (alert) => alert.severity === 'crit',
        );

        const shipWithAlerts: ShipWithAlerts = {
          ...ship,
          alerts: shipAlerts,
          isAlertCritical: isShipAlertCritical,
        };

        if (
          shipWithAlerts.alerts.length > 0 &&
          shipWithAlerts.alerts.some((a) => a.severity === 'crit')
        ) {
          acc[0].data.push(shipWithAlerts);
        } else if (ship.nav.status === 'IN_TRANSIT') {
          acc[1].data.push(shipWithAlerts);
        } else if (ship.cooldown.remainingSeconds > 0) {
          acc[2].data.push(shipWithAlerts);
        } else {
          acc[3].data.push(shipWithAlerts);
        }

        return acc;
      },
      [...shipSections],
    );
  }, [alerts, isFetchingAlerts, isFetchingShips, ships?.data]);

  const renderHeader = useCallback(() => {
    return (
      <AgentHeader alertCount={alerts.length} isAlertCritical={isCritical} />
    );
  }, [alerts.length, isCritical]);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<ShipWithAlerts>) => {
      return <ShipItem ship={item} />;
    },
    [],
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: (typeof shipSections)[0] }) => {
      if (section.data.length === 0) {
        return null;
      }

      return (
        <View
          style={[
            styles.sectionHeader,
            miscStyles.screenPadding,
            { backgroundColor: colors.background },
          ]}
        >
          <Text variant="titleMedium">{`/// ${section.title}`}</Text>
          <Divider bold />
        </View>
      );
    },
    [colors.background],
  );

  return (
    <View
      style={[
        flexStyles.flex,
        {
          backgroundColor: colors.secondaryContainer,
          paddingLeft: insets.left,
          paddingRight: insets.right,
          paddingTop: insets.top,
        },
      ]}
    >
      <SectionList
        // bounces={false}
        contentContainerStyle={styles.listContainer}
        keyExtractor={(item) => item.symbol}
        ListHeaderComponent={renderHeader}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        sections={sectionedShipData}
        stickySectionHeadersEnabled
        style={{
          backgroundColor: colors.background,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    flexGrow: 1,
  },
  sectionHeader: { marginBottom: 8 },
});
