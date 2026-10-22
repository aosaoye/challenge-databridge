import { Videojuego } from '../types/videojuego';

// Catálogo de portadas de reserva para los datos iniciales de prueba (seed).
// Si tu base de datos en Postgres incluye una columna de imagen ('imagenUrl' o 'imagen_url'),
// el carrusel la consumirá DIRECTAMENTE y no usará este fallback.
const SEED_GAME_COVERS: Record<string, string> = {
  'the witcher': 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/292030/library_600x900.jpg',
  'zelda': 'https://images.igdb.com/igdb/image/upload/t_cover_big/co3p2d.jpg',
  'grand theft auto': 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/271590/library_600x900.jpg',
  'gta': 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/271590/library_600x900.jpg',
  'red dead': 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1174180/library_600x900.jpg',
  'last of us': 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1888930/library_600x900.jpg',
  'hades': 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1145360/library_600x900.jpg',
};

const GENERIC_COVER = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=900&q=80';

/**
 * 100% Dinámico:
 * Si en Postgres guardas la imagen en 'imagenUrl' o 'imagen_url',
 * se toma automáticamente la URL de la base de datos sin importar qué juego sea.
 */
export function getGameCoverUrl(item?: Partial<Videojuego>): string {
  if (!item) return GENERIC_COVER;

  const title = (item.titulo || '').toLowerCase();

  // 1. Prioridad: campo proveniente de tu base de datos Postgres
  const dbImage = item.imagenUrl || (item as any)?.imagen_url;
  if (dbImage && typeof dbImage === 'string' && dbImage.trim().length > 0) {
    const trimmed = dbImage.trim();
    // Las URLs de Wikimedia/Wikipedia devuelven error 403 Forbidden en React Native
    const isWikimedia = trimmed.includes('wikimedia.org') || trimmed.includes('wikipedia.org');
    if (!isWikimedia) {
      return trimmed;
    }
  }

  // 2. Fallback temporal para los juegos de catálogo conocidos
  for (const [key, url] of Object.entries(SEED_GAME_COVERS)) {
    if (title.includes(key)) {
      return url;
    }
  }

  // 3. Si agregas un juego a Postgres sin portada, usa un placeholder visual neutral
  return GENERIC_COVER;
}

/**
 * 100% Dinámico para CUALQUIER juego que añadas a Postgres:
 * Extrae automáticamente el nombre principal eliminando subtítulos o ediciones,
 * funcionando para "Elden Ring", "Cyberpunk 2077", "God of War", etc.
 */
export function getWatermarkWord(title?: string): string {
  if (!title) return 'GAME';

  // Elimina subtítulos tras ':', '-', '–', '|'
  let clean = title.split(/[:\-–—|]/)[0].trim();

  // Limpia artículos o sufijos de edición ("Part I", "Edition", etc.)
  clean = clean.replace(/\s+(Part\s+[I|V|X\d]+|Edition|Remastered|Remake)$/i, '').trim();

  // Si tiene más de 3 palabras, toma las 3 primeras para mantener balance tipográfico
  const words = clean.split(/\s+/).slice(0, 3).join(' ');

  return words.toUpperCase() || 'GAME';
}

// Paletas cromáticas de ambiente cinematográfico
const PALETTES = [
  { bg: '#171224', accent: '#A78BFA' }, // Violeta oscuro
  { bg: '#0E1F18', accent: '#34D399' }, // Verde bosque
  { bg: '#10192E', accent: '#60A5FA' }, // Azul medianoche
  { bg: '#24140D', accent: '#FB923C' }, // Ámbar cálido
  { bg: '#1E1318', accent: '#F472B6' }, // Carmesí oscuro
  { bg: '#101E24', accent: '#38BDF8' }, // Cian petróleo
  { bg: '#1A1E11', accent: '#A3E635' }, // Oliva musgo
];

/**
 * 100% Dinámico:
 * Genera un color armónico único para CUALQUIER juego mediante un hash
 * determinista de su título o su posición en la base de datos.
 */
export function getGamePalette(index: number, title?: string) {
  if (title) {
    let hash = 0;
    for (let i = 0; i < title.length; i++) {
      hash = (hash << 5) - hash + title.charCodeAt(i);
      hash |= 0;
    }
    const paletteIndex = Math.abs(hash) % PALETTES.length;
    return PALETTES[paletteIndex];
  }
  return PALETTES[index % PALETTES.length];
}

export function formatScore(score: number | string | undefined): string {
  if (score === undefined || score === null) return '—';
  const num = typeof score === 'number' ? score : parseFloat(score);
  return isNaN(num) ? '—' : num.toFixed(1);
}
