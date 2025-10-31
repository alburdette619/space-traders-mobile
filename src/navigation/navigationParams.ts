export type RootNavigatorParams = {
  BrandSplash: undefined;
  NewAgent: undefined;
};

/* eslint-disable @typescript-eslint/no-empty-object-type */
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootNavigatorParams {}
  }
}
/* eslint-enable @typescript-eslint/no-empty-object-type */
