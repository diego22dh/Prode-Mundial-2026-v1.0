// Mapa país → emoji bandera (usando caracteres unicode directos)
export const FLAGS = {
  'México':           '🇲🇽',
  'Uzbekistán':       '🇺🇿',
  'Canadá':           '🇨🇦',
  'EAU':              '🇦🇪',
  'Argentina':        '🇦🇷',
  'Eslovaquia':       '🇸🇰',
  'Chile':            '🇨🇱',
  'Egipto':           '🇪🇬',
  'Estados Unidos':   '🇺🇸',
  'Gales':            '🇬🇧',
  'Panamá':           '🇵🇦',
  'Argelia':          '🇩🇿',
  'Brasil':           '🇧🇷',
  'Arabia Saudita':   '🇸🇦',
  'Costa Rica':       '🇨🇷',
  'Irán':             '🇮🇷',
  'España':           '🇪🇸',
  'Marruecos':        '🇲🇦',
  'Uruguay':          '🇺🇾',
  'Angola':           '🇦🇴',
  'Francia':          '🇫🇷',
  'Gabón':            '🇬🇦',
  'Alemania':         '🇩🇪',
  'Japón':            '🇯🇵',
  'Portugal':         '🇵🇹',
  'Zimbabwe':         '🇿🇼',
  'Croacia':          '🇭🇷',
  'Senegal':          '🇸🇳',
  'Holanda':          '🇳🇱',
  'Ecuador':          '🇪🇨',
  'Inglaterra':       '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'Camerún':          '🇨🇲',
}

export function flag(team) {
  return FLAGS[team] ?? ''
}
