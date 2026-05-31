// Mapa país → código ISO 2 letras para flagcdn.com
const ISO = {
  'México':           'mx',
  'Uzbekistán':       'uz',
  'Canadá':           'ca',
  'EAU':              'ae',
  'Argentina':        'ar',
  'Eslovaquia':       'sk',
  'Chile':            'cl',
  'Egipto':           'eg',
  'Estados Unidos':   'us',
  'Gales':            'gb-wls',
  'Panamá':           'pa',
  'Argelia':          'dz',
  'Brasil':           'br',
  'Arabia Saudita':   'sa',
  'Costa Rica':       'cr',
  'Irán':             'ir',
  'España':           'es',
  'Marruecos':        'ma',
  'Uruguay':          'uy',
  'Angola':           'ao',
  'Francia':          'fr',
  'Gabón':            'ga',
  'Alemania':         'de',
  'Japón':            'jp',
  'Portugal':         'pt',
  'Zimbabwe':         'zw',
  'Croacia':          'hr',
  'Senegal':          'sn',
  'Holanda':          'nl',
  'Ecuador':          'ec',
  'Inglaterra':       'gb-eng',
  'Camerún':          'cm',
}

export function flagUrl(team) {
  const code = ISO[team]
  if (!code) return null
  return `https://flagcdn.com/24x18/${code}.png`
}
