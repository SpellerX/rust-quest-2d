import { describe, expect, it } from 'vitest'
import {
  CAPITULOS,
  CAPITULO_POR_NIVEL,
  capitulosDoMundo,
  getCapitulo,
  NOMES_PASSOS,
  prateleiras,
  slugDoNivel,
} from '../shared/biblioteca'
import { LEVELS } from '../shared/levels'

const PASSOS_VALIDOS = new Set([1, 2, 3, 4, 5, 6, 9, 10])
const TODOS_OS_PASSOS = Array.from({ length: 13 }, (_, i) => i + 1)

/** Todo texto pedagógico já existente — a base contra a qual o capítulo não pode repetir. */
function textoDosNiveis() {
  const pedacos: string[] = []
  for (const level of LEVELS) {
    pedacos.push(level.learnAfter.body, level.learnAfter.title)
    pedacos.push(...level.learnAfter.bullets)
    pedacos.push(...level.concept.body, ...level.concept.bullets)
    for (const secao of level.cheatSheet) {
      pedacos.push(secao.title, ...secao.lines)
    }
  }
  return pedacos
}

describe('biblioteca', () => {
  it('tem 20 capítulos com slugs únicos', () => {
    expect(CAPITULOS).toHaveLength(20)
    expect(new Set(CAPITULOS.map(c => c.slug)).size).toBe(20)
  })

  it('cobre os 30 níveis exatamente uma vez — sem órfão e sem duplicata', () => {
    const ids = CAPITULOS.flatMap(c => c.niveis)
    expect(ids).toHaveLength(30)
    expect(new Set(ids).size).toBe(30)

    const conhecidos = new Set(LEVELS.map(l => l.id))
    for (const id of ids) expect(conhecidos.has(id), `nível desconhecido: ${id}`).toBe(true)

    const cobertos = new Set(ids)
    for (const level of LEVELS) {
      expect(cobertos.has(level.id), `nível sem capítulo: ${level.id}`).toBe(true)
    }
  })

  it('resolve qualquer nível para um capítulo existente', () => {
    expect(Object.keys(CAPITULO_POR_NIVEL)).toHaveLength(30)
    for (const level of LEVELS) {
      const slug = slugDoNivel(level.id)
      expect(slug, `slug ausente para ${level.id}`).toBeTruthy()
      expect(getCapitulo(slug!)).toBeDefined()
    }
  })

  it('tem conteúdo completo em todo capítulo', () => {
    for (const capitulo of CAPITULOS) {
      expect(capitulo.titulo.length, capitulo.slug).toBeGreaterThan(3)
      expect(capitulo.resumo.length, capitulo.slug).toBeGreaterThan(15)
      expect(capitulo.oQueVoceFez.length, capitulo.slug).toBeGreaterThan(60)
      expect(capitulo.secoes.length, capitulo.slug).toBeGreaterThanOrEqual(2)

      for (const secao of capitulo.secoes) {
        expect(secao.titulo.length, capitulo.slug).toBeGreaterThan(3)
        expect(secao.paragrafos.length, `${capitulo.slug}/${secao.titulo}`).toBeGreaterThanOrEqual(1)
        for (const paragrafo of secao.paragrafos) {
          expect(paragrafo.length, `${capitulo.slug}/${secao.titulo}`).toBeGreaterThanOrEqual(40)
        }
      }

      expect(capitulo.livro.capitulo.length, capitulo.slug).toBeGreaterThan(5)
      // Prefixo oficial pedido: https://doc.rust-lang.org/book/… (sem /stable/).
      // Cada capítulo aponta para um ARQUIVO de seção — não existe mais
      // ch03-common-programming-concepts.html único (dava 404).
      expect(capitulo.livro.url, capitulo.slug)
        .toMatch(/^https:\/\/doc\.rust-lang\.org\/book\/[\w.-]+\.html(#[\w-]+)?$/)
      expect(capitulo.niveis.length, capitulo.slug).toBeGreaterThanOrEqual(1)
    }
  })

  it('usa apenas mundos e passos válidos', () => {
    for (const capitulo of CAPITULOS) {
      expect([1, 2, 3, 4, 5, 6], capitulo.slug).toContain(capitulo.mundo)
      expect(PASSOS_VALIDOS.has(capitulo.passo), `${capitulo.slug} → passo ${capitulo.passo}`).toBe(true)
      expect(NOMES_PASSOS[capitulo.passo], capitulo.slug).toBeTruthy()
    }
  })

  it('agrupa os 6 mundos na prateleira', () => {
    const estantes = prateleiras()
    expect(estantes).toHaveLength(6)
    expect(estantes.every(e => e.capitulos.length > 0)).toBe(true)
    expect(estantes.flatMap(e => e.capitulos)).toHaveLength(20)
    expect(capitulosDoMundo(6).map(c => c.slug)).toEqual(['string', 'move', 'emprestimo'])
  })

  it('cobre todos os passos da trilha de 13 — os vazios ficam marcados como futuros', () => {
    const ativos = TODOS_OS_PASSOS.filter(n => CAPITULOS.some(c => c.passo === n))
    expect(ativos).toEqual([1, 2, 3, 4, 5, 6, 10])
    // O passo 9 existe como nome mas sem conteúdo — é declarado "em breve" na UI.
    expect(NOMES_PASSOS[9]).toBeTruthy()
    expect(NOMES_PASSOS[7]).toBeUndefined()
  })

  it('não repete o conteúdo que o nível já mostra (anti-duplicação)', () => {
    const base = textoDosNiveis().filter(p => p.length >= 20)
    const violacoes: string[] = []

    for (const capitulo of CAPITULOS) {
      for (const secao of capitulo.secoes) {
        for (const paragrafo of secao.paragrafos) {
          for (const pedaco of base) {
            if (paragrafo === pedaco || paragrafo.includes(pedaco)) {
              violacoes.push(`${capitulo.slug}: "${pedaco.slice(0, 70)}"`)
            }
          }
        }
      }
    }

    expect(violacoes, `capítulos repetindo texto de nível:\n${violacoes.join('\n')}`).toEqual([])
  })
})
