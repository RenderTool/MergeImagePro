import { defineStore } from 'pinia'
import { useImageStore } from './imageStore'

interface HistoryAction {
  type: string
  data: any
}

export const useEditorStore = defineStore('editor', {
  state: () => ({
    selectMode: false,
    selectedImages: [] as string[],
    history: [] as HistoryAction[],
    redoHistory: [] as HistoryAction[]
  }),

  actions: {
    toggleSelectMode() {
      this.selectMode = !this.selectMode
      if (!this.selectMode) {
        this.selectedImages = []
      }
    },

    selectImage(id: string) {
      this.selectedImages = [id]
    },

    toggleSelect(id: string) {
      const index = this.selectedImages.indexOf(id)
      if (index > -1) {
        this.selectedImages.splice(index, 1)
      } else {
        this.selectedImages.push(id)
      }
    },

    clearSelection() {
      this.selectedImages = []
    },

    selectAll() {
      const imageStore = useImageStore()
      this.selectedImages = imageStore.images.map(img => img.id)
    },

    deselectAll() {
      this.selectedImages = []
    },

    addHistory(action: HistoryAction) {
      this.history.push(action)
      this.redoHistory = []
    },

    undo() {
      if (this.history.length > 0) {
        const action = this.history.pop()
        if (action) {
          this.redoHistory.push(action)
          // 根据action类型执行撤销操作
          const imageStore = useImageStore()
          switch (action.type) {
            case 'deleteImage':
              // 恢复删除的图片
              const { image: deletedImage, index } = action.data
              imageStore.images.splice(index, 0, deletedImage)
              break
            case 'deleteSelected':
              // 恢复批量删除的图片
              action.data.forEach((item: any) => {
                imageStore.images.splice(item.index, 0, item.image)
              })
              break
            case 'reorderImages':
              // 恢复排序
              const { fromIndex, image: movedImage } = action.data
              const currentIndex = imageStore.images.findIndex(img => img.id === movedImage.id)
              if (currentIndex > -1) {
                imageStore.images.splice(currentIndex, 1)
                imageStore.images.splice(fromIndex, 0, movedImage)
              }
              break
          }
        }
      }
    },

    redo() {
      if (this.redoHistory.length > 0) {
        const action = this.redoHistory.pop()
        if (action) {
          this.history.push(action)
          // 根据action类型执行重做操作
          const imageStore = useImageStore()
          switch (action.type) {
            case 'deleteImage':
              // 重新删除图片
              imageStore.deleteImage(action.data.id)
              break
            case 'deleteSelected':
              // 重新批量删除图片
              const ids = action.data.map((item: any) => item.id)
              imageStore.deleteSelected(ids)
              break
            case 'reorderImages':
              // 重新排序
              imageStore.reorderImages(action.data.fromIndex, action.data.toIndex)
              break
          }
        }
      }
    }
  }
})