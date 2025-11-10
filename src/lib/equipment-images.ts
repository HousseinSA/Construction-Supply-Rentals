const NAME_MAPPINGS: Record<string, string> = {
  "benne articulée": "Benne articulée.jpg",
  "benne articulee": "Benne articulée.jpg",
  "articulated dump truck": "Benne articulée.jpg",
  bulldozer: "Bulldozer.jpg",
  "camion citerne": "Camion citerne.jpg",
  "tank truck": "Camion Citerne.webp",
  "camion benne": "Camion-benne.jpg",
  "camion-benne": "Camion-benne.jpg",
  "camion plateau": "Camion plateau.jpg",
  "flatbed truck": "Camion plateau.jpg",
  chargeuse: "Chargeuse.jpg",
  "chargeuse sur chenilles": "Chargeuse sur Chenilles.jpeg",
  "chargeuse chenilles": "Chargeuse sur Chenilles.jpeg",
  "chargeuse sur pneus": "Chargeuse sur Pneus.jpg",
  "chargeuse pneus": "Chargeuse sur Pneus.jpg",
  "chariot élévateur": "Chariot Élévateur.jpg",
  "chariot elevateur": "Chariot Élévateur.jpg",

  "compacteur monocylindre": "Compacteur Monocylindre.jpg",
  "compacteur pied de mouton": "Compacteur Pied de Mouton.avif",
  "compacteur tandem": "Compacteur Tandem.jpg",
  "décapeuse": "Décapeuse.jpeg",
  decapeuse: "Décapeuse.jpeg",
  "electric hoist": "Electric Hoist.jpeg",
  "palan électrique": "Electric Hoist.jpeg",
  "grue à tour": "Grue à Tour.png",
  "grue a tour": "Grue à Tour.png",
  "tower crane": "Grue à Tour.png",
  "grue mobile": "Grue mobile.jpg",
  grue: "Grue mobile.jpg",
  manitou: "Manitou.jpg",
  "mini-pelle": "Mini-pelle.jpg",
  "mini pelle": "Mini-pelle.jpg",
  minipelle: "Mini-pelle.jpg",
  "nacelle élévatrice": "Nacelle Élévatrice.webp",
  "nacelle elevatrice": "Nacelle Élévatrice.webp",
  "aerial lift": "Nacelle Élévatrice.webp",
  niveuleuse: "Niveuleuse.jpg",
  niveleuse: "Niveuleuse.jpg",
  "pelle hydraulique": "Pelle hydraulique.jpg",
  pelle: "Pelle hydraulique.jpg",
  pilonneuse: "Pilonneuse.jpg",
  "plaque vibrante": "Plaque Vibrante.jpeg",
  "porte char": "Porte char.jpg",
  "porte-char": "Porte char.jpg",
  tractopelle: "Tractopelle.jpg",
  "tracto-pelle": "Tractopelle.jpg",
  "tracteur routier": "Tracteur routier.jpg",
  "truck tractor": "Tracteur routier.jpg",
  "road tractor": "Tracteur routier.jpg",
}

export function getEquipmentImage(equipmentName: string): string {
  const normalizedName = equipmentName.toLowerCase().trim()

  const directMatch = NAME_MAPPINGS[normalizedName]
  if (directMatch) return `/equipement-images/${directMatch}`

  if (normalizedName.includes("pied de mouton")) {
    return `/equipement-images/Compacteur Pied de Mouton.avif`
  }

  for (const [key, image] of Object.entries(NAME_MAPPINGS)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return `/equipement-images/${image}`
    }
  }

  return "/equipement-images/default-fallback-image.png"
}
