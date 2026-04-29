// Triage flow data + matching logic. Pure functions — no side effects, no
// network calls. State lives in React; nothing here writes to URL, storage,
// or network. See docs/triagem-terapiaconecta.md for the design contract.

export const QUESTIONS = {
  p1: {
    key: 'p1',
    number: 1,
    text: 'O que mais descreve como você tem se sentido?',
    skippable: false,
    options: [
      { id: 'ansioso',        label: 'Ansioso, tenso, com a cabeça acelerada' },
      { id: 'triste',         label: 'Triste, sem energia, desanimado' },
      { id: 'raiva',          label: 'Com raiva, irritado, no limite' },
      { id: 'perdido',        label: 'Perdido, confuso, sem saber quem sou' },
      { id: 'sobrecarregado', label: 'Sobrecarregado, no automático, exausto' },
      { id: 'machucado',      label: 'Machucado por algo que aconteceu' },
    ],
  },
  p2: {
    key: 'p2',
    number: 2,
    text: 'Onde isso mais aparece na sua vida?',
    skippable: false,
    options: [
      { id: 'trabalho',        label: 'No trabalho ou nos estudos' },
      { id: 'relacionamentos', label: 'Nos meus relacionamentos (família, parceiro, amigos)' },
      { id: 'eu_mesmo',        label: 'Na relação comigo mesmo' },
      { id: 'filhos',          label: 'Na maternidade/paternidade ou com meus filhos' },
      { id: 'perda_mudanca',   label: 'Depois de uma perda ou mudança grande' },
      { id: 'todo_lugar',      label: 'Em todo lugar, não consigo identificar' },
    ],
  },
  p3: {
    key: 'p3',
    number: 3,
    text: 'O que você mais quer da terapia agora?',
    skippable: true,
    options: [
      { id: 'lidar_melhor',  label: 'Lidar melhor com o que estou sentindo' },
      { id: 'entender',      label: 'Entender o que está acontecendo comigo' },
      { id: 'atravessar',    label: 'Atravessar uma fase difícil específica' },
      { id: 'mudar_padroes', label: 'Mudar padrões que se repetem na minha vida' },
      { id: 'falar_espaco',  label: 'Só quero um espaço pra falar, sem pressão' },
    ],
  },
}

// Doc-form theme IDs (used in matrix + analytics for stability)
export const THEMES = {
  ANSIEDADE_ESTRESSE:        'ansiedade_estresse',
  DEPRESSAO_TRISTEZA:        'depressao_tristeza',
  LUTO_PERDAS:               'luto_perdas',
  RELACIONAMENTOS_FAMILIA:   'relacionamentos_familia',
  TRAUMA_VIOLENCIA:          'trauma_violencia',
  AUTOCONHECIMENTO:          'autoconhecimento',
  TRABALHO_CARREIRA:         'trabalho_carreira',
  NEURODIVERGENCIA_ATIPICOS: 'neurodivergencia_atipicos',
}

// Matrix IDs → backend DB slugs. Keep this in sync with themes:seed output.
export const THEME_SLUG_MAP = {
  ansiedade_estresse:        'ansiedade-estresse',
  depressao_tristeza:        'depressao-tristeza',
  luto_perdas:               'luto-perdas',
  relacionamentos_familia:   'relacionamentos-familia',
  trauma_violencia:          'trauma-violencia',
  autoconhecimento:          'autoconhecimento-autoestima',
  trabalho_carreira:         'trabalho-carreira',
  neurodivergencia_atipicos: 'neurodivergencia-filhos',
}

// Human-readable display names for the result screen — same as the 8 themes
// seeded in the backend but referenced by matrix ID for consistency.
export const THEME_DISPLAY_NAME = {
  ansiedade_estresse:        'Ansiedade e estresse',
  depressao_tristeza:        'Depressão e tristeza profunda',
  luto_perdas:               'Luto e perdas',
  relacionamentos_familia:   'Relacionamentos e família',
  trauma_violencia:          'Trauma e violência',
  autoconhecimento:          'Autoconhecimento e autoestima',
  trabalho_carreira:         'Trabalho e carreira',
  neurodivergencia_atipicos: 'Neurodivergência e filhos atípicos',
}

export const MATRIZ_TEMAS = {
  // ANSIOSO
  'ansioso+trabalho':        { ansiedade_estresse: 0.6, trabalho_carreira: 0.4 },
  'ansioso+relacionamentos': { ansiedade_estresse: 0.7, relacionamentos_familia: 0.3 },
  'ansioso+eu_mesmo':        { ansiedade_estresse: 0.8, autoconhecimento: 0.2 },
  'ansioso+filhos':          { ansiedade_estresse: 0.5, neurodivergencia_atipicos: 0.5 },
  'ansioso+perda_mudanca':   { ansiedade_estresse: 0.6, luto_perdas: 0.4 },
  'ansioso+todo_lugar':      { redirecionar_whatsapp: 1.0 },

  // TRISTE
  'triste+trabalho':        { depressao_tristeza: 0.6, trabalho_carreira: 0.4 },
  'triste+relacionamentos': { depressao_tristeza: 0.6, relacionamentos_familia: 0.4 },
  'triste+eu_mesmo':        { depressao_tristeza: 0.7, autoconhecimento: 0.3 },
  'triste+filhos':          { depressao_tristeza: 0.5, neurodivergencia_atipicos: 0.5 },
  'triste+perda_mudanca':   { luto_perdas: 0.7, depressao_tristeza: 0.3 },
  'triste+todo_lugar':      { redirecionar_whatsapp: 1.0 },

  // RAIVA
  'raiva+trabalho':        { trabalho_carreira: 0.6, ansiedade_estresse: 0.4 },
  'raiva+relacionamentos': { relacionamentos_familia: 0.8, autoconhecimento: 0.2 },
  'raiva+eu_mesmo':        { autoconhecimento: 0.7, ansiedade_estresse: 0.3 },
  'raiva+filhos':          { relacionamentos_familia: 0.5, neurodivergencia_atipicos: 0.5 },
  'raiva+perda_mudanca':   { luto_perdas: 0.6, autoconhecimento: 0.4 },
  'raiva+todo_lugar':      { redirecionar_whatsapp: 1.0 },

  // PERDIDO
  'perdido+trabalho':        { autoconhecimento: 0.6, trabalho_carreira: 0.4 },
  'perdido+relacionamentos': { autoconhecimento: 0.6, relacionamentos_familia: 0.4 },
  'perdido+eu_mesmo':        { autoconhecimento: 1.0 },
  'perdido+filhos':          { autoconhecimento: 0.5, neurodivergencia_atipicos: 0.5 },
  'perdido+perda_mudanca':   { autoconhecimento: 0.6, luto_perdas: 0.4 },
  'perdido+todo_lugar':      { redirecionar_whatsapp: 1.0 },

  // SOBRECARREGADO
  'sobrecarregado+trabalho':        { trabalho_carreira: 0.7, ansiedade_estresse: 0.3 },
  'sobrecarregado+relacionamentos': { relacionamentos_familia: 0.6, ansiedade_estresse: 0.4 },
  'sobrecarregado+eu_mesmo':        { ansiedade_estresse: 0.6, autoconhecimento: 0.4 },
  'sobrecarregado+filhos':          { neurodivergencia_atipicos: 0.7, ansiedade_estresse: 0.3 },
  'sobrecarregado+perda_mudanca':   { luto_perdas: 0.5, ansiedade_estresse: 0.5 },
  'sobrecarregado+todo_lugar':      { redirecionar_whatsapp: 1.0 },

  // MACHUCADO
  'machucado+trabalho':        { trauma_violencia: 0.7, trabalho_carreira: 0.3 },
  'machucado+relacionamentos': { trauma_violencia: 0.6, relacionamentos_familia: 0.4 },
  'machucado+eu_mesmo':        { trauma_violencia: 0.8, autoconhecimento: 0.2 },
  'machucado+filhos':          { trauma_violencia: 0.5, relacionamentos_familia: 0.5 },
  'machucado+perda_mudanca':   { luto_perdas: 0.8, trauma_violencia: 0.2 },
  'machucado+todo_lugar':      { redirecionar_whatsapp: 1.0 },
}

// P3 → preferred therapeutic approach slugs (kind=abordagem on Tag).
// Slugs match seed data in backend/lib/tasks/seed_abordagens.rake.
export const MODIFICADOR_ABORDAGEM = {
  lidar_melhor:  ['tcc', 'act', 'breve-focal'],
  entender:      ['psicanalitica', 'psicodinamica'],
  atravessar:    ['breve-focal', 'centrada-pessoa'],
  mudar_padroes: ['psicanalitica', 'psicodinamica', 'esquemas'],
  falar_espaco:  ['centrada-pessoa', 'humanista', 'gestaltica'],
}

/**
 * Maps (p1, p2, p3) answers to a theme matching result.
 * @param {string} p1
 * @param {string} p2
 * @param {string|null} p3 - optional (skippable)
 * @returns {{ tipo: 'redirecionar' } | { tipo: 'resultado', temaPrincipal, temaSecundario, abordagensPreferenciais }}
 */
export function resolverTema(p1, p2, p3) {
  const chave = `${p1}+${p2}`
  const pesos = MATRIZ_TEMAS[chave]

  if (!pesos || pesos.redirecionar_whatsapp) {
    return { tipo: 'redirecionar' }
  }

  const sortedThemes = Object.entries(pesos).sort((a, b) => b[1] - a[1])
  const temaPrincipal = sortedThemes[0]?.[0] ?? null
  const temaSecundario = sortedThemes[1]?.[0] ?? null

  if (!temaPrincipal) {
    return { tipo: 'redirecionar' }
  }

  return {
    tipo: 'resultado',
    temaPrincipal,
    temaSecundario,
    abordagensPreferenciais: p3 ? (MODIFICADOR_ABORDAGEM[p3] ?? []) : [],
  }
}

/**
 * Fisher-Yates with jitter for equitable ordering of tied/equivalent records.
 * Pure — doesn't mutate input.
 */
export function shuffleForEquity(arr) {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}
