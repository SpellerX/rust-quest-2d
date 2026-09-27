export default defineNuxtRouteMiddleware(async (to) => {
  if (!import.meta.client) return

  try {
    const res = await $fetch<{ admin: boolean }>('/api/admin/me', {
      headers: { Authorization: `Bearer ${localStorage.getItem('rq_token') ?? ''}` },
    })
    if (!res.admin) return navigateTo('/mapa')
  }
  catch (e) {
    // 401 = sessão inválida; 503 (sem banco) deixa a própria página avisar.
    if ((e as { status?: number }).status === 401) {
      return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
    }
  }
})
