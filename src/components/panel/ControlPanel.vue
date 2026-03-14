<template>
  <div class="control-panel">

    <!-- 主标签 -->
    <div class="tabs main-tabs">
      <button
        :class="{ active: activeMainTab === 'images' }"
        @click="activeMainTab = 'images'"
      >
        图片
      </button>

      <button
        :class="{ active: activeMainTab === 'settings' }"
        @click="activeMainTab = 'settings'"
      >
        设置
      </button>
    </div>

    <!-- 图片面板 -->
    <div v-if="activeMainTab === 'images'" class="tab-content">

      <div class="image-panel">

        <button class="btn primary upload-button" @click="triggerUpload">
          添加图片
        </button>

        <div class="action-section" v-if="hasImages">
          <button class="btn" @click="toggleSelectMode">
            {{ selectMode ? '取消多选' : '进入多选' }}
          </button>

          <button class="btn" v-if="selectMode" @click="selectAll">
            全选
          </button>

          <button class="btn danger" v-if="selectMode" @click="clearSelected">
            移除选中
          </button>

          <button class="btn danger" @click="clearAll">
            清空所有
          </button>
        </div>

        <div class="image-list-container">

          <div v-if="hasImagesNotInCanvas" class="warning-message">
            有 {{ imagesNotInCanvas }} 张图片未纳入画布
          </div>

          <div class="image-list">

            <div
              v-for="(image,index) in images"
              :key="image.id"
              class="image-item"
              :class="{
                selected:selectedImages.includes(image.id),
                'not-in-canvas':index>=totalGridCells
              }"
              @click="handleItemClick(image.id)"
              draggable
              @dragstart="handleDragStart(index)"
              @dragover.prevent
              @drop="handleDrop(index)"
            >

              <input
                v-if="selectMode"
                type="checkbox"
                :checked="selectedImages.includes(image.id)"
                @click.stop
                @change="toggleSelect(image.id)"
              />

              <img
                :src="image.thumbnail"
                class="image-item-preview"
              />

              <span class="image-item-name">
                {{ image.name }}
              </span>

              <button
                class="image-item-delete"
                @click.stop="deleteImage(image.id)"
              >
                ×
              </button>

            </div>

          </div>

        </div>

      </div>

    </div>


    <!-- 设置面板 -->
    <div v-if="activeMainTab === 'settings'" class="tab-content">

      <div class="tabs small">

        <button
          :class="{ active: activeSubTab === 'layout' }"
          @click="activeSubTab = 'layout'"
        >
          布局
        </button>

        <button
          :class="{ active: activeSubTab === 'style' }"
          @click="activeSubTab = 'style'"
        >
          样式
        </button>

        <button
          :class="{ active: activeSubTab === 'export' }"
          @click="activeSubTab = 'export'"
        >
          导出
        </button>

      </div>


      <!-- 布局 -->
      <div v-if="activeSubTab === 'layout'" class="settings">

        <div class="control-item">
          <label class="control-label">画布比例</label>

          <div class="control-field">

            <select v-model="selectedAspectRatio" @change="handleAspectRatioChange">
              <option value="1:1">1:1</option>
              <option value="16:9">16:9</option>
              <option value="9:16">9:16</option>
              <option value="4:3">4:3</option>
              <option value="custom">自定义</option>
            </select>

          </div>
        </div>


        <div v-if="selectedAspectRatio==='custom'" class="control-item">

          <label class="control-label">自定义尺寸</label>

          <div class="control-field">

            <input type="number" v-model.number="customWidth">

            <span>:</span>

            <input type="number" v-model.number="customHeight">

            <button class="btn primary" @click="applyCustomRatio">
              应用
            </button>

          </div>

        </div>


        <div class="control-item">

          <label class="control-label">网格行数</label>

          <div class="control-field">

            <input type="number" v-model.number="rows">

          </div>

        </div>


        <div class="control-item">

          <label class="control-label">网格列数</label>

          <div class="control-field">

            <input type="number" v-model.number="cols">

          </div>

        </div>


      </div>


      <!-- 样式 -->
      <div v-if="activeSubTab==='style'" class="settings">

        <div class="control-item">

          <label class="control-label">画布边距</label>

          <div class="control-field">

            <input type="number" v-model.number="margin">

          </div>

        </div>


        <div class="control-item">

          <label class="control-label">图片间距</label>

          <div class="control-field">

            <input type="number" v-model.number="spacing">

          </div>

        </div>


        <div class="control-item">

          <label class="control-label">边框宽度</label>

          <div class="control-field">

            <input type="number" v-model.number="borderWidth">

          </div>

        </div>


        <div class="control-item">

          <label class="control-label">边框颜色</label>

          <div class="control-field">

            <input type="color" v-model="borderColor">

          </div>

        </div>


        <div class="control-item">

          <label class="control-label">背景颜色</label>

          <div class="control-field">

            <input type="color" v-model="backgroundColor">

          </div>

        </div>


      </div>


      <!-- 导出 -->
      <div v-if="activeSubTab==='export'" class="settings">

        <div class="control-item">

          <label class="control-label">导出格式</label>

          <div class="control-field">

            <select v-model="exportFormat">
              <option value="png">PNG</option>
              <option value="jpeg">JPG</option>
              <option value="webp">WebP</option>
            </select>

          </div>

        </div>


        <div class="control-item">

          <label class="control-label">分辨率</label>

          <div class="control-field">

            <select v-model="exportResolution">
              <option value="1080">1K</option>
              <option value="2160">2K</option>
              <option value="3840">4K</option>
              <option value="7680">8K</option>
            </select>

          </div>

        </div>


        <div class="control-item">

          <label class="control-label">图片质量</label>

          <div class="control-field">

            <input type="range" v-model.number="exportQuality">

            <span>{{ exportQuality }}%</span>

          </div>

        </div>


        <button
          class="btn primary export-button"
          @click="exportImage"
          :disabled="!hasImages"
        >
          导出图片
        </button>

      </div>

    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useLayoutStore } from '../../store/layoutStore'
import { useExportStore } from '../../store/exportStore'
import { useImageStore } from '../../store/imageStore'
import { useEditorStore } from '../../store/editorStore'

const layoutStore = useLayoutStore()
const exportStore = useExportStore()
const imageStore = useImageStore()
const editorStore = useEditorStore()

const dragIndex = ref<number | null>(null)
const activeMainTab = ref('images')
const activeSubTab = ref('layout')
const selectedAspectRatio = ref('1:1')
const customWidth = ref(1080)
const customHeight = ref(1080)

// 布局设置
const rows = computed({
  get: () => layoutStore.rows,
  set: (value) => layoutStore.setRows(value)
})

const cols = computed({
  get: () => layoutStore.cols,
  set: (value) => layoutStore.setCols(value)
})

const margin = computed({
  get: () => layoutStore.margin,
  set: (value) => layoutStore.setMargin(value)
})

const spacing = computed({
  get: () => layoutStore.spacing,
  set: (value) => layoutStore.setSpacing(value)
})

const borderWidth = computed({
  get: () => layoutStore.borderWidth,
  set: (value) => layoutStore.setBorderWidth(value)
})

const borderColor = computed({
  get: () => layoutStore.borderColor,
  set: (value) => layoutStore.setBorderColor(value)
})

const backgroundColor = computed({
  get: () => layoutStore.backgroundColor,
  set: (value) => layoutStore.setBackgroundColor(value)
})

// 导出设置
const exportFormat = computed({
  get: () => exportStore.format,
  set: (value) => exportStore.setFormat(value)
})

const exportResolution = computed({
  get: () => exportStore.resolution,
  set: (value) => exportStore.setResolution(value)
})

const exportQuality = computed({
  get: () => exportStore.quality,
  set: (value) => exportStore.setQuality(value)
})

// 图片列表相关
const images = computed(() => imageStore.images)
const selectMode = computed(() => editorStore.selectMode)
const selectedImages = computed(() => editorStore.selectedImages)
const hasImages = computed(() => imageStore.images.length > 0)

// 计算有多少图片未被纳入画布
const totalGridCells = computed(() => rows.value * cols.value)
const imagesNotInCanvas = computed(() => {
  return images.value.length - totalGridCells.value
})
const hasImagesNotInCanvas = computed(() => {
  return imagesNotInCanvas.value > 0
})

function handleItemClick(id: string) {
  if (!selectMode.value) {
    editorStore.selectImage(id)
    return
  }

  editorStore.toggleSelect(id)
}

function toggleSelect(id: string) {
  editorStore.toggleSelect(id)
}

function deleteImage(id: string) {
  imageStore.deleteImage(id)
}

function toggleSelectMode() {
  editorStore.toggleSelectMode()
}

function handleDragStart(index: number) {
  dragIndex.value = index
}

function handleDrop(targetIndex: number) {
  if (dragIndex.value !== null && dragIndex.value !== targetIndex) {
    imageStore.reorderImages(dragIndex.value, targetIndex)
  }
  dragIndex.value = null
}

function clearSelected() {
  if (!selectedImages.value.length) return

  const ok = window.confirm(`确定清空选中的 ${selectedImages.value.length} 张图片吗？`)
  if (ok) {
    imageStore.deleteSelected(selectedImages.value)
    editorStore.deselectAll()
  }
}

function clearAll() {
  if (!images.value.length) return

  const ok = window.confirm('确定清空所有图片吗？')
  if (ok) {
    imageStore.clearImages()
    if (selectMode.value) {
      editorStore.toggleSelectMode()
    }
  }
}

function selectAll() {
  editorStore.selectAll()
}

function triggerUpload() {
  // 创建一个隐藏的文件输入框
  const input = document.createElement('input')
  input.type = 'file'
  input.multiple = true
  input.accept = 'image/jpeg, image/png, image/webp'
  input.onchange = handleFileUpload
  input.click()
}

function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (files) {
    imageStore.uploadImages(Array.from(files))
  }
}

function setAspectRatio(width: number, height: number) {
  layoutStore.setCanvasWidth(width)
  layoutStore.setCanvasHeight(height)
}

function handleAspectRatioChange() {
  switch (selectedAspectRatio.value) {
    case '1:1':
      setAspectRatio(1080, 1080)
      break
    case '16:9':
      setAspectRatio(1920, 1080)
      break
    case '9:16':
      setAspectRatio(1080, 1920)
      break
    case '4:3':
      setAspectRatio(1440, 1080)
      break
    case 'custom':
      // 保持当前尺寸，等待用户输入
      break
  }
}

function applyCustomRatio() {
  if (customWidth.value && customHeight.value) {
    setAspectRatio(customWidth.value, customHeight.value)
  }
}

function exportImage() {
  // 触发CanvasArea组件的导出方法
  window.dispatchEvent(new CustomEvent('exportImage'))
}
</script>

<style scoped>
.control-panel{
display:flex;
flex-direction:column;
height:100%;
}

/* tabs */

.tabs{
display:flex;
border-bottom:1px solid var(--border-color);
}

.tabs button{
flex:1;
height:40px;
border:none;
background:transparent;
cursor:pointer;
font-size:13px;
font-weight:500;
color:#666;
transition:.15s;
}

.tabs button:hover{
background:var(--hover-color);
}

.tabs button.active{
color:var(--primary-color);
border-bottom:2px solid var(--primary-color);
}

.tabs.small button{
height:32px;
font-size:12px;
}

/* panel */

.tab-content{
flex:1;
padding:16px;
overflow:auto;
}

/* buttons */

.btn{
  height:34px;
  padding:0 12px;
  border-radius:6px;
  border:1px solid var(--border-color);
  background:white;
  cursor:pointer;
  font-size:13px;
  font-weight:500;
  transition:.15s;
  display:flex;
  align-items:center;
  justify-content:center;
  width:100%;
}

.upload-button{
  margin-bottom:var(--spacing-sm);
}

.btn:hover{
background:var(--hover-color);
}

.btn.primary{
background:var(--primary-color);
border-color:var(--primary-color);
color:white;
}

.btn.danger{
color:var(--danger-color);
border-color:var(--danger-color);
}

/* settings */

.settings{
display:flex;
flex-direction:column;
gap:14px;
}

.control-item{
display:flex;
flex-direction:column;
gap:6px;
}

.control-label{
font-size:12px;
color:#666;
font-weight:500;
}

.control-field{
display:flex;
align-items:center;
gap:8px;
}

.control-field input,
.control-field select{
width:100%;
height:36px;
padding:0 10px;
font-size:13px;
border:1px solid var(--border-color);
border-radius:6px;
background:white;
}

.control-field input:focus,
.control-field select:focus{
outline:none;
border-color:var(--primary-color);
}



/* image panel */

.action-section{
  display:grid;
  grid-template-columns:repeat(auto-fit, minmax(80px, 1fr));
  gap:8px;
}

.image-panel{
  display:flex;
  flex-direction:column;
  gap:12px;
  height:100%;
}

.image-list-container{
  flex:1;
  overflow:hidden;
  display:flex;
  flex-direction:column;
}

.image-list{
  flex:1;
  overflow:auto;
  display:flex;
  flex-direction:column;
  gap:8px;
}

.image-item{
display:flex;
align-items:center;
gap:10px;
padding:6px 10px;
border:1px solid var(--border-color);
border-radius:6px;
cursor:pointer;
transition:.15s;
}

.image-item:hover{
  background:var(--hover-color);
}

.image-item.selected{
  border-color:var(--primary-color);
  background:rgba(76,175,80,.08);
}

.image-item-preview{
width:48px;
height:48px;
object-fit:cover;
border-radius:6px;
}

.image-item-name{
flex:1;
font-size:12px;
overflow:hidden;
text-overflow:ellipsis;
white-space:nowrap;
}

.image-item-delete{
  background:none;
  border:none;
  color:red;
  font-size:16px;
  cursor:pointer;
  width:24px;
  height:24px;
  display:flex;
  align-items:center;
  justify-content:center;
}

/* warning */

.warning-message{
padding:8px;
background:#fff3cd;
border:1px solid #ffeaa7;
border-radius:6px;
font-size:12px;
}
</style>