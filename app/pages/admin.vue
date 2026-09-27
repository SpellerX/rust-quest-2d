<template>
  <div class="admin-page">
    <header class="admin-header">
      <p class="eyebrow">Painel de administrador</p>
      <h1>Feedback dos desafios</h1>
      <p class="subtitle">Notas, aproveitamento e comentários deixados ao vencer cada nível.</p>
    </header>

    <InlineAlert v-if="errorMsg" tone="warning">{{ errorMsg }}</InlineAlert>

    <div v-else-if="loading" class="loading" role="status" aria-busy="true">
      Carregando avaliações…
    </div>

    <template v-else-if="data">
      <section class="panel block" aria-labelledby="summary-title">
        <h2 id="summary-title">Resumo</h2>
        <dl class="kpis">
          <div class="kpi">
            <dt>Usuários</dt>
            <dd>{{ data.totals.users }}</dd>
          </div>
          <div class="kpi">
            <dt>Avaliações</dt>
            <dd>{{ data.totals.feedbacks }}</dd>
          </div>
          <div class="kpi">
            <dt>Nota média</dt>
            <dd>{{ data.totals.avgRating || '—' }}<small> / 5</small></dd>
          </div>
          <div class="kpi">
            <dt>Gostaram</dt>
            <dd>{{ data.totals.likedPct === null ? '—' : `${data.totals.likedPct}%` }}</dd>
          </div>
          <div class="kpi">
            <dt>Níveis avaliados</dt>
            <dd>{{ data.totals.levels }}</dd>
          </div>
        </dl>
      </section>

      <section class="panel block" aria-labelledby="ratings-title">
        <h2 id="ratings-title">Distribuição das notas</h2>
        <ul v-if="data.totals.feedbacks > 0" class="dist">
          <li v-for="n in [5, 4, 3, 2, 1]" :key="n" class="dist-row">
            <span class="dist-star">{{ n }} ★</span>
            <span class="dist-track">
              <span class="dist-fill" :style="{ width: barWidth(n) }" />
            </span>
            <span class="dist-count">{{ countFor(n) }}</span>
          </li>
        </ul>
        <p v-else class="empty">Nenhuma avaliação registrada ainda.</p>
      </section>

      <section class="panel block" aria-labelledby="levels-title">
        <h2 id="levels-title">Por nível</h2>
        <ul v-if="data.byLevel.length" class="level-list">
          <li v-for="row in data.byLevel" :key="row.levelId" class="level-row">
            <span class="level-id">{{ row.levelId }}</span>
            <span class="level-meta">{{ row.count }} avaliação(ões) · média {{ row.avg }}</span>
          </li>
        </ul>
        <p v-else class="empty">Sem dados por nível ainda.</p>
      </section>

      <section class="panel block" aria-labelledby="comments-title">
        <h2 id="comments-title">Comentários recentes</h2>
        <ul v-if="data.recent.length" class="comment-list">
          <li v-for="(item, index) in data.recent" :key="index" class="comment-item">
            <p class="comment-meta">
              <strong>{{ item.rating }} ★</strong>
              <span class="comment-level">{{ item.levelId }}</span>
              <span>{{ item.liked === null ? 'sem resposta' : item.liked ? 'gostou' : 'não gostou' }}</span>
              <span class="comment-author">{{ item.username }}</span>
              <time :datetime="item.createdAt">{{ formatDate(item.createdAt) }}</time>
            </p>
            <p v-if="item.comment" class="comment-body">{{ item.comment }}</p>
            <p v-else class="comment-body comment-none">(sem comentário)</p>
          </li>
        </ul>
        <p v-else class="empty">Nenhum comentário ainda.</p>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'admin'] })

interface AdminFeedback {
  totals: {
    users: number
    feedbacks: number
    levels: number
    avgRating: number
    likedPct: number | null
  }
  distribution: Record<string, number>
  byLevel: { levelId: string; count: number; avg: number }[]
  recent: {
    levelId: string
    rating: number
    liked: boolean | null
    comment: string
    username: string
    createdAt: string
  }[]
}

const data = ref<AdminFeedback | null>(null)
const loading = ref(true)
const errorMsg = ref('')

const maxCount = computed(() => {
  const values = Object.values(data.value?.distribution ?? {})
  return Math.max(1, ...values)
})

function countFor(note: number): number {
  return data.value?.distribution[String(note)] ?? 0
}

function barWidth(note: number): string {
  return `${Math.round((countFor(note) / maxCount.value) * 100)}%`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

async function load() {
  loading.value = true
  errorMsg.value = ''
  try {
    data.value = await $fetch<AdminFeedback>('/api/admin/feedback', {
      headers: { Authorization: `Bearer ${localStorage.getItem('rq_token') ?? ''}` },
    })
  }
  catch (e) {
    errorMsg.value = (e as { status?: number }).status === 503
      ? 'Banco de dados indisponível: as avaliações não podem ser carregadas agora.'
      : extractApiError(e, 'Não foi possível carregar as avaliações.')
  }
  finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.eyebrow {
  margin: 0 0 var(--space-2);
  color: var(--accent);
  font-family: var(--font-pixel);
  font-size: 0.62rem;
  letter-spacing: 0.04em;
  line-height: 1.6;
  text-transform: uppercase;
}

.admin-header {
  margin-bottom: var(--space-6);
}

.admin-header h1 {
  margin: 0 0 var(--space-2);
}

.subtitle {
  margin: 0;
  color: var(--text-dim);
}

.block {
  padding: var(--space-4);
  margin-bottom: var(--space-4);
}

.block h2 {
  margin: 0 0 var(--space-4);
  font-size: 1.05rem;
}

.loading,
.empty {
  margin: 0;
  padding: var(--space-4);
  color: var(--text-dim);
}

.kpis {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: var(--space-4);
  margin: 0;
}

.kpi dt {
  margin-bottom: var(--space-1);
  color: var(--text-dim);
  font-size: 0.85rem;
  font-weight: 600;
}

.kpi dd {
  margin: 0;
  color: var(--text);
  font-size: 1.6rem;
  font-weight: 800;
}

.kpi small {
  color: var(--text-dim);
  font-size: 0.85rem;
  font-weight: 600;
}

.dist,
.level-list,
.comment-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.dist {
  display: grid;
  gap: var(--space-2);
}

.dist-row {
  display: grid;
  grid-template-columns: 3.5rem 1fr 2.5rem;
  align-items: center;
  gap: var(--space-3);
}

.dist-star {
  color: var(--gold);
  font-weight: 700;
}

.dist-track {
  height: 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg);
  overflow: hidden;
}

.dist-fill {
  display: block;
  height: 100%;
  background: var(--gold);
}

.dist-count {
  color: var(--text-dim);
  text-align: right;
}

.level-list {
  display: grid;
  gap: var(--space-2);
}

.level-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: var(--space-1) var(--space-3);
  padding: var(--space-2) 0;
  border-bottom: 1px solid var(--border);
}

.level-id {
  font-family: var(--font-mono);
  color: var(--accent-2);
}

.level-meta {
  color: var(--text-dim);
  font-size: 0.9rem;
}

.comment-list {
  display: grid;
  gap: var(--space-4);
}

.comment-item {
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--border);
}

.comment-item:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.comment-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1) var(--space-3);
  margin: 0 0 var(--space-2);
  color: var(--text-dim);
  font-size: 0.85rem;
}

.comment-meta strong {
  color: var(--gold);
}

.comment-level {
  font-family: var(--font-mono);
}

.comment-author {
  color: var(--accent-2);
}

.comment-body {
  margin: 0;
  line-height: 1.55;
  overflow-wrap: anywhere;
}

.comment-none {
  color: var(--text-dim);
  font-style: italic;
}
</style>
