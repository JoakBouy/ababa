import L from 'leaflet';

let initialized = false;

export function initLeafletIcons() {
  if (initialized) return;
  initialized = true;
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

export function createStatusIcon(status: string) {
  const isOnline = status === 'online';
  const colorClass = isOnline ? 'bg-[#005477]' : 'bg-error';
  const shadowColor = isOnline ? 'rgba(0,84,119,0.8)' : 'rgba(186,26,26,0.8)';
  return L.divIcon({
    className: 'custom-leaflet-icon',
    html: `
      <div class="relative flex items-center justify-center w-6 h-6">
        <div class="absolute w-full h-full rounded-full animate-ping opacity-40 ${colorClass}"></div>
        <div class="relative w-3 h-3 rounded-full border-2 border-white ${colorClass}" style="box-shadow: 0 0 10px ${shadowColor}"></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
}

export function createStarlinkIcon() {
  return L.divIcon({
    className: 'custom-leaflet-icon',
    html: `
      <div class="relative flex items-center justify-center w-4 h-4">
        <div class="absolute w-full h-full rounded-full bg-[#005477] opacity-80"></div>
        <div class="relative w-2 h-2 rounded-full border border-white bg-[#005477]"></div>
      </div>
    `,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -8],
  });
}
