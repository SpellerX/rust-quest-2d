<template>
  <div class="console">
    <div ref="editorHost" class="editor" />
    <div class="actions">
      <button
        class="btn btn-primary"
        :disabled="disabled"
        @click="$emit('run')"
      >
        ▶ Executar
      </button>
      <button class="btn" :disabled="disabled" @click="$emit('reset')">
        ↺ Recomeçar
      </button>
      <span class="hint-text">Ctrl+Enter executa</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { EditorState } from '@codemirror/state'
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

onMounted(() => {
  if (!editorHost.value) return

  view = new EditorView({
    state: EditorState.create({
      doc: props.modelValue,
      extensions: [
        basicSetup,
        rust(),
        oneDark,
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
  max-height: 320px;
}

.editor :deep(.cm-scroller) {
  overflow: auto;
}

.actions {
  display: flex;
  align-items: center;
  gap: 0.7rem;
}

.hint-text {
  color: var(--text-dim);
  font-size: 0.8rem;
}
</style>
