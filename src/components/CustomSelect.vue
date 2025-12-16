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

    <div v-if="isOpen" class="custom-select-content">
      <!-- 搜索输入框 -->
      <div class="search-container">
        <input
          type="text"
          class="search-input"
          ref="searchInput"
          v-model="searchQuery"
          placeholder="搜索..."
          @focus="handleSearchFocus"
          @input="debouncedSearch(searchQuery)"
          @keydown.enter="selectFirstOption"
          @keydown.arrow-down="navigateOptions('down')"
          @keydown.arrow-up="navigateOptions('up')"
        />
      </div>

      <!-- 选项列表 -->
      <ul class="custom-select-options">
        <!-- 无结果提示 -->
        <li v-if="filteredOptions.length === 0" class="no-results">未找到匹配选项</li>

        <!-- 选项列表 -->
        <li
          v-for="(option, index) in filteredOptions"
          :key="option.value"
          class="option-item"
          :class="{
            selected: option.value === selectedValue,
            focused: focusIndex === index,
          }"
          @click="selectOption(option)"
          @mouseenter="focusIndex = index"
        >
          {{ option.label }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from "vue"

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
    searchable: {
      type: Boolean,
      default: true,
    },
  },
  emits: ["update:modelValue", "search"],
  setup(props, { emit }) {
    const isOpen = ref(false)
    const selectContainer = ref(null)
    const searchInput = ref(null)
    const searchQuery = ref("")
    const focusIndex = ref(-1)

    // 防抖函数
    const debounce = (func, delay) => {
      let timeoutId
      return (...args) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => func.apply(null, args), delay)
      }
    }

    // 防抖版本的搜索事件
    const debouncedSearch = debounce((query) => {
      emit("search", query)
    }, 300)

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

    // 过滤后的选项列表
    const filteredOptions = computed(() => {
      // 禁用本地过滤，完全依赖API搜索
      return props.options
    })

    // 移除watch，只依赖@input事件触发search

    // 切换下拉列表的显示状态
    const toggleDropdown = () => {
      isOpen.value = !isOpen.value

      // 打开下拉列表时，自动聚焦到搜索输入框
      if (isOpen.value && props.searchable) {
        nextTick(() => {
          searchInput.value?.focus()
          focusIndex.value = -1
        })
      }
    }

    // 选择选项
    const selectOption = (option) => {
      selectedValue.value = option.value
      isOpen.value = false
      focusIndex.value = -1

      // 使用nextTick延迟重置searchQuery，避免触发不必要的搜索事件
      nextTick(() => {
        searchQuery.value = ""
      })
    }

    // 选择第一个匹配选项
    const selectFirstOption = () => {
      if (filteredOptions.value.length > 0) {
        selectOption(filteredOptions.value[0])
      }
    }

    // 键盘导航选项
    const navigateOptions = (direction) => {
      if (filteredOptions.value.length === 0) return

      if (direction === "down") {
        focusIndex.value = (focusIndex.value + 1) % filteredOptions.value.length
      } else {
        focusIndex.value = focusIndex.value <= 0 ? filteredOptions.value.length - 1 : focusIndex.value - 1
      }

      // 滚动到聚焦选项
      nextTick(() => {
        const focusedElement = document.querySelector(".custom-select-options .option-item.focused")
        if (focusedElement) {
          focusedElement.scrollIntoView({ block: "nearest" })
        }
      })
    }

    // 处理搜索框聚焦
    const handleSearchFocus = () => {
      // 聚焦时只重置焦点索引，不重置搜索条件
      focusIndex.value = -1
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
          searchQuery.value = ""
          focusIndex.value = -1
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
      searchInput,
      searchQuery,
      focusIndex,
      selectedOptionText,
      selectedValue,
      filteredOptions,
      toggleDropdown,
      selectOption,
      selectFirstOption,
      navigateOptions,
      handleSearchFocus,
      debouncedSearch,
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

/* 下拉内容容器 */
.custom-select-content {
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
  box-sizing: border-box;
  max-height: 250px;
  overflow-y: auto;
  z-index: 2000;
  display: flex;
  flex-direction: column;
}

/* 搜索容器 */
.search-container {
  padding: 0.5rem 1rem 0.5rem;
  border-bottom: 1px solid var(--border-color);
}

/* 搜索输入框 */
.search-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 0.9rem;
  background-color: var(--card-bg);
  color: var(--text-primary);
  box-sizing: border-box;
  outline: none;
  transition: all 0.3s ease;
}

.search-input:focus {
  border-color: #4a6cf7;
  box-shadow: 0 0 0 2px rgba(58, 134, 255, 0.1);
}

/* 选项列表 */
.custom-select-options {
  list-style: none;
  padding: 0;
  margin: 0;
  overflow-y: auto;
  flex: 1;
}

/* 无结果提示 */
.no-results {
  padding: 1rem;
  text-align: center;
  color: var(--text-secondary);
  font-style: italic;
  cursor: default;
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

.option-item.selected.focused {
  background-color: rgba(58, 134, 255, 0.2);
}

.option-item:focus {
  outline: none;
}

/* 滚动条样式 */
.custom-select-content::-webkit-scrollbar,
.custom-select-options::-webkit-scrollbar {
  width: 6px;
}

.custom-select-content::-webkit-scrollbar-track,
.custom-select-options::-webkit-scrollbar-track {
  background-color: var(--border-color);
  border-radius: 3px;
}

.custom-select-content::-webkit-scrollbar-thumb,
.custom-select-options::-webkit-scrollbar-thumb {
  background-color: var(--text-secondary);
  border-radius: 3px;
}

.custom-select-content::-webkit-scrollbar-thumb:hover,
.custom-select-options::-webkit-scrollbar-thumb:hover {
  background-color: var(--text-primary);
}
</style>
