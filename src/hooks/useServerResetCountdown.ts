import { differenceInSeconds } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';
import { useCountdown } from 'usehooks-ts';

import { useGetStatus } from '../api/models/global/global';
import { getHumanReadableCountdown } from '../utils/dateTime';

export const useServerResetCountdown = () => {
  const { data: status, isFetching: isFetchingStatus } = useGetStatus();
  const [initialSecondsTillReset, setInitialSecondsTillReset] =
    useState<number>(0);

  const [secondsTillReset, { resetCountdown, startCountdown }] = useCountdown({
    countStart: initialSecondsTillReset,
  });

  useEffect(() => {
    if (isFetchingStatus || !status) return;

    const secondsUntilReset = Math.abs(
      differenceInSeconds(new Date(status.serverResets.next), new Date()),
    );
    setInitialSecondsTillReset(secondsUntilReset);

    resetCountdown();
    startCountdown();
  }, [status, isFetchingStatus, resetCountdown, startCountdown]);

  const humanReadableResetDate = useMemo(() => {
    return getHumanReadableCountdown(secondsTillReset);
  }, [secondsTillReset]);

  return {
    humanReadableResetDate,
    isFetching: isFetchingStatus,
    // TODO: Prompt guest users when less than a day remains
    isLessThanADayTillReset: secondsTillReset < 86400,
  };
};
