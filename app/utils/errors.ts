/** Extrai mensagem amigável de um erro de $fetch, com fallback. */
export function extractApiError(e: unknown, fallback: string): string {
  if (e && typeof e === 'object') {
    const err = e as {
      data?: { error?: { message?: string } }
      status?: number
    }
    if (err.data?.error?.message) return err.data.error.message
    if (err.status === 404) {
      return 'Serviço indisponível: o backend ainda não está no ar (Fase 2).'
    }
    if (err.status === 401) return 'E-mail ou senha incorretos.'
    if (err.status === 409) return 'Este e-mail já tem conta.'
  }
  return fallback
}
