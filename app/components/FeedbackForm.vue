<template>
  <section v-if="visible" class="feedback" aria-labelledby="feedback-title">
    <h3 id="feedback-title" class="feedback-title">★ Avalie este desafio</h3>

    <div v-if="done" class="feedback-done" role="status">
      <p class="feedback-thanks">Obrigado! Sua avaliação foi registrada.</p>
      <button class="btn" type="button" @click="done = false">Alterar avaliação</button>
    </div>

    <form v-else class="feedback-form" @submit.prevent="submit">
      <div class="feedback-row">
        <fieldset class="feedback-group">
          <legend>Nota do desafio</legend>
          <div class="stars">
            <template v-for="n in 5" :key="n">
              <input
                :id="`fb-star-${n}`"
                v-model="rating"
                class="sr-only star-input"
                type="radio"
                name="feedback-rating"
                :value="n"
              />
              <label
                :for="`fb-star-${n}`"
                class="star"
                :class="{ on: n <= (hover || rating) }"
                :aria-label="`${n} de 5`"
                @mouseenter="hover = n"
                @mouseleave="hover = 0"
              >★</label>
            </template>
          </div>
        </fieldset>

        <fieldset class="feedback-group">
          <legend>Você gostou do desafio?</legend>
          <div class="choices">
            <template v-for="option in likeOptions" :key="String(option.value)">
              <input
                :id="`fb-like-${option.value}`"
                v-model="liked"
                class="sr-only choice-input"
                type="radio"
                name="feedback-liked"
                :value="option.value"
              />
              <label :for="`fb-like-${option.value}`" class="btn choice">{{ option.label }}</label>
            </template>
          </div>
        </fieldset>
      </div>

      <div class="feedback-comment">
        <label for="feedback-comment" class="comment-label">
          O que podia melhorar? <span class="optional">(opcional)</span>
        </label>
        <textarea
          id="feedback-comment"
          v-model="comment"
          class="comment"
          maxlength="500"
          rows="3"
          placeholder="Ex.: a dica 2 entregava a resposta pronta…"
        />
        <p class="counter" aria-hidden="true">{{ comment.length }}/500</p>
      </div>

      <InlineAlert v-if="errorMsg" :tone="errorTone">{{ errorMsg }}</InlineAlert>

      <div class="feedback-actions">
        <button
          class="btn btn-primary"
          type="submit"
          :disabled="busy || !rating"
          :aria-busy="busy"
        >
          {{ busy ? 'Enviando…' : 'Enviar avaliação' }}
        </button>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import type { ProgressSyncState } from '../stores/game'

const props = defineProps<{
  levelId: string
  syncState: ProgressSyncState
}>()

const auth = useAuthStore()

const rating = ref(0)
const hover = ref(0)
const liked = ref<boolean | null>(null)
const comment = ref('')
const busy = ref(false)
const done = ref(false)
const errorMsg = ref('')
const errorTone = ref<'danger' | 'warning'>('danger')

const likeOptions = [
  { value: true, label: 'Sim' },
  { value: false, label: 'Não' },
]

// Só logados avaliam (evita spam nos níveis públicos) e só depois que o
// servidor gravou o progresso — assim o 409 "nível não concluído" não
// acontece pela interface.
const visible = computed(() => auth.isAuthenticated && props.syncState === 'saved')

const storageKey = computed(() => `rq_fb_${props.levelId}`)

function loadState() {
  rating.value = 0
  hover.value = 0
  liked.value = null
  comment.value = ''
  errorMsg.value = ''
  done.value = false
  if (import.meta.client) {
    done.value = localStorage.getItem(storageKey.value) === '1'
  }
}

onMounted(loadState)
watch(() => props.levelId, loadState)

async function submit() {
  if (!rating.value || busy.value) return

  busy.value = true
  errorMsg.value = ''
  try {
    await $fetch('/api/feedback', {
      method: 'POST',
      headers: { Authorization: `Bearer ${auth.token}` },
      body: {
        levelId: props.levelId,
        rating: rating.value,
        liked: liked.value,
        comment: comment.value.trim(),
      },
    })
    done.value = true
    if (import.meta.client) localStorage.setItem(storageKey.value, '1')
  }
  catch (e) {
    const status = (e as { status?: number }).status
    if (status === 503) {
      errorTone.value = 'warning'
      errorMsg.value = 'Avaliação indisponível agora: o banco de dados não está acessível.'
    }
    else {
      errorTone.value = 'danger'
      errorMsg.value = extractApiError(e, 'Não foi possível enviar sua avaliação. Tente novamente.')
    }
  }
  finally {
    busy.value = false
  }
}
</script>

<style scoped>
.feedback {
  margin-top: var(--space-6);
  padding-top: var(--space-4);
  border-top: 1px solid var(--border);
}

.feedback-title {
  margin: 0 0 var(--space-4);
  font-size: 1.02rem;
  color: var(--text);
}

.feedback-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4) var(--space-6);
}

.feedback-group {
  margin: 0;
  padding: 0;
  border: 0;
  min-width: 0;
}

.feedback-group legend {
  padding: 0;
  margin-bottom: var(--space-2);
  color: var(--text-dim);
  font-size: 0.9rem;
  font-weight: 600;
}

.stars {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
}

.star {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  min-height: 44px;
  font-size: 1.75rem;
  line-height: 1;
  color: var(--border-bright);
  cursor: pointer;
  transition: color 0.12s;
}

.star.on {
  color: var(--gold);
}

.star-input:focus-visible + .star {
  outline: 3px solid var(--gold);
  outline-offset: 3px;
}

.choices {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.choice {
  cursor: pointer;
}

.choice-input:checked + .choice {
  border-color: var(--gold);
  color: var(--gold);
}

.choice-input:focus-visible + .choice {
  outline: 3px solid var(--gold);
  outline-offset: 3px;
}

.feedback-comment {
  margin-top: var(--space-4);
}

.comment-label {
  display: block;
  margin-bottom: var(--space-2);
  color: var(--text-dim);
  font-size: 0.9rem;
  font-weight: 600;
}

.optional {
  font-weight: 400;
}

.comment {
  display: block;
  width: 100%;
  min-height: 96px;
  padding: 0.7rem 0.85rem;
  border: 1px solid var(--border-bright);
  border-radius: var(--radius);
  background: var(--bg);
  color: var(--text);
  font: inherit;
  resize: vertical;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.comment:focus-visible {
  outline: none;
  border-color: var(--gold);
  box-shadow: 0 0 0 3px rgb(240 201 109 / 22%);
}

.counter {
  margin: var(--space-1) 0 0;
  color: var(--text-dim);
  font-size: 0.8rem;
  text-align: right;
}

.feedback-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  margin-top: var(--space-4);
}

.feedback-done {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3);
}

.feedback-thanks {
  margin: 0;
  color: var(--green);
  font-weight: 600;
}
</style>
