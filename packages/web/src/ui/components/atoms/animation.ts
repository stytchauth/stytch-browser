/**
 * Read the value of the --transition-duration variable from CSS
 */
export function getTransitionDuration(element: Element) {
  return cssTimeToMs(window.getComputedStyle(element).getPropertyValue('--st-transition-duration'));
}

function cssTimeToMs(time: string) {
  const t = parseFloat(time);
  if (Number.isNaN(t)) return 0;
  return time.endsWith('ms') ? t : t * 1000;
}
