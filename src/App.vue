<template>
  <div class="app-container">
    <Header />
    <div class="main-content">
      <CanvasArea />
      <ControlPanel v-if="!isMobile" />
    </div>
    
    <!-- 手机端抽屉 -->
    <div class="mobile-drawer" :class="{ open: showSettings }">
      <div class="drawer-header">
        <h3>设置</h3>
        <button @click="closeSettings" class="close-button">×</button>
      </div>
      <div class="drawer-content">
        <ControlPanel />
      </div>
    </div>
    <div v-if="showSettings" class="drawer-overlay" @click="closeSettings"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import Header from './components/header/Header.vue'
import CanvasArea from './components/canvas/CanvasArea.vue'
import ControlPanel from './components/panel/ControlPanel.vue'

// 响应式状态
const isMobile = ref(window.innerWidth < 768)
const showSettings = ref(false)

function toggleSettings() {
  showSettings.value = !showSettings.value
}

function closeSettings() {
  showSettings.value = false
}

// 监听窗口大小变化
function handleResize() {
  isMobile.value = window.innerWidth < 768
}

// 监听设置面板切换事件
function handleToggleSettings() {
  toggleSettings()
}

onMounted(function() {
  window.addEventListener('resize', handleResize)
  window.addEventListener('toggleSettings', handleToggleSettings)
})

onUnmounted(function() {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('toggleSettings', handleToggleSettings)
})
</script>

<style scoped>
/* 抽屉样式 */
.mobile-drawer {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 70vh;
  background-color: white;
  border-top-left-radius: var(--border-radius-lg);
  border-top-right-radius: var(--border-radius-lg);
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  transform: translateY(100%);
  transition: transform 0.3s ease;
  z-index: 100;
  display: flex;
  flex-direction: column;
}

.mobile-drawer.open {
  transform: translateY(0);
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
}

.drawer-header h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s ease;
}

.close-button:hover {
  background-color: var(--hover-color);
}

.drawer-content {
  flex: 1;
  overflow-y: auto;
}

.drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 99;
}

/* 响应式设计 */
@media (min-width: 768px) {
  .mobile-drawer,
  .drawer-overlay {
    display: none;
  }
}
</style>