<template>
  <div class="sidebar">
    <div class="sidebar-header">
      <h2>图片列表</h2>
      <div class="sidebar-actions">
        <button @click="toggleSelectMode" class="action-button">
          {{ selectMode ? '取消选择' : '批量选择' }}
        </button>
        <button @click="clearAll" :disabled="!hasImages" class="action-button danger">
          清空
        </button>
      </div>
    </div>
    <div class="image-list" ref="imageListRef">
      <div
        v-for="(image, index) in images"
        :key="image.id"
        class="image-item"
        :class="{ selected: selectedImages.includes(image.id) }"
        @click="selectImage(image.id)"
        draggable
        @dragstart="handleDragStart(index)"
        @dragover.prevent
        @drop="handleDrop(index)"
      >
        <input
          v-if="selectMode"
          type="checkbox"
          :checked="selectedImages.includes(image.id)"
          @change="toggleSelect(image.id)"
        />
        <img
          :src="image.thumbnail"
          :alt="image.name"
          class="image-item-preview"
        />
        <span class="image-item-name">{{ image.name }}</span>
        <button
          class="image-item-delete"
          @click.stop="deleteImage(image.id)"
        >
          ×
        </button>
      </div>
    </div>
    <div v-if="images.length === 0" class="empty-state">
      <p>请上传图片</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useImageStore } from '../../store/imageStore'
import { useEditorStore } from '../../store/editorStore'

const imageListRef = ref<HTMLElement>()
const imageStore = useImageStore()
const editorStore = useEditorStore()

const images = computed(() => imageStore.images)
const selectMode = computed(() => editorStore.selectMode)
const selectedImages = computed(() => editorStore.selectedImages)
const hasImages = computed(() => imageStore.images.length > 0)

const dragIndex = ref<number | null>(null)

const selectImage = (id: string) => {
  if (selectMode.value) {
    toggleSelect(id)
  } else {
    editorStore.selectImage(id)
  }
}

const toggleSelect = (id: string) => {
  editorStore.toggleSelect(id)
}

const deleteImage = (id: string) => {
  imageStore.deleteImage(id)
}

const clearAll = () => {
  imageStore.clearImages()
}

const toggleSelectMode = () => {
  editorStore.toggleSelectMode()
}

const handleDragStart = (index: number) => {
  dragIndex.value = index
}

const handleDrop = (targetIndex: number) => {
  if (dragIndex.value !== null && dragIndex.value !== targetIndex) {
    imageStore.reorderImages(dragIndex.value, targetIndex)
  }
  dragIndex.value = null
}
</script>

<style scoped>
.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.sidebar h2 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.sidebar-actions {
  display: flex;
  gap: var(--spacing-xs);
}

.action-button {
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  background-color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-button:hover {
  background-color: var(--hover-color);
}

.action-button.danger {
  color: var(--danger-color);
  border-color: var(--danger-color);
}

.action-button.danger:hover {
  background-color: rgba(231, 76, 60, 0.1);
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.image-item {
  position: relative;
}

.image-item input[type="checkbox"] {
  margin-right: var(--spacing-sm);
  width: auto;
}

.image-item-name {
  flex: 1;
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.image-item-delete {
  background: none;
  border: none;
  font-size: 16px;
  color: var(--danger-color);
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.image-item-delete:hover {
  background-color: rgba(231, 76, 60, 0.1);
}

.empty-state {
  text-align: center;
  padding: var(--spacing-lg);
  color: #999;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-xs);
  }
  
  .sidebar-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .action-button {
    flex: 1;
    text-align: center;
  }
}
</style>