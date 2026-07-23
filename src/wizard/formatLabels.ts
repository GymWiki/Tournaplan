import type { AvailableFormatName } from '../tournament/formats/registry';

export const formatLabels: Record<AvailableFormatName, string> = {
  single_elimination: 'Knock-out (single elimination)',
  round_robin: 'Iedereen tegen iedereen (round robin)',
  groups_knockout: 'Poules + knock-out',
};
