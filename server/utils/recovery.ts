import { randomInt } from 'node:crypto'

/** Alfabeto sem caracteres ambíguos (sem I, L, O, U, 0, 1). */
const ALPHABET = '23456789ABCDEFGHJKMNPQRSTVWXYZ'

/**
 * Código de recuperação de senha: 15 caracteres em 3 grupos (XXXXX-XXXXX-XXXXX).
 * ~75 bits de entropia; guardado com bcrypt, nunca em texto puro.
 */
export function generateRecoveryCode(): string {
  let out = ''
  for (let i = 0; i < 15; i++) {
    out += ALPHABET[randomInt(ALPHABET.length)]
    if (i % 5 === 4 && i !== 14) out += '-'
  }
  return out
}
