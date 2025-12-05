<template>
  <div class="custom-select-container">
    <div
      class="custom-select-header"
      @click="toggleDropdown"
      ref="selectHeader"
      tabindex="0"
      @keydown.enter="toggleDropdown"
      @keydown.space="toggleDropdown"
      @keydown.arrow-down="focusNextOption"
      @keydown.arrow-up="focusPreviousOption"
    >
      <span class="selected-option">{{ selectedOptionText }}</span>
      <svg
        class="dropdown-arrow"
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    </div>

    <ul v-if="isOpen" class="custom-select-options" ref="optionsList" :style="optionsStyle">
      <li
        v-for="(option, index) in options"
        :key="option.value"
        class="option-item"
        :class="{ selected: option.value === selectedValue, focused: focusedIndex === index }"
        @click="selectOption(option)"
        @mouseenter="focusedIndex = index"
        tabindex="0"
        @keydown.enter="selectOption(option)"
        @keydown.space="selectOption(option)"
        @keydown.arrow-down="focusNextOption(index)"
        @keydown.arrow-up="focusPreviousOption(index)"
      >
        {{ option.label }}
      </li>
    </ul>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from "vue"

export default {
  name: "CustomSelect",
  props: {
    modelValue: {
      type: [String, Number],
      required: true,
    },
    options: {
      type: Array,
      required: true,
      validator: (value) => {
        return value.every((option) => typeof option.value !== "undefined" && typeof option.label !== "undefined")
      },
    },
    placeholder: {
      type: String,
      default: "请选择",
    },
  },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    const isOpen = ref(false)
    const focusedIndex = ref(-1)
    const selectHeader = ref(null)
    const optionsList = ref(null)
    const headerRect = ref(null)

    // 计算当前选中的选项文本
    const selectedOptionText = computed(() => {
      const selectedOption = props.options.find((option) => option.value === props.modelValue)
      return selectedOption ? selectedOption.label : props.placeholder
    })

    // 计算当前选中的选项值
    const selectedValue = computed({
      get: () => props.modelValue,
      set: (value) => {
        emit("update:modelValue", value)
      },
    })

    // 计算下拉列表的样式
    const optionsStyle = computed(() => {
      if (!headerRect.value) return {}

      return {
        position: "fixed",
        top: `${headerRect.value.top + headerRect.value.height + window.scrollY}px`,
        left: `${headerRect.value.left + window.scrollX}px`,
        width: `${headerRect.value.width}px`,
        zIndex: "2000",
        maxHeight: "200px",
        overflowY: "auto",
      }
    })

    // 切换下拉列表的显示状态
    const toggleDropdown = () => {
      isOpen.value = !isOpen.value
      if (isOpen.value) {
        // 更新下拉列表位置
        if (selectHeader.value) {
          headerRect.value = selectHeader.value.getBoundingClientRect()
        }
        // 设置焦点到第一个选项
        focusedIndex.value = 0
        // 等待DOM更新后设置焦点
        setTimeout(() => {
          if (optionsList.value && optionsList.value.children.length > 0) {
            optionsList.value.children[0].focus()
          }
        }, 0)
      } else {
        focusedIndex.value = -1
        selectHeader.value.focus()
      }
    }

    // 选择选项
    const selectOption = (option) => {
      selectedValue.value = option.value
      isOpen.value = false
      focusedIndex.value = -1
      selectHeader.value.focus()
    }

    // 聚焦到下一个选项
    const focusNextOption = (currentIndex = focusedIndex.value) => {
      if (!isOpen.value) {
        toggleDropdown()
        return
      }

      const nextIndex = currentIndex + 1
      if (nextIndex < props.options.length) {
        focusedIndex.value = nextIndex
        // 等待DOM更新后滚动到可见区域
        setTimeout(() => {
          if (optionsList.value && optionsList.value.children[nextIndex]) {
            optionsList.value.children[nextIndex].focus()
          }
        }, 0)
      }
    }

    // 聚焦到上一个选项
    const focusPreviousOption = (currentIndex = focusedIndex.value) => {
      if (!isOpen.value) {
        toggleDropdown()
        return
      }

      const prevIndex = currentIndex - 1
      if (prevIndex >= 0) {
        focusedIndex.value = prevIndex
        // 等待DOM更新后滚动到可见区域
        setTimeout(() => {
          if (optionsList.value && optionsList.value.children[prevIndex]) {
            optionsList.value.children[prevIndex].focus()
          }
        }, 0)
      }
    }

    // 点击外部关闭下拉列表
    const handleClickOutside = (event) => {
      if (
        selectHeader.value &&
        !selectHeader.value.contains(event.target) &&
        optionsList.value &&
        !optionsList.value.contains(event.target)
      ) {
        isOpen.value = false
        focusedIndex.value = -1
      }
    }

    // 添加事件监听器
    onMounted(() => {
      document.addEventListener("click", handleClickOutside)
    })

    // 移除事件监听器
    onUnmounted(() => {
      document.removeEventListener("click", handleClickOutside)
    })

    return {
      isOpen,
      focusedIndex,
      selectHeader,
      optionsList,
      selectedOptionText,
      selectedValue,
      toggleDropdown,
      selectOption,
      focusNextOption,
      focusPreviousOption,
      optionsStyle,
    }
  },
}
</script>

<style scoped>
.custom-select-container {
  position: relative;
  width: 100%;
  max-width: 200px;
}

.custom-select-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
  background-color: var(--card-bg);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
  user-select: none;
  box-sizing: border-box;
}

.custom-select-header:hover {
  border-color: #4a6cf7;
}

.custom-select-header:focus {
  outline: none;
  border-color: #4a6cf7;
  box-shadow: 0 0 0 2px rgba(58, 134, 255, 0.1);
}

.dropdown-arrow {
  transition: transform 0.3s ease;
  color: var(--text-secondary);
}

.custom-select-container:has(.custom-select-options) .dropdown-arrow {
  transform: rotate(180deg);
}

.custom-select-options {
  margin-top: 0.5rem;
  padding: 0.5rem 0;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  background-color: var(--card-bg);
  box-shadow: 0 4px 12px var(--shadow-color);
  list-style: none;
  box-sizing: border-box;
}

.option-item {
  padding: 0.75rem 1rem;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
  user-select: none;
  box-sizing: border-box;
}

.option-item:hover {
  background-color: var(--hover-bg);
}

.option-item.selected {
  background-color: rgba(58, 134, 255, 0.1);
  color: #4a6cf7;
  font-weight: 500;
}

.option-item.focused {
  background-color: var(--hover-bg);
  outline: none;
}

.option-item:focus {
  outline: none;
}

/* 滚动条样式 */
.custom-select-options::-webkit-scrollbar {
  width: 6px;
}

.custom-select-options::-webkit-scrollbar-track {
  background-color: var(--border-color);
  border-radius: 3px;
}

.custom-select-options::-webkit-scrollbar-thumb {
  background-color: var(--text-secondary);
  border-radius: 3px;
}

.custom-select-options::-webkit-scrollbar-thumb:hover {
  background-color: var(--text-primary);
}
</style>
