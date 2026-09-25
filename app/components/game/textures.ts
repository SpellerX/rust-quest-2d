/**
 * Pixel-art procedural — gerado em canvas 2D no cliente (sem assets externos).
 * Só chamar dentro de onMounted/onCreate da cena Phaser (toca `document`).
 *
 * Herói: spritesheet 6 colunas × 5 linhas de frames 48×48 (16×16 lógicos ×3),
 * uma linha por estado: idle(4) run(6) jump(1) fall(1) hit(2).
 * NPCs: 2 frames de idle (bob sutil embutido nos frames).
 */

export type HeroState = 'idle' | 'run' | 'jump' | 'fall' | 'hit'
export type NpcKind = 'guard' | 'engineer'

const SCALE = 3
const CELL = 16 * SCALE // 48 = 1 tile
const HERO_COLS = 6

const C = {
  hood: '#3d5afe',
  hoodDark: '#3049c9',
  skin: '#f4c28a',
  belt: '#ffca28',
  boot: '#5d4037',
  bootDark: '#4e342e',
  eye: '#16213e',
  cloak: '#6d4c41',
  cloakDark: '#5d4037',
  lantern: '#ffd600',
  lanternDim: '#c9a227',
  helmet: '#ff8f00',
  overalls: '#37474f',
  metal: '#b0bec5',
} as const

type Px = (x: number, y: number, w: number, h: number, color: string) => void

function makePainter(ctx: CanvasRenderingContext2D, ox: number, oy: number): Px {
  return (x, y, w, h, color) => {
    ctx.fillStyle = color
    ctx.fillRect(ox + x * SCALE, oy + y * SCALE, w * SCALE, h * SCALE)
  }
}

interface HeroFrame {
  bob: 0 | 1
  /** swing das pernas: -1 trás, 0 neutro, 1 frente */
  swing: -1 | 0 | 1
  legs: 'stand' | 'tuck' | 'split'
  arms: 'down' | 'up' | 'split'
  face: 'open' | 'blink' | 'x'
}

function drawHero(px: Px, f: HeroFrame) {
  const b = f.bob
  // Capuz (cabeça) — perfil olhando à direita
  px(5, 0 + b, 6, 1, C.hoodDark)
  px(4, 1 + b, 7, 4, C.hood)
  px(7, 2 + b, 4, 3, C.skin) // rosto
  if (f.face === 'open') {
    px(9, 3 + b, 1, 1, C.eye)
  }
  else if (f.face === 'blink') {
    px(9, 3 + b, 1, 1, C.skin)
  }
  else {
    // olhos em X (morte)
    px(8, 2 + b, 1, 1, C.eye)
    px(10, 2 + b, 1, 1, C.eye)
    px(9, 3 + b, 1, 1, C.eye)
    px(8, 4 + b, 1, 1, C.eye)
    px(10, 4 + b, 1, 1, C.eye)
  }

  // Corpo
  px(5, 5 + b, 6, 4, C.hood)
  px(5, 8 + b, 6, 1, C.belt) // cinto âmbar

  // Braços
  if (f.arms === 'down') {
    px(4, 5 + b, 1, 3, C.hoodDark)
    px(11, 5 + b, 1, 3, C.hoodDark)
  }
  else if (f.arms === 'up') {
    px(4, 3 + b, 1, 2, C.hoodDark)
    px(4, 2 + b, 1, 1, C.skin)
    px(11, 3 + b, 1, 2, C.hoodDark)
    px(11, 2 + b, 1, 1, C.skin)
  }
  else {
    // split: braços abertos na horizontal
    px(2, 6 + b, 2, 1, C.hoodDark)
    px(1, 6 + b, 1, 1, C.skin)
    px(12, 6 + b, 2, 1, C.hoodDark)
    px(14, 6 + b, 1, 1, C.skin)
  }

  // Pernas / botas (pés firmes em y13)
  if (f.legs === 'stand') {
    px(5 + f.swing, 9, 3, 4, C.boot)
    px(8 - f.swing, 9, 3, 4, C.boot)
    px(5 + f.swing, 13, 4, 1, C.bootDark)
    px(8 - f.swing, 13, 4, 1, C.bootDark)
  }
  else if (f.legs === 'tuck') {
    // agachado no ar
    px(5, 10, 3, 3, C.boot)
    px(8, 10, 3, 3, C.boot)
    px(5, 13, 4, 1, C.bootDark)
    px(8, 13, 4, 1, C.bootDark)
  }
  else {
    // split (no ar / morte)
    px(3, 10, 3, 3, C.boot)
    px(10, 10, 3, 3, C.boot)
    px(2, 13, 4, 1, C.bootDark)
    px(10, 13, 4, 1, C.bootDark)
  }
}

function drawGuard(px: Px, bright: boolean) {
  // Vigia: capuz + capa marrom + lanterna
  px(5, 1, 6, 1, C.cloakDark)
  px(4, 2, 7, 4, C.cloak)
  px(7, 3, 4, 3, C.skin)
  px(9, 4, 1, 1, C.eye)
  px(4, 6, 8, 7, C.cloak) // capa
  px(4, 10, 8, 1, C.cloakDark)
  px(5, 13, 3, 2, C.bootDark)
  px(9, 13, 3, 2, C.bootDark)
  // lanterna na mão direita
  px(12, 7, 2, 3, bright ? C.lantern : C.lanternDim)
  px(12, 6, 2, 1, C.cloakDark)
}

function drawEngineer(px: Px, raised: boolean) {
  // Engenheiro: capacete laranja + macacão
  px(5, 1, 6, 1, C.helmet)
  px(4, 2, 8, 2, C.helmet)
  px(5, 4, 6, 3, C.skin)
  px(9, 5, 1, 1, C.eye)
  px(5, 7, 6, 6, C.overalls)
  px(5, 7, 6, 1, C.metal) // ombreira
  px(5, 13, 3, 2, C.bootDark)
  px(8, 13, 3, 2, C.bootDark)
  // chave inglesa
  if (raised) {
    px(12, 3, 1, 4, C.metal)
    px(11, 2, 3, 1, C.metal)
  }
  else {
    px(12, 8, 1, 4, C.metal)
    px(11, 11, 3, 1, C.metal)
  }
}

function newCanvas(w: number, h: number) {
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingEnabled = false
  return { canvas, ctx }
}

/** Cria (uma vez) a textura e as animações do herói. */
export function createHeroTexture(scene: Phaser.Scene): void {
  if (scene.textures.exists('hero')) return

  const frames: Array<{ row: number; frame: HeroFrame }> = [
    // idle: 4 frames (respirar + piscar)
    { row: 0, frame: { bob: 0, swing: 0, legs: 'stand', arms: 'down', face: 'open' } },
    { row: 0, frame: { bob: 1, swing: 0, legs: 'stand', arms: 'down', face: 'open' } },
    { row: 0, frame: { bob: 1, swing: 0, legs: 'stand', arms: 'down', face: 'blink' } },
    { row: 0, frame: { bob: 0, swing: 0, legs: 'stand', arms: 'down', face: 'open' } },
    // run: 6 frames (12fps)
    { row: 1, frame: { bob: 0, swing: 1, legs: 'stand', arms: 'down', face: 'open' } },
    { row: 1, frame: { bob: 1, swing: 0, legs: 'stand', arms: 'down', face: 'open' } },
    { row: 1, frame: { bob: 0, swing: -1, legs: 'stand', arms: 'down', face: 'open' } },
    { row: 1, frame: { bob: 0, swing: -1, legs: 'stand', arms: 'down', face: 'open' } },
    { row: 1, frame: { bob: 1, swing: 0, legs: 'stand', arms: 'down', face: 'open' } },
    { row: 1, frame: { bob: 0, swing: 1, legs: 'stand', arms: 'down', face: 'open' } },
    // jump / fall / hit
    { row: 2, frame: { bob: 0, swing: 0, legs: 'tuck', arms: 'up', face: 'open' } },
    { row: 3, frame: { bob: 0, swing: 0, legs: 'split', arms: 'split', face: 'open' } },
    { row: 4, frame: { bob: 0, swing: 0, legs: 'split', arms: 'up', face: 'x' } },
    { row: 4, frame: { bob: 1, swing: 0, legs: 'split', arms: 'up', face: 'x' } },
  ]

  const { canvas, ctx } = newCanvas(HERO_COLS * CELL, 5 * CELL)
  const rowCol: Record<number, number> = {}
  for (const { row, frame } of frames) {
    const col = rowCol[row] ?? 0
    rowCol[row] = col + 1
    const px = makePainter(ctx, col * CELL, row * CELL)
    drawHero(px, frame)
  }

  const tex = scene.textures.addCanvas('hero', canvas)!
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < HERO_COLS; c++) {
      tex.add(`${r * HERO_COLS + c}`, 0, c * CELL, r * CELL, CELL, CELL)
    }
  }

  const mk = (key: string, row: number, count: number, rate: number, repeat: number) => {
    if (scene.anims.exists(key)) return
    scene.anims.create({
      key,
      frames: Array.from({ length: count }, (_, i) => ({
        key: 'hero',
        frame: row * HERO_COLS + i,
      })),
      frameRate: rate,
      repeat,
    })
  }
  mk('hero-idle', 0, 4, 4, -1)
  mk('hero-run', 1, 6, 12, -1)
  mk('hero-jump', 2, 1, 1, 0)
  mk('hero-fall', 3, 1, 1, 0)
  mk('hero-hit', 4, 2, 6, 0)
}

/** Cria textura + anim de idle do NPC (guard ou engineer). */
export function createNpcTexture(scene: Phaser.Scene, kind: NpcKind): void {
  if (scene.textures.exists(kind)) return

  const { canvas, ctx } = newCanvas(2 * CELL, CELL)
  for (let f = 0; f < 2; f++) {
    const px = makePainter(ctx, f * CELL, 0)
    if (kind === 'guard') drawGuard(px, f === 0)
    else drawEngineer(px, f === 1)
  }

  const tex = scene.textures.addCanvas(kind, canvas)!
  tex.add('0', 0, 0, 0, CELL, CELL)
  tex.add('1', 0, CELL, 0, CELL, CELL)

  const key = `${kind}-idle`
  if (!scene.anims.exists(key)) {
    scene.anims.create({
      key,
      frames: [{ key: kind, frame: '0' }, { key: kind, frame: '1' }],
      frameRate: 2,
      repeat: -1,
    })
  }
}
