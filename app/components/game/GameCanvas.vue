<template>
  <div
    ref="host"
    class="game-canvas"
    role="img"
    aria-label="Cena do jogo com personagem, plataformas e objetivo. A execução do código controla o personagem."
  />
</template>

<script setup lang="ts">
import type { HeroState } from './textures'
import { createHeroTexture, createNpcTexture } from './textures'

const props = defineProps<{ map: string[] }>()

interface GameLike {
  destroy: (removeCanvas: boolean) => void
}

const VIEW_W = 900
const VIEW_H = 600
const TILE = 48

const host = ref<HTMLDivElement | null>(null)
let game: GameLike | null = null

onMounted(async () => {
  // Phaser toca `window` no import — dinâmico aqui dentro + uso client-only.
  const Phaser = (await import('phaser')).default
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const map = props.map
  const cols = Math.max(...map.map(r => r.length))
  const rows = map.length
  const mapW = cols * TILE
  const mapH = rows * TILE
  // Centraliza o mapa na viewport (horizontal sempre; vertical só se couber)
  const OX = Math.max(0, Math.round((VIEW_W - mapW) / 2))
  const OY = mapH <= VIEW_H ? Math.round((VIEW_H - mapH) / 2) : 0

  const cellAt = (x: number, y: number): string => map[y]?.[x] ?? ' '
  const cellCX = (x: number) => x * TILE + TILE / 2 + OX
  const cellBottom = (y: number) => (y + 1) * TILE + OY

  class LevelScene extends Phaser.Scene {
    private player!: Phaser.GameObjects.Sprite
    private startX = 0
    private startY = 0

    constructor() {
      super('level')
    }

    create() {
      createHeroTexture(this)
      createNpcTexture(this, 'guard')
      createNpcTexture(this, 'engineer')

      this.drawBackground()
      this.drawTiles()
      this.drawActors()

      // Jogador
      let px = 0
      let py = 0
      for (let y = 0; y < rows; y++) {
        const x = map[y]!.indexOf('P')
        if (x >= 0) {
          px = x
          py = y
          break
        }
      }
      this.startX = px
      this.startY = py
      this.player = this.add.sprite(cellCX(px), cellBottom(py), 'hero', 0)
      this.player.setOrigin(0.5, 1)
      this.player.setDepth(10)
      if (reducedMotion) this.player.setFrame(0)
      else this.player.play('hero-idle')

      // Câmera segue o jogador; mapa pequeno fica centralizado (scroll travado)
      const cam = this.cameras.main
      cam.setBounds(0, 0, Math.max(VIEW_W, mapW + OX), Math.max(VIEW_H, mapH + OY))
      cam.setOrigin(0.5, 0.5)
      cam.startFollow(this.player, true, 0.1, 0.1)

      registerGameScene({
        resetPlayer: async () => {
          this.tweens.killTweensOf(this.player)
          this.player.setPosition(cellCX(this.startX), cellBottom(this.startY))
          this.player.setAlpha(1)
          this.player.setVisible(true)
          this.setState('idle')
        },
        setState: s => this.setState(s),
        moveTo: async (cx, cy, kind, durationMs) => {
          this.tweens.killTweensOf(this.player)
          const prevY = this.player.y
          const targetY = cellBottom(cy)
          if (kind === 'walk') this.setState('run')
          else if (kind === 'fall') this.setState('fall')
          else this.setState(targetY < prevY ? 'jump' : 'fall')
          await this.tween({
            targets: this.player,
            x: cellCX(cx),
            y: targetY,
            duration: reducedMotion ? 0 : durationMs,
            ease: 'Linear',
          })
        },
        deathFlash: async () => {
          this.setState('hit')
          if (reducedMotion) {
            this.player.setAlpha(0.45)
            return
          }
          this.cameras.main.shake(280, 0.014)
          await new Promise<void>(res => setTimeout(res, 420))
          await this.tween({
            targets: this.player,
            alpha: 0.35,
            y: this.player.y + 24,
            duration: 320,
            ease: 'Quad.easeIn',
          })
        },
      })

      this.events.once('shutdown', () => registerGameScene(null))
    }

    private setState(state: HeroState) {
      this.player.play(`hero-${state}`, true)
    }

    private tween(config: Phaser.Types.Tweens.TweenBuilderConfig): Promise<void> {
      return new Promise((resolve) => {
        this.tweens.add({ ...config, onComplete: () => resolve() })
      })
    }

    private drawBackground() {
      // Céu em gradiente (fica na frente do scroll: scrollFactor 0)
      const sky = this.add.graphics()
      sky.setScrollFactor(0)
      sky.setDepth(-10)
      sky.fillGradientStyle(0x0b1026, 0x0b1026, 0x2a2f5e, 0x2a2f5e, 1)
      sky.fillRect(0, 0, VIEW_W, VIEW_H)

      // Estrelas cintilando
      const stars = this.add.container(0, 0).setScrollFactor(0).setDepth(-9)
      for (let i = 0; i < (reducedMotion ? 0 : 48); i++) {
        const s = this.add.rectangle(
          Phaser.Math.Between(4, VIEW_W - 4),
          Phaser.Math.Between(4, VIEW_H * 0.7),
          2,
          2,
          0xddeeff,
        )
        s.setAlpha(Phaser.Math.FloatBetween(0.25, 1))
        stars.add(s)
        this.tweens.add({
          targets: s,
          alpha: { from: s.alpha, to: Math.max(0.15, 1 - s.alpha) },
          duration: Phaser.Math.Between(1200, 3200),
          yoyo: true,
          repeat: -1,
        })
      }

      // Silhueta de montanhas (parallax) — linha de base no chão do mapa
      const hills = this.add.graphics().setScrollFactor(0.4).setDepth(-8)
      const baseline = mapH + OY
      hills.fillStyle(0x151a33, 1)
      let hx = -120
      while (hx < mapW + VIEW_W) {
        const w = Phaser.Math.Between(220, 420)
        const h = Phaser.Math.Between(90, 200)
        hills.fillTriangle(
          hx, baseline,
          hx + w / 2, baseline - h,
          hx + w, baseline,
        )
        hx += w * 0.7
      }
    }

    private drawTiles() {
      const gfx = this.add.graphics().setDepth(0).setPosition(OX, OY)

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const ch = cellAt(x, y)
          const px = x * TILE
          const py = y * TILE

          if (ch === '#') {
            const isBedrock = y === rows - 1
            gfx.fillStyle(isBedrock ? 0x4a2f1a : 0x6b4423, 1)
            gfx.fillRect(px, py, TILE, TILE)
            // Grama no topo exposto
            if (cellAt(x, y - 1) !== '#') {
              gfx.fillStyle(0x3fa34d, 1)
              gfx.fillRect(px, py, TILE, 9)
              gfx.fillStyle(0x2e7d3a, 1)
              gfx.fillRect(px, py + 9, TILE, 3)
            }
            gfx.lineStyle(2, 0x3f2a18, 0.6)
            gfx.strokeRect(px, py, TILE, TILE)
          }
          else if (ch === '^') {
            gfx.fillStyle(0xef476f, 1)
            gfx.fillTriangle(
              px + TILE / 2, py + 6,
              px + 10, py + TILE - 4,
              px + TILE - 10, py + TILE - 4,
            )
            gfx.fillStyle(0xb83254, 1)
            gfx.fillRect(px + 10, py + TILE - 6, TILE - 20, 4)
          }
          else if (ch === 'G') {
            gfx.fillStyle(0x0b3d33, 1)
            gfx.fillRect(px + 8, py + 4, TILE - 16, TILE - 4)
            gfx.fillStyle(0x06d6a0, 1)
            gfx.fillRoundedRect(px + 11, py + 7, TILE - 22, TILE - 7, { tl: 12, tr: 12, bl: 0, br: 0 })
            gfx.fillStyle(0xffd166, 1)
            gfx.fillCircle(px + TILE - 20, py + TILE / 2 + 6, 4)
          }
        }
      }

      // Moedas: leve flutuação animada
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          if (cellAt(x, y) === 'o') {
            const coin = this.add.circle(cellCX(x), cellBottom(y) - TILE / 2, TILE * 0.26, 0xffd166)
            coin.setDepth(4)
            if (!reducedMotion) {
              this.tweens.add({
                targets: coin,
                y: coin.y - 7,
                duration: 900,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
              })
            }
          }
        }
      }
    }

    private drawActors() {
      // NPCs decorativos (V = vigia, E = engenheiro) — sem colisão
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const ch = cellAt(x, y)
          if (ch === 'V' || ch === 'E') {
            const kind = ch === 'V' ? 'guard' : 'engineer'
            const npc = this.add.sprite(cellCX(x), cellBottom(y), kind, 0)
            npc.setOrigin(0.5, 1)
            npc.setDepth(5)
            if (reducedMotion) npc.setFrame(0)
            else npc.play(`${kind}-idle`)
          }
        }
      }
    }
  }

  game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: host.value!,
    width: VIEW_W,
    height: VIEW_H,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    pixelArt: true,
    backgroundColor: '#0b1026',
    scene: LevelScene,
    banner: false,
  })
})

onBeforeUnmount(() => {
  registerGameScene(null)
  game?.destroy(true)
  game = null
})
</script>

<style scoped>
.game-canvas {
  width: 100%;
  aspect-ratio: 3 / 2;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #101a27;
  overflow: hidden;
}

.game-canvas :deep(canvas) {
  display: block;
  width: 100% !important;
  max-width: 100%;
  height: auto !important;
}
</style>
