export function accountTypeLabel(type?: string | null) {
  switch (type) {
    case 'ranger':
      return 'Rangers';
    case 'community':
      return 'Community';
    case 'base_camp':
      return 'Base Camp';
    case 'operations':
      return 'Operations';
    default:
      return 'Unclassified';
  }
}

export function siteTypeLabel(type?: string | null) {
  switch (type) {
    case 'ranger_gateway':
      return 'Ranger Gateway';
    case 'community_gateway':
      return 'Community Gateway';
    case 'base_camp':
      return 'Base Camp';
    case 'operations':
      return 'Operations';
    default:
      return 'Operational Site';
  }
}
