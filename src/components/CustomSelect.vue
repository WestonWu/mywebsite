<template>
  <div class="custom-select-container" :class="{ open: isOpen }" ref="selectContainer">
    <div
      class="custom-select-header"
      @click="toggleDropdown"
      tabindex="0"
      @keydown.enter="toggleDropdown"
      @keydown.space="toggleDropdown"
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

    <ul v-if="isOpen" class="custom-select-options">
      <li
        v-for="(option, index) in options"
        :key="option.value"
        class="option-item"
        :class="{ selected: option.value === selectedValue }"
        @click="selectOption(option)"
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
    const selectContainer = ref(null)
    const dropdownElement = ref(null)
    const selectedValue = computed({
      get: () => props.modelValue,
      set: (value) => {
        emit("update:modelValue", value)
      },
    })

    // 计算当前选中的选项文本
    const selectedOptionText = computed(() => {
      const selectedOption = props.options.find((option) => option.value === props.modelValue)
      return selectedOption ? selectedOption.label : props.placeholder
    })

    // 切换下拉列表的显示状态
    const toggleDropdown = () => {
      isOpen.value = !isOpen.value
    }

    // 选择选项
    const selectOption = (option) => {
      selectedValue.value = option.value
      isOpen.value = false
    }

    // 点击外部关闭下拉列表
    const handleClickOutside = (event) => {
      // 只有当下拉列表是打开状态时，才需要处理点击外部关闭
      if (isOpen.value) {
        // 检查点击事件是否发生在选择容器内部或下拉菜单内部
        const isClickInside = selectContainer.value && selectContainer.value.contains(event.target)
        if (!isClickInside) {
          // 关闭下拉列表
          isOpen.value = false
        }
      }
    }

    // 添加事件监听器
    onMounted(() => {
      // 使用捕获阶段监听，确保在事件冒泡前处理
      document.addEventListener("click", handleClickOutside, true)
    })

    // 移除事件监听器
    onUnmounted(() => {
      document.removeEventListener("click", handleClickOutside, true)
    })

    return {
      isOpen,
      selectContainer,
      dropdownElement,
      selectedOptionText,
      selectedValue,
      toggleDropdown,
      selectOption,
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

.custom-select-container.open .dropdown-arrow {
  transform: rotate(180deg);
}

.custom-select-options {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  margin-top: 0.5rem;
  padding: 0.5rem 0;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  background-color: var(--secondary-bg);
  box-shadow: 0 4px 12px var(--shadow-color);
  list-style: none;
  box-sizing: border-box;
  max-height: 200px;
  overflow-y: auto;
  z-index: 2000;
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
