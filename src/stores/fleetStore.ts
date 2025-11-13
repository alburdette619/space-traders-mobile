import { create } from 'zustand';

interface FleetStore {
  setShipFilter: (filter: string) => void;
  setShipSort: (sort: string) => void;
  shipFilter: string;
  shipSort: string;
}

export const useFleetStore = create<FleetStore>((set) => ({
  setShipFilter: (filter: string) => set({ shipFilter: filter }),
  setShipSort: (sort: string) => set({ shipSort: sort }),
  shipFilter: '',
  shipSort: 'name',
}));
