import { defineStore } from 'pinia'
import { useEditorStore } from './editorStore'
import { useLayoutStore } from './layoutStore'

interface Image {
  id: string
  name: string
  src: string
  thumbnail: string
}

export const useImageStore = defineStore('image', {
  state: () => ({
    images: [] as Image[]
  }),

  actions: {
    addHistory(action: { type: string; data: any }) {
      const editorStore = useEditorStore()
      editorStore.addHistory(action)
    },
    async uploadImages(files: File[]) {
      // 限制最多100张图片
      if (this.images.length + files.length > 100) {
        alert('最多支持100张图片')
        return
      }

      const newImages: Image[] = []
      
      for (const file of files) {
        if (!file.type.startsWith('image/')) {
          continue
        }

        const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
        const src = URL.createObjectURL(file)
        const thumbnail = await this.createThumbnail(file)

        newImages.push({
          id,
          name: file.name,
          src,
          thumbnail
        })
      }

      this.images = [...this.images, ...newImages]

      // 当上传的图片大于9张时，自动计算行列数比例
      if (this.images.length > 9) {
        this.calculateGridSize()
      }
    },

    calculateGridSize() {
      const layoutStore = useLayoutStore()
      const imageCount = this.images.length
      
      // 计算最接近的平方根，使行列数尽可能接近
      const sqrt = Math.sqrt(imageCount)
      let cols = Math.ceil(sqrt)
      let rows = Math.ceil(imageCount / cols)
      
      // 调整行列数，使布局更美观
      if (rows > cols && rows - cols > 1) {
        cols++
        rows = Math.ceil(imageCount / cols)
      }
      
      // 限制最大行列数
      cols = Math.min(cols, 10)
      rows = Math.min(rows, 10)
      
      layoutStore.setCols(cols)
      layoutStore.setRows(rows)
    },

    createThumbnail(file: File): Promise<string> {
      return new Promise((resolve) => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        const img = new Image()

        canvas.width = 100
        canvas.height = 100

        img.onload = () => {
          const aspectRatio = img.width / img.height
          let drawWidth, drawHeight, drawX, drawY

          if (aspectRatio > 1) {
            drawWidth = 100
            drawHeight = 100 / aspectRatio
            drawX = 0
            drawY = (100 - drawHeight) / 2
          } else {
            drawHeight = 100
            drawWidth = 100 * aspectRatio
            drawX = (100 - drawWidth) / 2
            drawY = 0
          }

          ctx?.drawImage(img, drawX, drawY, drawWidth, drawHeight)
          resolve(canvas.toDataURL('image/jpeg', 0.7))
        }

        img.src = URL.createObjectURL(file)
      })
    },

    deleteImage(id: string) {
      const index = this.images.findIndex(img => img.id === id)
      if (index > -1) {
        const deletedImage = this.images[index]
        // 释放URL对象
        URL.revokeObjectURL(this.images[index].src)
        this.images.splice(index, 1)
        // 添加历史记录
        this.addHistory({
          type: 'deleteImage',
          data: { id, image: deletedImage, index }
        })
      }
    },

    deleteSelected(ids: string[]) {
      const deletedImages: { id: string; image: Image; index: number }[] = []
      ids.forEach(id => {
        const index = this.images.findIndex(img => img.id === id)
        if (index > -1) {
          deletedImages.push({ id, image: this.images[index], index })
        }
        this.deleteImage(id)
      })
      // 添加历史记录
      this.addHistory({
        type: 'deleteSelected',
        data: deletedImages
      })
    },

    reorderImages(fromIndex: number, toIndex: number) {
      const [movedImage] = this.images.splice(fromIndex, 1)
      this.images.splice(toIndex, 0, movedImage)
      // 添加历史记录
      this.addHistory({
        type: 'reorderImages',
        data: { fromIndex, toIndex, image: movedImage }
      })
    },

    clearImages() {
      // 释放所有URL对象
      this.images.forEach(img => {
        URL.revokeObjectURL(img.src)
      })
      this.images = []
    }
  }
})