export default defineNuxtRouteMiddleware((to) => {
  if (!import.meta.client) return
  const token = localStorage.getItem('rq_token')
  if (!token) {
    return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
  }
})
