<template>
  <div class="console">
    <div ref="editorHost" class="editor" />
    <div class="actions">
      <button
        class="btn btn-primary"
        type="button"
        :disabled="disabled"
        @click="$emit('run')"
      >
        <span aria-hidden="true">▶</span> Executar
      </button>
      <button class="btn" type="button" :disabled="disabled" @click="$emit('reset')">
        <span aria-hidden="true">↺</span> Recomeçar
      </button>
      <span id="editor-help" class="hint-text">Ctrl + Enter ou ⌘ + Enter executa</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Compartment, EditorState } from '@codemirror/state'
import { EditorView, keymap } from '@codemirror/view'
import { basicSetup } from 'codemirror'
import { rust } from '@codemirror/lang-rust'
import { oneDark } from '@codemirror/theme-one-dark'

const props = defineProps<{
  modelValue: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'run': []
  'reset': []
}>()

const editorHost = ref<HTMLDivElement | null>(null)
let view: EditorView | null = null
const editable = new Compartment()

onMounted(() => {
  if (!editorHost.value) return

  view = new EditorView({
    state: EditorState.create({
      doc: props.modelValue,
      extensions: [
        basicSetup,
        rust(),
        oneDark,
        editable.of(EditorView.editable.of(!props.disabled)),
        EditorView.contentAttributes.of({
          'aria-label': 'Editor de código Rust',
          'aria-describedby': 'editor-help',
          spellcheck: 'false',
        }),
        keymap.of([
          {
            key: 'Mod-Enter',
            run: () => {
              if (!props.disabled) emit('run')
              return true
            },
          },
        ]),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            emit('update:modelValue', update.state.doc.toString())
          }
        }),
        EditorView.theme({
          '&': { fontSize: '15px' },
          '.cm-content': { fontFamily: 'var(--font-mono)', minHeight: '180px' },
          '.cm-gutters': { fontFamily: 'var(--font-mono)' },
        }),
      ],
    }),
    parent: editorHost.value,
  })
})

// O store pode trocar o código externamente (Mostrar exemplo / Recomeçar).
watch(
  () => props.modelValue,
  (next) => {
    if (view && next !== view.state.doc.toString()) {
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: next },
      })
    }
  },
)

watch(
  () => props.disabled,
  (disabled) => {
    view?.dispatch({ effects: editable.reconfigure(EditorView.editable.of(!disabled)) })
  },
)

onBeforeUnmount(() => {
  view?.destroy()
  view = null
})
</script>

<style scoped>
.console {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.editor {
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
}

.editor :deep(.cm-editor) {
  min-height: 200px;
  max-height: min(360px, 44vh);
}

.editor :deep(.cm-scroller) {
  overflow: auto;
}

.actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.7rem;
}

.hint-text {
  color: var(--text-dim);
  font-size: 0.8rem;
}

@media (max-width: 520px) {
  .actions .btn { flex: 1; }
  .hint-text { width: 100%; text-align: center; }
}
</style>
