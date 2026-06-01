export default function ReglamentoPage() {
  return (
    <div style={{ paddingBottom: '80px' }}>

      {/* Header */}
      <div className="card" style={{ marginBottom: '12px', background: 'var(--green)', borderRadius: 'var(--radius)' }}>
        <div style={{ padding: '20px 16px' }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '28px', color: '#fff', letterSpacing: '1px', lineHeight: 1 }}>
            📋 Reglamento
          </div>
          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,.75)', marginTop: '4px' }}>
            Mundial 2026 — Torneo de pronósticos
          </div>
        </div>
      </div>

      {/* Sistema de puntos */}
      <div className="card" style={{ marginBottom: '12px' }}>
        <div className="card-header">Sistema de puntos</div>

        {[
          {
            pts: 3,
            cls: 'pts-3',
            title: 'Resultado exacto',
            desc: 'Acertás el marcador exacto de los dos equipos.',
            eg: 'Pronosticás 2-1 → sale 2-1',
          },
          {
            pts: 2,
            cls: 'pts-2',
            title: 'Ganador + un gol correcto',
            desc: 'Acertás el ganador (o empate) y además uno de los dos goles.',
            eg: 'Pronosticás 2-1 → sale 3-1 (visitante ✓) o 2-0 (local ✓)',
          },
          {
            pts: 1,
            cls: 'pts-1',
            title: 'Solo ganador o empate',
            desc: 'Acertás quién gana o que es empate, pero ninguno de los dos goles.',
            eg: 'Pronosticás 2-1 → sale 1-0',
          },
          {
            pts: 0,
            cls: 'pts-0',
            title: 'Sin acierto',
            desc: 'No acertás el resultado del partido.',
            eg: 'Pronosticás que gana el local → gana el visitante o empata',
          },
        ].map(({ pts, cls, title, desc, eg }) => (
          <div key={pts} style={{ display: 'flex', gap: '14px', padding: '14px 16px', borderBottom: '1px solid var(--gray-100)', alignItems: 'flex-start' }}>
            <div className={`pts-chip ${cls}`} style={{ minWidth: '36px', height: '36px', fontSize: '20px', flexShrink: 0 }}>{pts}</div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gray-800)', marginBottom: '3px' }}>{title}</div>
              <div style={{ fontSize: '13px', color: 'var(--gray-600)', marginBottom: '4px' }}>{desc}</div>
              <div style={{ fontSize: '12px', color: 'var(--gray-400)', background: 'var(--gray-50)', padding: '4px 8px', borderRadius: '6px', display: 'inline-block' }}>
                Ejemplo: {eg}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cierre de pronósticos */}
      <div className="card" style={{ marginBottom: '12px' }}>
        <div className="card-header">⏱ Cierre de pronósticos</div>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--gray-100)' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gray-800)', marginBottom: '4px' }}>
            10 minutos antes del inicio
          </div>
          <div style={{ fontSize: '13px', color: 'var(--gray-600)' }}>
            Los pronósticos se cierran automáticamente 10 minutos antes del comienzo de cada partido.
            Una vez cerrado, el casillero queda bloqueado y no se puede modificar.
          </div>
        </div>
        <div style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gray-800)', marginBottom: '4px' }}>
            Podés cambiar tu pronóstico las veces que quieras
          </div>
          <div style={{ fontSize: '13px', color: 'var(--gray-600)' }}>
            Mientras el partido no esté cerrado, podés editar tu pronóstico cuantas veces quieras.
            Solo cuenta el último guardado.
          </div>
        </div>
      </div>

      {/* Colores */}
      <div className="card" style={{ marginBottom: '12px' }}>
        <div className="card-header">🎨 Indicadores visuales</div>
        {[
          { color: 'var(--green)', bg: 'var(--green-light)', label: 'Verde', desc: 'Pronóstico guardado, todavía editable' },
          { color: '#7c3aed', bg: '#ede9fe', label: 'Violeta', desc: 'Pronóstico cerrado, ya no se puede cambiar' },
          { color: 'var(--gray-400)', bg: 'var(--gray-100)', label: 'Gris', desc: 'Sin pronóstico cargado' },
        ].map(({ color, bg, label, desc }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderBottom: '1px solid var(--gray-100)' }}>
            <div style={{ width: '40px', height: '32px', borderRadius: '6px', background: bg, border: `2px solid ${color}`, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gray-800)' }}>{label}</div>
              <div style={{ fontSize: '12px', color: 'var(--gray-400)' }}>{desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Torneos */}
      <div className="card" style={{ marginBottom: '12px' }}>
        <div className="card-header">🏆 Torneos</div>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--gray-100)' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gray-800)', marginBottom: '4px' }}>Unirse a un torneo</div>
          <div style={{ fontSize: '13px', color: 'var(--gray-600)' }}>
            Podés unirte a cualquier torneo activo de la lista. Cada torneo tiene su propia tabla de posiciones independiente.
            Podés participar en más de un torneo al mismo tiempo.
          </div>
        </div>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--gray-100)' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gray-800)', marginBottom: '4px' }}>Crear un torneo</div>
          <div style={{ fontSize: '13px', color: 'var(--gray-600)' }}>
            Podés solicitar la creación de un torneo propio (trabajo, familia, amigos, etc.).
            La solicitud queda pendiente hasta que el administrador la apruebe.
            Una vez aprobado, cualquier usuario puede unirse libremente.
          </div>
        </div>
        <div style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gray-800)', marginBottom: '4px' }}>Seleccionar torneo activo</div>
          <div style={{ fontSize: '13px', color: 'var(--gray-600)' }}>
            Desde la pestaña <strong>Torneos</strong> podés elegir en cuál torneo estás jugando en el momento.
            Los partidos y la tabla de posiciones siempre muestran el torneo seleccionado.
          </div>
        </div>
      </div>

      {/* Partidos */}
      <div className="card" style={{ marginBottom: '12px' }}>
        <div className="card-header">⚽ Partidos</div>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--gray-100)' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gray-800)', marginBottom: '4px' }}>Fase de grupos</div>
          <div style={{ fontSize: '13px', color: 'var(--gray-600)' }}>
            48 partidos distribuidos en 12 grupos (A al L) de 4 equipos cada uno.
            Todos los partidos disponibles para pronosticar desde el inicio del torneo.
          </div>
        </div>
        <div style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gray-800)', marginBottom: '4px' }}>Fases eliminatorias</div>
          <div style={{ fontSize: '13px', color: 'var(--gray-600)' }}>
            Los partidos de Ronda de 32, Octavos, Cuartos, Semifinal y Final se van habilitando
            a medida que se definen los cruces. El administrador los carga una vez conocidos los clasificados.
          </div>
        </div>
      </div>

      {/* General */}
      <div className="card">
        <div className="card-header">📌 General</div>
        {[
          'Los resultados oficiales los carga el administrador al finalizar cada partido.',
          'Los puntos se calculan automáticamente al cerrar el resultado.',
          'En caso de empate en la tabla, el desempate es por mayor cantidad de resultados exactos (3 pts).',
          'El torneo se extiende hasta la Final del Mundial 2026.',
        ].map((item, i, arr) => (
          <div key={i} style={{ display: 'flex', gap: '10px', padding: '12px 16px', borderBottom: i < arr.length - 1 ? '1px solid var(--gray-100)' : 'none', alignItems: 'flex-start' }}>
            <span style={{ color: 'var(--green)', fontWeight: 700, flexShrink: 0, marginTop: '1px' }}>•</span>
            <span style={{ fontSize: '13px', color: 'var(--gray-600)', lineHeight: 1.5 }}>{item}</span>
          </div>
        ))}
      </div>

    </div>
  )
}
