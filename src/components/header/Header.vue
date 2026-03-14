<template>
  <div class="header">
    <div class="logo">
      <h1>Merge Image Pro</h1>
    </div>
    <div class="header-buttons">
      <button @click="undo" :disabled="!canUndo">撤销</button>
      <button @click="redo" :disabled="!canRedo">重做</button>
      <input
        ref="fileInput"
        type="file"
        multiple
        accept="image/jpeg, image/png, image/webp"
        @change="handleFileUpload"
        style="display: none"
      />
    </div>
    <button @click="toggleSettings" class="settings-button mobile-only">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useImageStore } from '../../store/imageStore'
import { useEditorStore } from '../../store/editorStore'

const fileInput = ref<HTMLInputElement>()
const imageStore = useImageStore()
const editorStore = useEditorStore()

const canUndo = computed(() => editorStore.history.length > 0)
const canRedo = computed(() => editorStore.redoHistory.length > 0)

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (files) {
    imageStore.uploadImages(Array.from(files))
    target.value = '' // 重置输入，允许重复上传同一文件
  }
}

const undo = () => {
  editorStore.undo()
}

const redo = () => {
  editorStore.redo()
}

const toggleSettings = () => {
  // 触发设置面板显示/隐藏事件
  window.dispatchEvent(new CustomEvent('toggleSettings'))
}
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  margin-right: var(--spacing-xl);
}

.logo h1 {
  font-size: 18px;
  font-weight: 600;
  color: var(--primary-color);
}

.header-buttons {
  display: flex;
  gap: var(--spacing-sm);
  flex: 1;
  justify-content: flex-end;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.settings-button {
  background: none;
  border: none;
  padding: var(--spacing-sm);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--border-radius-sm);
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.settings-button:hover {
  background-color: var(--hover-color);
}

.settings-button svg {
  color: var(--text-color);
}

/* 只在手机上显示 */
.mobile-only {
  display: none;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .mobile-only {
    display: flex;
  }
  
  .header-buttons {
    flex: 0 0 auto;
    margin-right: var(--spacing-sm);
  }
  
  .header-buttons button {
    font-size: 10px;
    padding: var(--spacing-xs) var(--spacing-sm);
  }
  
  .header {
    padding: 0 var(--spacing-md);
  }
}
</style>