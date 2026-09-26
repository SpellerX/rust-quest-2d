import type { CellKind, DeathCause, GameCommand, Outcome } from '../types'

export interface SuccessCondition {
  type: 'reach_goal' | 'reach_goal_all_coins'
}

const START = 'P'

/**
 * Simulador determinístico VERTICAL — fonte da verdade do sucesso.
 * Cliente e servidor rodam ESTE código sobre o mesmo código do jogador;
 * a animação Phaser é apenas replay cosmético.
 *
 * Mapa ASCII: P=início, #=sólido, ^=espinho, o=moeda, G=objetivo, .=ar,
 * V/E=NPCs decorativos (ignorados). Célula sem # embaixo = vão (cair).
 *
 * pulo(f): arco h(k)=min(k, f−k) sobre os f próximos passos horizontais;
 * pico ⌊f/2⌋ — cobre buraco de largura f E sobe 1 degrau quando f≥2.
 * Queda (sem chão estando no chão) não mata: desce até achar piso ou o
 * fundo do mapa (aí morte pit). Espinho mata ao entrar no chão.
 */
export function simulate(
  map: string[],
  commands: GameCommand[],
  cond: SuccessCondition,
): Outcome {
  let startX = -1
  let startY = -1
  for (let y = 0; y < map.length; y++) {
    const x = map[y]!.indexOf(START)
    if (x >= 0) {
      startX = x
      startY = y
      break
    }
  }

  const cell = (x: number, y: number): string => {
    if (y < 0 || y >= map.length) return ' '
    const row = map[y]!
    if (x < 0 || x >= row.length) return ' '
    return row[x] ?? ' '
  }
  const hasGround = (x: number, y: number) => cell(x, y + 1) === '#'

  let coinsTotal = 0
  for (const row of map) {
    for (const c of row) if (c === 'o') coinsTotal++
  }

  const coins = new Set<string>()
  let x = startX
  let y = startY
  let air = 0
  let jumpStep = 0
  let jumpTotal = 0
  let jumpBaseY = startY

  const trace: Outcome['trace'] = []
  const base = (result: Outcome['result'], deathStep?: number, cause?: DeathCause): Outcome => ({
    result,
    cause,
    deathStep,
    coinsCollected: coins.size,
    coinsTotal,
    finalX: x,
    finalY: y,
    trace,
  })

  if (startX < 0) return base('incomplete')

  const collect = (cx: number, cy: number) => {
    if (cell(cx, cy) === 'o') coins.add(`${cx},${cy}`)
  }

  const won = () => cell(x, y) === 'G' && hasGround(x, y)
    && (cond.type === 'reach_goal' || coins.size === coinsTotal)

  /**
   * Queda a partir da posição atual (sem chão sob os pés).
   * Grava células no trace dado; morte no fundo do mapa ou no espinho.
   */
  const fall = (
    steps: Array<{ x: number; y: number; k: CellKind }>,
    index: number,
  ): 'landed' | 'dead' => {
    while (!hasGround(x, y)) {
      y++
      if (y >= map.length) return 'dead'
      steps.push({ x, y, k: 'fall' })
      collect(x, y)
      if (cell(x, y) === '^') return 'dead'
    }
    return 'landed'
  }

  for (let i = 0; i < commands.length; i++) {
    const cmd = commands[i]!
    const steps: Array<{ x: number; y: number; k: CellKind }> = []
    trace.push(steps)

    // wait e speak não movem o boneco (speak só pausa na animação).
    if (cmd.type === 'wait' || cmd.type === 'speak') continue

    if (cmd.type === 'jump') {
      jumpTotal = Math.max(0, cmd.force)
      air = jumpTotal
      jumpStep = 0
      jumpBaseY = y
      continue
    }

    const dx = cmd.direction === 'right' ? 1 : -1
    for (let s = 0; s < cmd.steps; s++) {
      const airNoInicio = air
      const jumpActive = airNoInicio > 0
      if (jumpActive) jumpStep++

      // Arco do pulo: altura h(k) = min(k, f−k).
      const h = jumpActive ? Math.min(jumpStep, jumpTotal - jumpStep) : 0
      const ny = jumpActive ? jumpBaseY - h : y
      const nx = x + dx

      // Parede/teto bloqueia o passo e cancela o resto do movimento.
      if (cell(nx, ny) === '#') break

      // Entra na célula (a morte acontece AO ENTRAR → animação para aí).
      x = nx
      y = ny
      steps.push({ x, y, k: jumpActive ? 'jump' : 'walk' })
      collect(x, y)

      // Espinho: no chão mata; com chão sob o arco também (pousar em espinho mata).
      if (cell(x, y) === '^' && (airNoInicio === 0 || hasGround(x, y))) {
        return base('death', i, 'spike')
      }

      if (hasGround(x, y)) {
        // Aterrissagem (inclusive subir 1 degrau: arco termina sobre patamar).
        air = 0
        jumpStep = 0
      }
      else if (airNoInicio === 0) {
        // Andou para fora do chão → Queda (não-mortal até o fundo).
        if (fall(steps, i) === 'dead') return base('death', i, 'pit')
        // Aterrisou; o movimento continua no novo y.
        air = 0
        jumpStep = 0
      }
      else {
        // No ar: consome 1 passo de imunidade (depois de todos os checks).
        air--
      }

      if (won()) return base('win')
    }
  }

  // Fim do programa: parado sem chão → queda automática (mesmo com ar restante).
  if (commands.length > 0 && !hasGround(x, y)) {
    const last = trace[trace.length - 1]!
    if (fall(last, commands.length - 1) === 'dead') {
      return base('death', commands.length - 1, 'pit')
    }
    if (won()) return base('win')
  }

  return base('incomplete')
}
