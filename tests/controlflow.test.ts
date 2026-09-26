import { describe, expect, it } from 'vitest'
import { execute } from '../shared/interpreter'
import type { GameCommand } from '../shared/types'

const ALLOWED = ['mover_direita', 'mover_esquerda', 'pular', 'esperar', 'falar']

function run(code: string) {
  return execute(code, { allowedFunctions: ALLOWED })
}

function moves(result: ReturnType<typeof run>): Array<{ direction?: string; steps?: number; force?: number; text?: string }> {
  return result.commands.map((c: GameCommand) => {
    if (c.type === 'move') return { direction: c.direction, steps: c.steps }
    if (c.type === 'jump') return { force: c.force }
    if (c.type === 'speak') return { text: c.text }
    return {}
  })
}

describe('if / else', () => {
  it('executa só o ramo verdadeiro', () => {
    const r = run(`
      let x = 2;
      if x == 2 { mover_direita(3); } else { mover_direita(9); }
    `)
    expect(r.ok, r.error?.friendly ?? '').toBe(true)
    expect(moves(r)).toEqual([{ direction: 'right', steps: 3 }])
  })

  it('suporta else-if encadeado', () => {
    const r = run(`
      let n = 5;
      if n < 3 { mover_direita(1); }
      else if n < 10 { mover_direita(2); }
      else { mover_direita(3); }
    `)
    expect(r.ok, r.error?.friendly ?? '').toBe(true)
    expect(moves(r)).toEqual([{ direction: 'right', steps: 2 }])
  })

  it('exige bool na condição (E0308)', () => {
    const r = run('if 5 { mover_direita(1); }')
    expect(r.ok).toBe(false)
    expect(r.error?.code).toBe('E0308')
  })

  it('bloco tem escopo próprio', () => {
    const r = run(`
      if true { let interno = 1; }
      mover_direita(interno);
    `)
    expect(r.ok).toBe(false)
    expect(r.error?.code).toBe('E0412')
  })
})

describe('operadores lógicos', () => {
  it('&& e || com precedência correta', () => {
    const r = run(`
      if 2 < 3 && 4 > 5 || 1 == 1 { mover_direita(4); }
    `)
    expect(r.ok).toBe(true)
    expect(moves(r)).toEqual([{ direction: 'right', steps: 4 }])
  })

  it('! nega bool', () => {
    const r = run('if !false { mover_direita(1); }')
    expect(r.ok).toBe(true)
    expect(r.commands).toHaveLength(1)
  })

  it('&& exige bool dos dois lados', () => {
    const r = run('if 1 && true { mover_direita(1); }')
    expect(r.ok).toBe(false)
    expect(r.error?.code).toBe('E0308')
  })
})

describe('laços', () => {
  it('while repete enquanto a condição for true', () => {
    const r = run(`
      let mut i = 0;
      while i < 3 { mover_direita(1); i = i + 1; }
    `)
    expect(r.ok, r.error?.friendly ?? '').toBe(true)
    expect(r.commands).toHaveLength(3)
  })

  it('loop infinito com break', () => {
    const r = run(`
      let mut n = 0;
      loop {
        mover_direita(1);
        n = n + 1;
        if n == 2 { break; }
      }
    `)
    expect(r.ok, r.error?.friendly ?? '').toBe(true)
    expect(r.commands).toHaveLength(2)
  })

  it('for percorre o intervalo semifechado', () => {
    const r = run('for i in 0..3 { mover_direita(i); }')
    expect(r.ok, r.error?.friendly ?? '').toBe(true)
    expect(moves(r)).toEqual([
      { direction: 'right', steps: 0 },
      { direction: 'right', steps: 1 },
      { direction: 'right', steps: 2 },
    ])
  })

  it('continue pula para a próxima iteração', () => {
    const r = run(`
      for i in 0..4 {
        if i == 1 { continue; }
        mover_direita(1);
      }
    `)
    expect(r.ok, r.error?.friendly ?? '').toBe(true)
    expect(r.commands).toHaveLength(3)
  })

  it('break fora de laço é E0004', () => {
    const r = run('break;')
    expect(r.ok).toBe(false)
    expect(r.error?.code).toBe('E0004')
  })

  it('variável do for é imutável (E0384)', () => {
    const r = run('for i in 0..2 { i = 5; }')
    expect(r.ok).toBe(false)
    expect(r.error?.code).toBe('E0384')
  })

  it('laço sem limite vira E0900 em vez de travar', () => {
    const r = run('loop { }')
    expect(r.ok).toBe(false)
    expect(r.error?.code).toBe('E0900')
  })
})

describe('funções do jogador', () => {
  it('fn void com parâmetro executa comandos', () => {
    const r = run(`
      fn caminhar(n: i32) { mover_direita(n); }
      caminhar(4);
    `)
    expect(r.ok, r.error?.friendly ?? '').toBe(true)
    expect(moves(r)).toEqual([{ direction: 'right', steps: 4 }])
  })

  it('retorno implícito pela última expressão sem ;', () => {
    const r = run(`
      fn dobro(x: i32) -> i32 { x * 2 }
      mover_direita(dobro(3));
    `)
    expect(r.ok, r.error?.friendly ?? '').toBe(true)
    expect(moves(r)).toEqual([{ direction: 'right', steps: 6 }])
  })

  it('return explícito funciona', () => {
    const r = run(`
      fn calc() -> i32 { return 2 + 3; }
      mover_direita(calc());
    `)
    expect(r.ok, r.error?.friendly ?? '').toBe(true)
    expect(moves(r)).toEqual([{ direction: 'right', steps: 5 }])
  })

  it('fn com -> mas corpo sem retorno é E0308', () => {
    const r = run('fn f() -> i32 { mover_direita(1); }')
    expect(r.ok).toBe(false)
    expect(r.error?.code).toBe('E0308')
  })

  it('número de argumentos errado é E0061', () => {
    const r = run(`
      fn f(a: i32) { mover_direita(a); }
      f(1, 2);
    `)
    expect(r.ok).toBe(false)
    expect(r.error?.code).toBe('E0061')
  })

  it('fn duplicada é E0428', () => {
    const r = run('fn f() {} fn f() {}')
    expect(r.ok).toBe(false)
    expect(r.error?.code).toBe('E0428')
  })

  it('usar fn void como valor é E0003', () => {
    const r = run(`
      fn nada() {}
      let x = nada();
    `)
    expect(r.ok).toBe(false)
    expect(r.error?.code).toBe('E0003')
  })

  it('recursão infinita vira E0900', () => {
    const r = run('fn fica(n: i32) { fica(n); } fica(1);')
    expect(r.ok).toBe(false)
    expect(r.error?.code).toBe('E0900')
  })
})

describe('ownership: String, move e empréstimo', () => {
  it('String literal com falar gera comando speak', () => {
    const r = run('let msg = "porta aberta"; falar(msg);')
    expect(r.ok, r.error?.friendly ?? '').toBe(true)
    expect(moves(r)).toEqual([{ text: 'porta aberta' }])
  })

  it('usar String depois de movida é E0382', () => {
    const r = run(`
      let senha = "abre";
      falar(senha);
      falar(senha);
    `)
    expect(r.ok).toBe(false)
    expect(r.error?.code).toBe('E0382')
  })

  it('passar &variavel empresta e pode usar de novo', () => {
    const r = run(`
      let senha = "abre";
      falar(&senha);
      falar(&senha);
    `)
    expect(r.ok, r.error?.friendly ?? '').toBe(true)
    expect(r.commands).toHaveLength(2)
  })

  it('let b = a move a String a', () => {
    const r = run(`
      let a = "x";
      let b = a;
      falar(a);
    `)
    expect(r.ok).toBe(false)
    expect(r.error?.code).toBe('E0382')
  })

  it('fn com parâmetro String move por valor; & evita', () => {
    const broken = run(`
      fn anunciar(t: String) { falar(t); }
      let msg = "oi";
      anunciar(msg);
      falar(msg);
    `)
    expect(broken.ok).toBe(false)
    expect(broken.error?.code).toBe('E0382')

    const ok = run(`
      fn anunciar(t: String) { falar(t); }
      let msg = "oi";
      anunciar(&msg);
      falar(&msg);
    `)
    expect(ok.ok, ok.error?.friendly ?? '').toBe(true)
    expect(ok.commands).toHaveLength(2)
  })

  it('i32 é Copy: passar por valor não move', () => {
    const r = run(`
      fn usa(n: i32) { mover_direita(n); }
      let passos = 3;
      usa(passos);
      mover_direita(passos);
    `)
    expect(r.ok, r.error?.friendly ?? '').toBe(true)
    expect(r.commands).toHaveLength(2)
  })
})
