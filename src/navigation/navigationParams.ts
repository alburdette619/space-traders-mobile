export type MainAppTabsParams = {
  Fleet: undefined;
  GalaxyMap: undefined;
  Operations: undefined;
  Stats: undefined;
};

export type RootNavigatorParams = {
  AgentCreationInstructions: undefined;
  BrandSplash: undefined;
  MainAppTabs: undefined;
  NewAgent: undefined;
  ShipDetail: { shipId: string };
  Trade: { shipId: string };
};

/* eslint-disable @typescript-eslint/no-empty-object-type */
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootNavigatorParams {}
  }
}
/* eslint-enable @typescript-eslint/no-empty-object-type */
