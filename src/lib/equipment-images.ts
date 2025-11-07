const NAME_MAPPINGS: Record<string, string> = {
  "bulldozer": "Bulldozer.jpg",
  "camion citerne": "Camion citerne.jpg",
  "camion benne": "Camion-benne.jpg", 
  "chargeuse": "Chargeuse.jpg",
  "compacteur": "Compacteur.jpg",
  "grue mobile": "Grue mobile.jpg",
  "grue": "Grue mobile.jpg",
  "manitou": "Manitou.jpg",
  "niveuleuse": "Niveuleuse.jpg",
  "pelle hydraulique": "Pelle hydraulique.jpg",
  "pelle": "Pelle hydraulique.jpg",
  "porte char": "Porte char.jpg",
  "tractopelle": "Tractopelle.jpg"
}

export function getEquipmentImage(equipmentName: string): string {
  const normalizedName = equipmentName.toLowerCase().trim()
  
  // Direct match
  const directMatch = NAME_MAPPINGS[normalizedName]
  if (directMatch) return `/equipement-images/${directMatch}`
  
  // Partial match
  for (const [key, image] of Object.entries(NAME_MAPPINGS)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return `/equipement-images/${image}`
    }
  }
  
  // Default fallback
  return "/equipement-images/Pelle hydraulique.jpg"
}