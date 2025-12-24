// Heavy equipment that requires porte-char transport
export const REQUIRES_TRANSPORT_EQUIPMENT = [
  'Pelle hydraulique',
  'Bulldozer',
  'Chargeuse',
  'Tractopelle',
  'Niveleuse',
  'Grue mobile',
  'Chargeuse sur chenilles',
  'Décapeuse',
  'Compacteur',
  'Compacteur tandem',
  'Compacteur monocylindre',
] as const;

export function requiresTransport(equipmentName: string): boolean {
  const lowerName = equipmentName.toLowerCase();
  
  // Don't require transport for porte-char itself
  if (lowerName.includes('porte-char') || lowerName.includes('porte char')) {
    return false;
  }
  
  return REQUIRES_TRANSPORT_EQUIPMENT.some(
    name => lowerName.includes(name.toLowerCase())
  );
}
