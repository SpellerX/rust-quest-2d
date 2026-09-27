/**
 * Assets pixel-art de `app/assets/game/`, importados pelo Vite (a URL final
 * é resolvida pelo bundler, com hash, e funciona igual em dev e build).
 *
 * Carregar no `preload()` da cena Phaser (`loadGameAssets`) e registrar as
 * animações no `create()` (`createGameAnims`). Os tamanhos de frame vêm do
 * pacote: herói 32×32, NPCs e espinhos 48×48, gemas 16×16, troféu 64×64 e
 * tileset 16×16 — todos com escala inteira na malha do mundo (TILE = 64).
 */

/** Fatores de escala por família de asset (pixel-art só aceita escala inteira). */
export const S = {
  hero: 2,
  npc: 2,
  tile: 4,
  spike: 4,
  gem: 2,
  goal: 1,
} as const

/** Índices do tileset 16×16 (16 colunas × 11 linhas). */
export const TILE_FRAME = {
  top: '1',
  fill: '3',
  bedrock: '81',
} as const

/** Frame de repouso do espinho: a animação cresce e regride, aqui fica estendido. */
export const SPIKE_FRAME = 2

import heroIdleUrl from '~/assets/game/hero/idle.png'
import heroRunUrl from '~/assets/game/hero/run.png'
import heroJumpUrl from '~/assets/game/hero/jump.png'
import heroFallUrl from '~/assets/game/hero/fall.png'
import heroHitUrl from '~/assets/game/hero/hit.png'
import guardUrl from '~/assets/game/npc/guard.png'
import engineerUrl from '~/assets/game/npc/engineer.png'
import gemUrl from '~/assets/game/objects/gem.png'
import spikeUrl from '~/assets/game/objects/spike.png'
import goalUrl from '~/assets/game/objects/goal.png'
import tilesetUrl from '~/assets/game/tiles/tileset.png'

interface Sheet {
  key: string
  url: string
  frameWidth: number
  frameHeight: number
}

const SHEETS: Sheet[] = [
  { key: 'hero-idle', url: heroIdleUrl, frameWidth: 32, frameHeight: 32 },
  { key: 'hero-run', url: heroRunUrl, frameWidth: 32, frameHeight: 32 },
  { key: 'hero-jump', url: heroJumpUrl, frameWidth: 32, frameHeight: 32 },
  { key: 'hero-fall', url: heroFallUrl, frameWidth: 32, frameHeight: 32 },
  { key: 'hero-hit', url: heroHitUrl, frameWidth: 32, frameHeight: 32 },
  { key: 'guard', url: guardUrl, frameWidth: 48, frameHeight: 48 },
  { key: 'engineer', url: engineerUrl, frameWidth: 48, frameHeight: 48 },
  { key: 'gem', url: gemUrl, frameWidth: 16, frameHeight: 16 },
  { key: 'spike', url: spikeUrl, frameWidth: 48, frameHeight: 48 },
  { key: 'goal', url: goalUrl, frameWidth: 64, frameHeight: 64 },
]

export function loadGameAssets(scene: Phaser.Scene): void {
  for (const sheet of SHEETS) {
    scene.load.spritesheet(sheet.key, sheet.url, {
      frameWidth: sheet.frameWidth,
      frameHeight: sheet.frameHeight,
    })
  }
  scene.load.image('tileset', tilesetUrl)
}

/** Corta o tileset em frames numerados ("0"…"175") para usar `add.image(_, 'tileset', i)`. */
function sliceTileset(scene: Phaser.Scene): void {
  const tex = scene.textures.get('tileset')
  const COLS = 16
  const ROWS = 11
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const name = String(r * COLS + c)
      if (!tex.has(name)) tex.add(name, 0, c * 16, r * 16, 16, 16)
    }
  }
}

export function createGameAnims(scene: Phaser.Scene): void {
  sliceTileset(scene)

  // A chave da animação pode diferir da textura (hero-* é 1 arquivo por estado).
  const anim = (animKey: string, texKey: string, count: number, rate: number, repeat = -1) => {
    if (scene.anims.exists(animKey)) return
    scene.anims.create({
      key: animKey,
      frames: Array.from({ length: count }, (_, i) => ({ key: texKey, frame: i })),
      frameRate: rate,
      repeat,
    })
  }

  anim('hero-idle', 'hero-idle', 11, 8)
  anim('hero-run', 'hero-run', 12, 14)
  anim('hero-jump', 'hero-jump', 1, 1, 0)
  anim('hero-fall', 'hero-fall', 1, 1, 0)
  anim('hero-hit', 'hero-hit', 7, 14, 0)

  anim('guard-idle', 'guard', 11, 5)
  anim('engineer-idle', 'engineer', 11, 5)

  anim('gem-spin', 'gem', 7, 10)
  anim('goal-glow', 'goal', 7, 6)
}
