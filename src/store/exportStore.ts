import { defineStore } from 'pinia'

export const useExportStore = defineStore('export', {
  state: () => ({
    format: 'png' as 'png' | 'jpeg' | 'webp',
    resolution: '1080' as '1080' | '1536' | '2160' | '3840' | '7680',
    quality: 100,
    transparentBackground: false
  }),

  actions: {
    setFormat(format: 'png' | 'jpeg' | 'webp') {
      this.format = format
    },

    setResolution(resolution: '1080' | '1536' | '2160' | '3840' | '7680') {
      this.resolution = resolution
    },

    setQuality(quality: number) {
      this.quality = Math.max(0, Math.min(100, quality))
    },

    setTransparentBackground(transparent: boolean) {
      this.transparentBackground = transparent
    }
  }
})