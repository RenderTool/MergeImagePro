import { defineStore } from 'pinia'

export const useLayoutStore = defineStore('layout', {
  state: () => ({
    // 画布设置
    canvasWidth: 1080,
    canvasHeight: 1080,
    
    // 网格设置
    rows: 3,
    cols: 3,
    
    // 样式设置
    margin: 20,
    spacing: 8,
    borderRadius: 0,
    borderWidth: 2,
    borderColor: '#000000',
    backgroundColor: '#ffffff'
  }),

  actions: {
    // 画布设置
    setCanvasWidth(width: number) {
      this.canvasWidth = Math.max(100, Math.min(7680, width))
    },

    setCanvasHeight(height: number) {
      this.canvasHeight = Math.max(100, Math.min(7680, height))
    },

    // 网格设置
    setRows(rows: number) {
      this.rows = Math.max(1, Math.min(20, rows))
    },

    setCols(cols: number) {
      this.cols = Math.max(1, Math.min(20, cols))
    },

    // 样式设置
    setMargin(margin: number) {
      this.margin = Math.max(0, Math.min(200, margin))
    },

    setSpacing(spacing: number) {
      this.spacing = Math.max(0, Math.min(50, spacing))
    },

    setBorderRadius(radius: number) {
      this.borderRadius = Math.max(0, Math.min(100, radius))
    },

    setBorderWidth(width: number) {
      this.borderWidth = Math.max(0, Math.min(20, width))
    },

    setBorderColor(color: string) {
      this.borderColor = color
    },

    setBackgroundColor(color: string) {
      this.backgroundColor = color
    }
  }
})