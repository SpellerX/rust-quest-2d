export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null)
  const user = ref<{
    id: string
    email: string
    username: string
    xp: number
    totalStars: number
  } | null>(null)

  const isAuthenticated = computed(() => !!token.value)

  function hydrate() {
    if (!import.meta.client) return
    token.value = localStorage.getItem('rq_token')
    const raw = localStorage.getItem('rq_user')
    if (raw) {
      try {
        user.value = JSON.parse(raw)
      }
      catch {
        user.value = null
      }
    }
  }

  function setSession(newToken: string, newUser: NonNullable<typeof user.value>) {
    token.value = newToken
    user.value = newUser
    if (import.meta.client) {
      localStorage.setItem('rq_token', newToken)
      localStorage.setItem('rq_user', JSON.stringify(newUser))
    }
  }

  async function login(email: string, password: string) {
    const res = await $fetch<{ token: string; user: NonNullable<typeof user.value> }>('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    })
    setSession(res.token, res.user)
  }

  async function register(email: string, username: string, password: string) {
    const res = await $fetch<{ token: string; user: NonNullable<typeof user.value> }>('/api/auth/register', {
      method: 'POST',
      body: { email, username, password },
    })
    setSession(res.token, res.user)
  }

  function updateUser(patch: Partial<NonNullable<typeof user.value>>) {
    if (!user.value) return
    user.value = { ...user.value, ...patch }
    if (import.meta.client) localStorage.setItem('rq_user', JSON.stringify(user.value))
  }

  function logout() {
    token.value = null
    user.value = null
    if (import.meta.client) {
      localStorage.removeItem('rq_token')
      localStorage.removeItem('rq_user')
    }
    navigateTo('/login')
  }

  return {
    token,
    user,
    isAuthenticated,
    hydrate,
    login,
    register,
    updateUser,
    logout,
  }
})
