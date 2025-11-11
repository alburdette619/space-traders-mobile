import { differenceInSeconds, intervalToDuration } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';
import { useCountdown } from 'usehooks-ts';

import { useGetStatus } from '../api/models/global/global';

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
    const {
      days = 0,
      hours = 0,
      minutes = 0,
      seconds = 0,
    } = intervalToDuration({ end: secondsTillReset * 1000, start: 0 });

    const padDurationPart = (part: number) => part.toString().padStart(2, '0');
    return `${days > 0 ? `${padDurationPart(days)}:` : ''}${padDurationPart(hours)}:${padDurationPart(minutes)}:${padDurationPart(seconds)}`;
  }, [secondsTillReset]);

  return {
    humanReadableResetDate,
    isFetching: isFetchingStatus,
    // TODO: Prompt guest users when less than a day remains
    isLessThanADayTillReset: secondsTillReset < 86400,
  };
};
