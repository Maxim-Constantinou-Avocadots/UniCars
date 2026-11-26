export const ID3_MODEL = 'volkswagen-id-3-neo';
export function id3VersionId(selection = {}) {
  const battery = ['50', '58', '79'].includes(selection.battery) ? selection.battery : '58';
  const index = ['50', '58', '79'].indexOf(battery) * 2 + (selection.line === 'style' ? 2 : 1);
  return ID3_MODEL + '-version-' + index;
}
export function id3SelectionFromRoute(route = '') {
  const version = new URLSearchParams(route.split('?')[1] || '').get('version') || route.replace(/^smart-vehicle-/, '');
  const index = Number(version.match(/^volkswagen-id-3-neo-version-([1-6])$/)?.[1]);
  return index ? { battery: ['50', '58', '79'][Math.floor((index - 1) / 2)], line: index % 2 ? 'life' : 'style' } : { battery: '58', line: 'life' };
}
export function id3SelectionLabel(selection = {}) {
  const version = id3VersionId(selection);
  const normalized = id3SelectionFromRoute('smart-vehicle-' + version);
  return `Volkswagen ID.3 Neo ${normalized.line === 'style' ? 'Style' : 'Life'} ${normalized.battery} kWh`;
}
