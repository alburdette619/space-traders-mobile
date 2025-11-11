export type MainAppTabsParams = {
  Contracts: undefined;
  Fleet: undefined;
  GalaxyMap: undefined;
  Stats: undefined;
};

export type RootNavigatorParams = {
  AgentCreationInstructions: undefined;
  BrandSplash: undefined;
  MainAppTabs: undefined;
  NewAgent: undefined;
};

/* eslint-disable @typescript-eslint/no-empty-object-type */
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootNavigatorParams {}
  }
}
/* eslint-enable @typescript-eslint/no-empty-object-type */
