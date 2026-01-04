import { intervalToDuration } from 'date-fns';

export const getHumanReadableCountdown = (totalSeconds: number) => {
  const {
    days = 0,
    hours = 0,
    minutes = 0,
    seconds = 0,
  } = intervalToDuration({ end: totalSeconds * 1000, start: 0 });

  const padDurationPart = (part: number) => part.toString().padStart(2, '0');
  return `${days > 0 ? `${padDurationPart(days)}:` : ''}${padDurationPart(hours)}:${padDurationPart(minutes)}:${padDurationPart(seconds)}`;
};
