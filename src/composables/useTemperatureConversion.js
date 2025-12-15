// 温度单位转换逻辑封装

export function useTemperatureConversion() {
  /**
   * 摄氏度转换为华氏度
   * @param {number} celsius 摄氏度
   * @returns {number} 华氏度
   */
  const celsiusToFahrenheit = (celsius) => {
    return (celsius * 9) / 5 + 32
  }

  /**
   * 华氏度转换为摄氏度
   * @param {number} fahrenheit 华氏度
   * @returns {number} 摄氏度
   */
  const fahrenheitToCelsius = (fahrenheit) => {
    return ((fahrenheit - 32) * 5) / 9
  }

  /**
   * 摄氏度转换为开尔文
   * @param {number} celsius 摄氏度
   * @returns {number} 开尔文
   */
  const celsiusToKelvin = (celsius) => {
    return celsius + 273.15
  }

  /**
   * 开尔文转换为摄氏度
   * @param {number} kelvin 开尔文
   * @returns {number} 摄氏度
   */
  const kelvinToCelsius = (kelvin) => {
    return kelvin - 273.15
  }

  /**
   * 华氏度转换为开尔文
   * @param {number} fahrenheit 华氏度
   * @returns {number} 开尔文
   */
  const fahrenheitToKelvin = (fahrenheit) => {
    return celsiusToKelvin(fahrenheitToCelsius(fahrenheit))
  }

  /**
   * 开尔文转换为华氏度
   * @param {number} kelvin 开尔文
   * @returns {number} 华氏度
   */
  const kelvinToFahrenheit = (kelvin) => {
    return celsiusToFahrenheit(kelvinToCelsius(kelvin))
  }

  /**
   * 通用温度转换函数
   * @param {number} value 温度值
   * @param {string} fromUnit 源单位 (celsius, fahrenheit, kelvin)
   * @param {string} toUnit 目标单位 (celsius, fahrenheit, kelvin)
   * @returns {number} 转换后的温度值
   */
  const convertTemperature = (value, fromUnit, toUnit) => {
    // 确保输入值是数字
    const numValue = parseFloat(value)
    if (isNaN(numValue)) {
      return NaN
    }

    // 如果源单位和目标单位相同，直接返回
    if (fromUnit === toUnit) {
      return numValue
    }

    // 转换逻辑
    switch (fromUnit) {
      case "celsius":
        switch (toUnit) {
          case "fahrenheit":
            return celsiusToFahrenheit(numValue)
          case "kelvin":
            return celsiusToKelvin(numValue)
          default:
            return numValue
        }
      case "fahrenheit":
        switch (toUnit) {
          case "celsius":
            return fahrenheitToCelsius(numValue)
          case "kelvin":
            return fahrenheitToKelvin(numValue)
          default:
            return numValue
        }
      case "kelvin":
        switch (toUnit) {
          case "celsius":
            return kelvinToCelsius(numValue)
          case "fahrenheit":
            return kelvinToFahrenheit(numValue)
          default:
            return numValue
        }
      default:
        return numValue
    }
  }

  /**
   * 格式化温度值为带单位的字符串
   * @param {number} value 温度值
   * @param {string} unit 温度单位 (celsius, fahrenheit, kelvin)
   * @param {number} decimals 小数位数
   * @returns {string} 格式化后的温度字符串
   */
  const formatTemperature = (value, unit, decimals = 1) => {
    // 确保输入值是数字
    const numValue = parseFloat(value)
    if (isNaN(numValue)) {
      return "--"
    }

    // 单位符号映射
    const unitSymbols = {
      celsius: "°C",
      fahrenheit: "°F",
      kelvin: "K"
    }

    // 格式化值
    const formattedValue = numValue.toFixed(decimals)
    const symbol = unitSymbols[unit] || ""

    return `${formattedValue}${symbol}`
  }

  /**
   * 获取温度单位列表
   * @returns {Array} 温度单位列表
   */
  const getTemperatureUnits = () => {
    return [
      { value: "celsius", label: "摄氏度 (°C)" },
      { value: "fahrenheit", label: "华氏度 (°F)" },
      { value: "kelvin", label: "开尔文 (K)" }
    ]
  }

  return {
    // 基础转换函数
    celsiusToFahrenheit,
    fahrenheitToCelsius,
    celsiusToKelvin,
    kelvinToCelsius,
    fahrenheitToKelvin,
    kelvinToFahrenheit,
    // 通用转换函数
    convertTemperature,
    // 辅助函数
    formatTemperature,
    getTemperatureUnits
  }
}
