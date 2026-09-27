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
import { S, SPIKE_FRAME, TILE_FRAME, createGameAnims, loadGameAssets } from './assets'

const props = defineProps<{ map: string[] }>()

interface GameLike {
  destroy: (removeCanvas: boolean) => void
}

const VIEW_W = 900
const VIEW_H = 600
// 64 = 4 × o tile de 16px do pacote; mantém toda a escala inteira.
const TILE = 64

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

    preload() {
      loadGameAssets(this)
    }

    create() {
      createGameAnims(this)

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
      this.player = this.add.sprite(cellCX(px), cellBottom(py), 'hero-idle', 0)
      this.player.setOrigin(0.5, 1)
      this.player.setScale(S.hero)
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
            y: this.player.y + TILE / 2,
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
      const ground = (x: number, y: number, frame: string) =>
        this.add
          .image(OX + x * TILE, OY + y * TILE, 'tileset', frame)
          .setOrigin(0, 0)
          .setScale(S.tile)
          .setDepth(0)

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const ch = cellAt(x, y)

          if (ch === '#') {
            const frame =
              cellAt(x, y - 1) !== '#' ? TILE_FRAME.top
                : y === rows - 1 ? TILE_FRAME.bedrock
                : TILE_FRAME.fill
            ground(x, y, frame)
          }
          else if (ch === '^') {
            // Estático de propósito: a animação do pacote faz os espinhos
            // regridem, e sugeriria "área segura" num perigo sempre fatal.
            this.add
              .sprite(cellCX(x), cellBottom(y), 'spike', SPIKE_FRAME)
              .setOrigin(0.5, 1)
              .setScale(S.spike)
              .setDepth(6)
          }
          else if (ch === 'G') {
            const goal = this.add
              .sprite(cellCX(x), cellBottom(y), 'goal', 0)
              .setOrigin(0.5, 1)
              .setScale(S.goal)
              .setDepth(3)
            if (!reducedMotion) goal.play('goal-glow')
          }
        }
      }

      // Gemas: rotação contínua + leve flutuação
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          if (cellAt(x, y) !== 'o') continue

          const gem = this.add.sprite(cellCX(x), cellBottom(y) - TILE / 2, 'gem', 0)
          gem.setScale(S.gem)
          gem.setDepth(4)
          if (reducedMotion) {
            gem.setFrame(0)
            continue
          }
          gem.play('gem-spin')
          this.tweens.add({
            targets: gem,
            y: gem.y - TILE / 8,
            duration: 900,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
          })
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
            npc.setScale(S.npc)
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
