// Mapa de países (nombres en español) → emoji de bandera
export const FLAGS = {
  // Grupo A
  'México':           '🇲🇽',
  'Uzbekistán':       '🇺🇿',
  'Canadá':           '🇨🇦',
  'EAU':              '🇦🇪',

  // Grupo B
  'Argentina':        '🇦🇷',
  'Eslovaquia':       '🇸🇰',
  'Chile':            '🇨🇱',
  'Egipto':           '🇪🇬',

  // Grupo C
  'Estados Unidos':   '🇺🇸',
  'Gales':            '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
  'Panamá':           '🇵🇦',
  'Argelia':          '🇩🇿',

  // Grupo D
  'Brasil':           '🇧🇷',
  'Arabia Saudita':   '🇸🇦',
  'Costa Rica':       '🇨🇷',
  'Irán':             '🇮🇷',

  // Grupo E
  'España':           '🇪🇸',
  'Marruecos':        '🇲🇦',
  'Uruguay':          '🇺🇾',
  'Angola':           '🇦🇴',

  // Grupo F
  'Francia':          '🇫🇷',
  'Gabón':            '🇬🇦',
  'Alemania':         '🇩🇪',
  'Japón':            '🇯🇵',

  // Grupo G
  'Portugal':         '🇵🇹',
  'Zimbabwe':         '🇿🇼',
  'Croacia':          '🇭🇷',
  'Senegal':          '🇸🇳',

  // Grupo H
  'Holanda':          '🇳🇱',
  'Ecuador':          '🇪🇨',
  'Inglaterra':       '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'Camerún':          '🇨🇲',

  // Fases eliminatorias (equipos TBD)
  'Por definir':      '🏳️',
}

export function flag(team) {
  return FLAGS[team] ?? '🏳️'
}
