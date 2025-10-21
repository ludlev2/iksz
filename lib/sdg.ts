export interface SustainableDevelopmentGoal {
  id: number;
  title: string;
  shortLabel: string;
  color: string;
}

export const SUSTAINABLE_DEVELOPMENT_GOALS: SustainableDevelopmentGoal[] = [
  { id: 1, title: 'No Poverty', shortLabel: 'Poverty', color: '#E5243B' },
  { id: 2, title: 'Zero Hunger', shortLabel: 'Hunger', color: '#DDA63A' },
  { id: 3, title: 'Good Health and Well-being', shortLabel: 'Health', color: '#4C9F38' },
  { id: 4, title: 'Quality Education', shortLabel: 'Education', color: '#C5192D' },
  { id: 5, title: 'Gender Equality', shortLabel: 'Equality', color: '#FF3A21' },
  { id: 6, title: 'Clean Water and Sanitation', shortLabel: 'Water', color: '#26BDE2' },
  { id: 7, title: 'Affordable and Clean Energy', shortLabel: 'Energy', color: '#FCC30B' },
  { id: 8, title: 'Decent Work and Economic Growth', shortLabel: 'Work', color: '#A21942' },
  { id: 9, title: 'Industry, Innovation and Infrastructure', shortLabel: 'Industry', color: '#FD6925' },
  { id: 10, title: 'Reduced Inequalities', shortLabel: 'Inequality', color: '#DD1367' },
  { id: 11, title: 'Sustainable Cities and Communities', shortLabel: 'Cities', color: '#FD9D24' },
  { id: 12, title: 'Responsible Consumption and Production', shortLabel: 'Consumption', color: '#BF8B2E' },
  { id: 13, title: 'Climate Action', shortLabel: 'Climate', color: '#3F7E44' },
  { id: 14, title: 'Life Below Water', shortLabel: 'Oceans', color: '#0A97D9' },
  { id: 15, title: 'Life on Land', shortLabel: 'Land', color: '#56C02B' },
  { id: 16, title: 'Peace, Justice and Strong Institutions', shortLabel: 'Peace', color: '#00689D' },
  { id: 17, title: 'Partnerships for the Goals', shortLabel: 'Partnerships', color: '#19486A' },
];

/**
 * Returns an SVG path command describing an arc segment between startAngle and endAngle.
 */
export const describeArc = (options: {
  cx: number;
  cy: number;
  innerRadius: number;
  outerRadius: number;
  startAngle: number;
  endAngle: number;
}): string => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle } = options;

  const polarToCartesian = (radius: number, angle: number) => {
    const radians = ((angle - 90) * Math.PI) / 180;
    return {
      x: cx + radius * Math.cos(radians),
      y: cy + radius * Math.sin(radians),
    };
  };

  const startOuter = polarToCartesian(outerRadius, endAngle);
  const endOuter = polarToCartesian(outerRadius, startAngle);
  const startInner = polarToCartesian(innerRadius, startAngle);
  const endInner = polarToCartesian(innerRadius, endAngle);

  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  return [
    'M',
    startOuter.x,
    startOuter.y,
    'A',
    outerRadius,
    outerRadius,
    0,
    largeArcFlag,
    0,
    endOuter.x,
    endOuter.y,
    'L',
    startInner.x,
    startInner.y,
    'A',
    innerRadius,
    innerRadius,
    0,
    largeArcFlag,
    1,
    endInner.x,
    endInner.y,
    'Z',
  ].join(' ');
};
