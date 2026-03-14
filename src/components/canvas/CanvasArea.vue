<template>
  <div class="canvas-area" @wheel.prevent="handleWheel" @mousedown="handleMouseDown" @mousemove="handleMouseMove" @mouseup="handleMouseUp" @mouseleave="handleMouseUp">
    <div class="canvas-container" ref="canvasContainerRef">
      <canvas
        ref="canvasRef"
        class="canvas"
        :width="displayCanvasWidth"
        :height="displayCanvasHeight"
      ></canvas>
    </div>
    <!-- 缩放控制 -->
    <div class="zoom-controls">
      <button @click="decreaseZoom" class="zoom-button">-</button>
      <span class="zoom-value">{{ zoomLevel }}%</span>
      <button @click="increaseZoom" class="zoom-button">+</button>
      <button @click="fitToWindow" class="zoom-button fit-button">⌂</button>
      <button @click="resetZoom" class="zoom-button reset-button">100%</button>
    </div>
    <!-- 进度条 -->
    <div v-if="isRendering" class="progress-container">
      <div class="progress-bar" :style="{ width: progressValue + '%' }"></div>
      <span class="progress-text">{{ progressValue }}%</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useImageStore } from '../../store/imageStore'
import { useLayoutStore } from '../../store/layoutStore'
import { useExportStore } from '../../store/exportStore'
import { useEditorStore } from '../../store/editorStore'

const canvasRef = ref<HTMLCanvasElement>()
const canvasContainerRef = ref<HTMLElement>()
const imageStore = useImageStore()
const layoutStore = useLayoutStore()
const exportStore = useExportStore()
const editorStore = useEditorStore()

const zoomLevel = ref(100)
const canvasWidth = computed(() => layoutStore.canvasWidth)
const canvasHeight = computed(() => layoutStore.canvasHeight)

// 画布位置
const canvasX = ref(0)
const canvasY = ref(0)

// 鼠标状态
const isDragging = ref(false)
const lastMouseX = ref(0)
const lastMouseY = ref(0)

// 渲染进度
const isRendering = ref(false)
const progressValue = ref(0)

// 低分辨率显示画布尺寸，用于优化性能
const displayScale = 1.0
const displayCanvasWidth = computed(() => Math.floor(canvasWidth.value * displayScale))
const displayCanvasHeight = computed(() => Math.floor(canvasHeight.value * displayScale))

//居中显示
function centerCanvas() {
  const canvas = canvasContainerRef.value
  if (!canvas) return

  const container = canvas.parentElement
  if (!container) return

  const rect = container.getBoundingClientRect()

  const containerWidth = rect.width
  const containerHeight = rect.height

  const scale = zoomLevel.value / 100

  const canvasWidth = displayCanvasWidth.value
  const canvasHeight = displayCanvasHeight.value

  const scaledWidth = canvasWidth * scale
  const scaledHeight = canvasHeight * scale

  canvasX.value = (containerWidth - scaledWidth) / 2 / scale
  canvasY.value = (containerHeight - scaledHeight) / 2 / scale

  updateCanvasTransform()
}

// 自动调整缩放比例以适应预览区域
function fitToWindow() {
  const canvas = canvasContainerRef.value
  if (!canvas) return

  const container = canvas.parentElement
  if (!container) return

  const rect = container.getBoundingClientRect()

  const containerWidth = rect.width
  const containerHeight = rect.height

  const canvasWidth = displayCanvasWidth.value
  const canvasHeight = displayCanvasHeight.value

  const scaleX = containerWidth / canvasWidth
  const scaleY = containerHeight / canvasHeight

  const scale = Math.min(scaleX, scaleY)

  // 确保缩放值在安全范围内
  const calculatedZoom = Math.round(scale * 100)
  zoomLevel.value = Math.max(25, Math.min(500, calculatedZoom))

  centerCanvas()
  notifyZoomChanged()
}

// 别名，保持向后兼容
const autoZoom = fitToWindow

const images = computed(() => imageStore.images)
const rows = computed(() => layoutStore.rows)
const cols = computed(() => layoutStore.cols)
const margin = computed(() => layoutStore.margin)
const spacing = computed(() => layoutStore.spacing)
const borderRadius = computed(() => layoutStore.borderRadius)
const borderWidth = computed(() => layoutStore.borderWidth)
const borderColor = computed(() => layoutStore.borderColor)
const backgroundColor = computed(() => layoutStore.backgroundColor)
const selectedImages = computed(() => editorStore.selectedImages)



function updateCanvasTransform() {
  if (canvasContainerRef.value) {
    canvasContainerRef.value.style.transform =`scale(${zoomLevel.value / 100}) translate(${canvasX.value}px, ${canvasY.value}px)`
  }
}

function decreaseZoom() {
  zoomLevel.value = Math.max(25, zoomLevel.value - 10)
  updateCanvasTransform()
  notifyZoomChanged()
}

function increaseZoom() {
  zoomLevel.value = Math.min(500, zoomLevel.value + 10)
  updateCanvasTransform()
  notifyZoomChanged()
}

function resetZoom() {
  zoomLevel.value = 100
  centerCanvas()
  notifyZoomChanged()
}

function notifyZoomChanged() {
  window.dispatchEvent(new CustomEvent('zoomChanged', { detail: zoomLevel.value }))
}

function handleWheel(event: WheelEvent) {
  // 阻止默认滚动行为
  event.preventDefault()
  
  // 安全地计算缩放方向，避免deltaY值过大导致缩放跳变
  let delta: number
  if (event.deltaY === 0) {
    delta = 0
  } else if (event.deltaY > 0) {
    delta = -10
  } else {
    delta = 10
  }
  
  // 更新缩放级别，确保不会超出边界
  const newZoom = zoomLevel.value + delta
  zoomLevel.value = Math.max(25, Math.min(500, newZoom))
  
  // 应用缩放变换
  updateCanvasTransform()
  
  // 同步缩放级别到其他组件
  notifyZoomChanged()
}

function handleMouseDown(event: MouseEvent) {
  // 开始拖拽
  isDragging.value = true
  lastMouseX.value = event.clientX
  lastMouseY.value = event.clientY
}

function handleMouseMove(event: MouseEvent) {
  // 只有在拖拽状态下才移动画布
  if (isDragging.value) {
    const deltaX = event.clientX - lastMouseX.value
    const deltaY = event.clientY - lastMouseY.value
    
    // 更新画布位置，添加灵敏度系数
    const sensitivity = 1.5 // 增加50%的灵敏度
    canvasX.value += deltaX * sensitivity
    canvasY.value += deltaY * sensitivity
    
    // 应用变换
    updateCanvasTransform()
    
    // 更新鼠标位置
    lastMouseX.value = event.clientX
    lastMouseY.value = event.clientY
  }
}

function handleMouseUp() {
  // 结束拖拽
  isDragging.value = false
}

async function renderCanvas() {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // 设置缩放因子
  ctx.scale(displayScale, displayScale)

  // 清空画布
  ctx.fillStyle = backgroundColor.value
  ctx.fillRect(0, 0, canvasWidth.value, canvasHeight.value)

  // 计算每个格子的尺寸
  const totalSpacingX = (cols.value - 1) * spacing.value
  const totalSpacingY = (rows.value - 1) * spacing.value
  const cellWidth = (canvasWidth.value - 2 * margin.value - totalSpacingX) / cols.value
  const cellHeight = (canvasHeight.value - 2 * margin.value - totalSpacingY) / rows.value

  // 绘制网格线预览
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)'
  ctx.lineWidth = 1
  
  // 绘制垂直线
  for (let i = 0; i <= cols.value; i++) {
    const x = margin.value + i * (cellWidth + spacing.value)
    ctx.beginPath()
    ctx.moveTo(x, margin.value)
    ctx.lineTo(x, canvasHeight.value - margin.value)
    ctx.stroke()
  }
  
  // 绘制水平线
  for (let i = 0; i <= rows.value; i++) {
    const y = margin.value + i * (cellHeight + spacing.value)
    ctx.beginPath()
    ctx.moveTo(margin.value, y)
    ctx.lineTo(canvasWidth.value - margin.value, y)
    ctx.stroke()
  }

  // 如果图片数量较多，使用渐进式渲染
  const imagesToRender = images.value.filter((_, index) => {
    const row = Math.floor(index / cols.value)
    return row < rows.value
  })

  if (imagesToRender.length > 10) {
    // 显示进度条
    isRendering.value = true
    progressValue.value = 0

    // 分批次渲染图片
    const batchSize = 5
    let currentIndex = 0

    const renderBatch = () => {
      const endIndex = Math.min(currentIndex + batchSize, imagesToRender.length)
      
      for (let i = currentIndex; i < endIndex; i++) {
        const image = imagesToRender[i]
        const index = images.value.indexOf(image)
        const row = Math.floor(index / cols.value)
        const col = index % cols.value

        const x = margin.value + col * (cellWidth + spacing.value)
        const y = margin.value + row * (cellHeight + spacing.value)

        // 检查图片是否被选中
        const isSelected = selectedImages.value.includes(image.id)

        // 绘制边框
        if (borderWidth.value > 0 || isSelected) {
          ctx.strokeStyle = isSelected ? '#42b983' : borderColor.value
          ctx.lineWidth = isSelected ? borderWidth.value + 2 : borderWidth.value
          ctx.beginPath()
          ctx.roundRect(x, y, cellWidth, cellHeight, borderRadius.value)
          ctx.stroke()
        }

        // 绘制图片
        const img = new Image()
        img.onload = () => {
          // 计算图片绘制位置和尺寸
          const aspectRatio = img.width / img.height
          const cellRatio = cellWidth / cellHeight

          let drawWidth, drawHeight, drawX, drawY

          if (aspectRatio > cellRatio) {
            // 图片比单元格宽
            drawWidth = cellWidth
            drawHeight = cellWidth / aspectRatio
            drawX = x
            drawY = y + (cellHeight - drawHeight) / 2
          } else {
            // 图片比单元格高
            drawHeight = cellHeight
            drawWidth = cellHeight * aspectRatio
            drawX = x + (cellWidth - drawWidth) / 2
            drawY = y
          }

          // 裁剪图片到圆角矩形
          ctx.save()
          ctx.beginPath()
          ctx.roundRect(x, y, cellWidth, cellHeight, borderRadius.value)
          ctx.clip()
          ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight)
          ctx.restore()
        }
        img.src = image.src
      }

      currentIndex = endIndex
      progressValue.value = Math.round((currentIndex / imagesToRender.length) * 100)

      if (currentIndex < imagesToRender.length) {
        // 继续渲染下一批
        requestAnimationFrame(renderBatch)
      } else {
        // 渲染完成
        isRendering.value = false
      }
    }

    // 开始渲染
    renderBatch()
  } else {
    // 图片数量较少，直接渲染
    imagesToRender.forEach((image) => {
      const index = images.value.indexOf(image)
      const row = Math.floor(index / cols.value)
      const col = index % cols.value

      const x = margin.value + col * (cellWidth + spacing.value)
      const y = margin.value + row * (cellHeight + spacing.value)

      // 检查图片是否被选中
      const isSelected = selectedImages.value.includes(image.id)

      // 绘制边框
      if (borderWidth.value > 0 || isSelected) {
        ctx.strokeStyle = isSelected ? '#42b983' : borderColor.value
        ctx.lineWidth = isSelected ? borderWidth.value + 2 : borderWidth.value
        ctx.beginPath()
        ctx.roundRect(x, y, cellWidth, cellHeight, borderRadius.value)
        ctx.stroke()
      }

      // 绘制图片
      const img = new Image()
      img.onload = () => {
        // 计算图片绘制位置和尺寸
        const aspectRatio = img.width / img.height
        const cellRatio = cellWidth / cellHeight

        let drawWidth, drawHeight, drawX, drawY

        if (aspectRatio > cellRatio) {
          // 图片比单元格宽
          drawWidth = cellWidth
          drawHeight = cellWidth / aspectRatio
          drawX = x
          drawY = y + (cellHeight - drawHeight) / 2
        } else {
          // 图片比单元格高
          drawHeight = cellHeight
          drawWidth = cellHeight * aspectRatio
          drawX = x + (cellWidth - drawWidth) / 2
          drawY = y
        }

        // 裁剪图片到圆角矩形
        ctx.save()
        ctx.beginPath()
        ctx.roundRect(x, y, cellWidth, cellHeight, borderRadius.value)
        ctx.clip()
        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight)
        ctx.restore()
      }
      img.src = image.src
    })
  }
}

// 监听依赖变化，重新渲染
watch(
  [images, rows, cols, margin, spacing, borderWidth, borderColor, backgroundColor, canvasWidth, canvasHeight, selectedImages, borderRadius],
  () => {
    console.log('参数变化，触发重绘')
    // 直接调用renderCanvas，确保立即重绘
    renderCanvas()
  },
  { deep: true, flush: 'post' }
)

// 监听布局参数变化，重新调整画布
watch(
  [rows, cols, canvasWidth, canvasHeight],
  () => {
    nextTick(() => {
      fitToWindow()
    })
  },
  { flush: 'post' }
)

// 监听窗口大小变化，自动调整缩放以适应窗口
function handleResize() {
  nextTick(() => {
    fitToWindow()
  })
}



function handleSetZoom(event: any) {
  const requestedZoom = event.detail
  // 确保缩放值在安全范围内，避免变成0
  zoomLevel.value = Math.max(25, Math.min(500, requestedZoom))
  updateCanvasTransform()
}

onMounted(function() {
  updateCanvasTransform()
  renderCanvas()
  autoZoom()
  
  // 监听导出事件
  window.addEventListener('exportImage', exportImage)
  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
  // 监听缩放事件
  window.addEventListener('setZoom', handleSetZoom)
  // 监听适应窗口事件
  window.addEventListener('fitToWindow', autoZoom)
})

onUnmounted(function() {
  // 移除事件监听器
  window.removeEventListener('exportImage', exportImage)
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('setZoom', handleSetZoom)
  window.removeEventListener('fitToWindow', autoZoom)
})

async function exportImage() {
  const canvas = canvasRef.value
  if (!canvas) return

  // 获取导出设置
  const format = exportStore.format
  const quality = exportStore.quality / 100
  const resolution = exportStore.resolution
  const transparent = exportStore.transparentBackground

  // 创建高分辨率画布
  const scale = parseInt(resolution) / 1080
  const exportCanvas = document.createElement('canvas')
  exportCanvas.width = canvasWidth.value * scale
  exportCanvas.height = canvasHeight.value * scale
  const exportCtx = exportCanvas.getContext('2d')
  if (!exportCtx) return

  // 设置缩放
  exportCtx.scale(scale, scale)

  // 绘制背景
  if (transparent) {
    exportCtx.clearRect(0, 0, canvasWidth.value, canvasHeight.value)
  } else {
    exportCtx.fillStyle = backgroundColor.value
    exportCtx.fillRect(0, 0, canvasWidth.value, canvasHeight.value)
  }

  // 计算每个格子的尺寸
  const totalSpacingX = (cols.value - 1) * spacing.value
  const totalSpacingY = (rows.value - 1) * spacing.value
  const cellWidth = (canvasWidth.value - 2 * margin.value - totalSpacingX) / cols.value
  const cellHeight = (canvasHeight.value - 2 * margin.value - totalSpacingY) / rows.value

  // 绘制图片
  const promises = images.value.map((image, index) => {
    return new Promise<void>((resolve) => {
      const row = Math.floor(index / cols.value)
      const col = index % cols.value
      
      if (row >= rows.value) {
        resolve()
        return
      }

      const x = margin.value + col * (cellWidth + spacing.value)
      const y = margin.value + row * (cellHeight + spacing.value)

      // 绘制边框
      if (borderWidth.value > 0) {
        exportCtx.strokeStyle = borderColor.value
        exportCtx.lineWidth = borderWidth.value
        exportCtx.beginPath()
        exportCtx.roundRect(x, y, cellWidth, cellHeight, borderRadius.value)
        exportCtx.stroke()
      }

      // 绘制图片
      const img = new Image()
      img.onload = () => {
        // 计算图片绘制位置和尺寸
        const aspectRatio = img.width / img.height
        const cellRatio = cellWidth / cellHeight

        let drawWidth, drawHeight, drawX, drawY

        if (aspectRatio > cellRatio) {
          // 图片比单元格宽
          drawWidth = cellWidth
          drawHeight = cellWidth / aspectRatio
          drawX = x
          drawY = y + (cellHeight - drawHeight) / 2
        } else {
          // 图片比单元格高
          drawHeight = cellHeight
          drawWidth = cellHeight * aspectRatio
          drawX = x + (cellWidth - drawWidth) / 2
          drawY = y
        }

        // 裁剪图片到圆角矩形
        exportCtx.save()
        exportCtx.beginPath()
        exportCtx.roundRect(x, y, cellWidth, cellHeight, borderRadius.value)
        exportCtx.clip()
        exportCtx.drawImage(img, drawX, drawY, drawWidth, drawHeight)
        exportCtx.restore()
        resolve()
      }
      img.src = image.src
    })
  })

  // 等待所有图片绘制完成
  await Promise.all(promises)

  // 导出图片
  const dataUrl = exportCanvas.toDataURL(`image/${format}`, quality)
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = `merge-image-${Date.now()}.${format}`
  link.click()
}

// 暴露导出方法给父组件
defineExpose({
  exportImage
})
</script>

<style scoped>
.canvas-area {
  position: relative;
  height: 100%;
  overflow: hidden;
}

.canvas-container {
  position: absolute;
  left: 0;
  top: 0;
  transform-origin: top left;
}

.canvas {
  background-color: #f5f5f5;
  border-radius: 4px;
}

/* 缩放控制样式 */
.zoom-controls {
  position: absolute;
  bottom: 10px;
  left: 10px;
  display: flex;
  align-items: center;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.zoom-button {
  width: 32px;
  height: 32px;
  border: none;
  background-color: #f0f0f0;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 2px;
  transition: all 0.2s ease;
}

.zoom-button:hover {
  background-color: #e0e0e0;
}

.zoom-value {
  margin: 0 8px;
  font-size: 12px;
  min-width: 40px;
  text-align: center;
  color: #333;
}

.fit-button {
  font-size: 16px;
}

.reset-button {
  font-size: 10px;
  min-width: 45px;
}

/* 进度条样式 */
.progress-container {
  position: absolute;
  bottom: 60px;
  left: 10px;
  right: 10px;
  height: 20px;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 15;
}

.progress-bar {
  height: 100%;
  background-color: var(--primary-color);
  transition: width 0.3s ease;
}

.progress-text {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 500;
  color: #333;
}
</style>