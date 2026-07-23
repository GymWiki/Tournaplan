/** The fixed set of five discipline line colors an organizer picks from (see design brief §3). */
export const disciplineColors = ['blue', 'red', 'yellow', 'green', 'purple'] as const;
export type DisciplineColor = (typeof disciplineColors)[number];

/** 3px left-border accent — the "veldlijn" signature, never a fill. */
export const disciplineColorBorderClass: Record<DisciplineColor, string> = {
  blue: 'border-l-discipline-blue',
  red: 'border-l-discipline-red',
  yellow: 'border-l-discipline-yellow',
  green: 'border-l-discipline-green',
  purple: 'border-l-discipline-purple',
};

export const disciplineColorSwatchClass: Record<DisciplineColor, string> = {
  blue: 'bg-discipline-blue',
  red: 'bg-discipline-red',
  yellow: 'bg-discipline-yellow',
  green: 'bg-discipline-green',
  purple: 'bg-discipline-purple',
};
