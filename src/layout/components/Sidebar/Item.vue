<template>
  <el-icon v-if="icon" class="sub-el-icon">
    <component v-if="icon.includes('el-icon')" :is="getIconComponent(icon)" />
    <svg-icon v-else :icon-class="icon" />
  </el-icon>
</template>

<script>
import { Document, User, Medal, Avatar, DataLine, DataAnalysis, Calendar, Files, Setting, Lock, Odometer } from '@element-plus/icons-vue'

export default {
  name: 'MenuItem',
  props: {
    icon: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    }
  },
  setup() {
    const getIconComponent = (name) => {
      const map = {
        'el-icon-document': Document,
        'el-icon-user': User,
        'el-icon-medal': Medal,
        'el-icon-s-custom': Avatar,
        'el-icon-data-line': DataLine,
        'el-icon-data-analysis': DataAnalysis,
        'el-icon-date': Calendar,
        'el-icon-files': Files,
        'el-icon-setting': Setting,
        'el-icon-lock': Lock,
        'el-icon-odometer': Odometer
      }
      return map[name] || Document
    }
    return { getIconComponent }
  }
}
</script>

<style lang="scss" scoped>
.sub-el-icon {
  color: currentColor;
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
}

// Estilos para el texto del menú
.menu-item-text {
  font-family: 'Figtree', 'Segoe UI', sans-serif;
  letter-spacing: 0.3px;
}
</style>
