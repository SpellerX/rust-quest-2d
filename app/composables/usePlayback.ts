import type { CellKind, GameCommand, Outcome } from '#shared/types'
import type { HeroState } from '../components/game/textures'

/**
 * Contrato entre o GameCanvas (Phaser) e o playback.
 * O playback NUNCA decide vitória — só anima o que o simulador já determinou.
 */
export interface GameSceneBridge {
  resetPlayer(): Promise<void>
  /** Anda/corre/sobe/desce até a célula (x, y) contada pelo simulador. */
  moveTo(cellX: number, cellY: number, kind: CellKind, durationMs: number): Promise<void>
  setState(state: HeroState): void
  deathFlash(): Promise<void>
}

let scene: GameSceneBridge | null = null
let playToken = 0

/** Duração por tipo de célula (ms) — dá o "peso" de cada movimento. */
const DURATION: Record<CellKind, number> = {
  walk: 140,
  jump: 165,
  fall: 105,
}

export function registerGameScene(s: GameSceneBridge | null) {
  scene = s
}

export function cancelPlayback() {
  playToken++
}

/** Cancela qualquer animação em andamento e devolve o boneco ao início. */
export async function resetScene() {
  cancelPlayback()
  await scene?.resetPlayer()
}

const delay = (ms: number) => new Promise<void>(res => setTimeout(res, ms))

/**
 * Reproduz a fila de comandos com o trace do simulador.
 * `trace[i]` só contém células sobrevividas — no comando do abandono a
 * animação para exatamente onde o jogador errou.
 */
export async function playSequence(
  commands: GameCommand[],
  outcome: Outcome,
  onDone: () => void,
): Promise<void> {
  const token = ++playToken
  const s = scene
  if (!s) {
    onDone()
    return
  }

  await s.resetPlayer()

  const steps = Math.min(commands.length, outcome.trace.length)
  for (let i = 0; i < steps; i++) {
    if (token !== playToken) return

    const cmd = commands[i]!
    if (cmd.type === 'wait') {
      s.setState('idle')
      await delay(cmd.durationMs)
      continue
    }
    if (cmd.type === 'speak') {
      // O herói "fala" (pausa breve) — o texto é didático, sem balão no MVP.
      s.setState('idle')
      await delay(500)
      continue
    }
    if (cmd.type === 'jump') {
      // Só prepara o estado — o arco anima nas células 'jump' do mover seguinte.
      continue
    }
    for (const cell of outcome.trace[i]!) {
      if (token !== playToken) return
      await s.moveTo(cell.x, cell.y, cell.k, DURATION[cell.k])
    }
  }

  if (token !== playToken) return

  if (outcome.result === 'death') {
    await s.deathFlash()
  }
  else {
    s.setState('idle')
  }
  onDone()
}
