import { differenceInMinutes } from 'date-fns';
import { useMemo } from 'react';

import { useGetContracts } from '../api/models/contracts/contracts';
import { ContractAlert } from '../types/spaceTraders';

const contractDeadlineCriticalMinutes = 15;
const contractDeadlineWarningMinutes = 60;

export interface ContractAlertsResult {
  alerts: ContractAlert[];
  isCritical: boolean;
  isFetchingAlerts: boolean;
}

export const useContractAlerts = (): ContractAlertsResult => {
  const { data: contracts, isFetching: isFetchingContracts } =
    useGetContracts();

  return useMemo(() => {
    const alerts: ContractAlert[] = [];
    const now = new Date();

    if (!isFetchingContracts) {
      // Check for contract deadlines
      if (!isFetchingContracts) {
        contracts?.data.forEach((contract) => {
          if (!contract.terms.deadline) {
            return false;
          }

          const minutesLeft = differenceInMinutes(
            new Date(contract.terms.deadline),
            now,
          );

          if (minutesLeft <= contractDeadlineCriticalMinutes) {
            // Critical at less than 15 minutes
            alerts.push({
              contractId: contract.id,
              severity: 'crit',
              type: 'deadline',
            });
          } else if (minutesLeft <= contractDeadlineWarningMinutes) {
            // Warning at less than 1 hour
            alerts.push({
              contractId: contract.id,
              severity: 'warn',
              type: 'deadline',
            });
          }
        });
      }
    }

    return {
      alerts,
      isCritical: alerts.some((alert) => alert.severity === 'crit'),
      isFetchingAlerts: isFetchingContracts,
    };
  }, [contracts, isFetchingContracts]);
};
