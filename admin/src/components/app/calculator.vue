<!-- components/Calculator.vue -->
<template>
  <div :class="[
    'max-w-md mx-auto mt-10 p-6 rounded-lg shadow-lg transition-colors duration-300',
    isDarkMode ? 'bg-gray-800' : 'bg-white'
  ]">
    <div class="flex justify-between items-center mb-4">
      <h2 :class="['text-xl font-bold', isDarkMode ? 'text-white' : 'text-gray-800']">
        {{ $t('discount') }}
      </h2>
    </div>
    <input type="text" v-model="display" readonly :class="[
      'w-full mb-4 p-2 text-right text-2xl border rounded',
      isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'
    ]" />
    <div class="grid grid-cols-4 gap-2">
      <button v-for="btn in buttons" :key="btn" @click="handleClick(btn)" :class="[
        'p-2 text-xl rounded transition-colors duration-200',
        isDarkMode
          ? isOperator(btn)
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : btn === 'C'
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-gray-700 hover:bg-gray-600 text-white'
          : isOperator(btn)
            ? 'bg-blue-500 hover:bg-blue-600 text-white'
            : btn === 'C'
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-800',
        { 'col-span-2': btn === 'OK' },
        { 'col-span-2': btn === 'X' }
      ]">
        {{ btn }}
      </button>
    </div>
  </div>

</template>

<script setup lang="ts">
const display = ref('0')
const currentValue = ref<number | null>(null)
const operator = ref<string | null>(null)
const waitingForOperand = ref(true)
const isDarkMode = ref(true)

const buttons = ['C', '7', '8', '9', '4', '5', '6', '0', '3', '2', '1', '.', 'X', 'OK',]

function isOperator(btn: string) {
  return ['+', '-', '×', '÷'].includes(btn)
}


const emit = defineEmits(['done', 'cancel'])

function handleClick(btn: string) {
  if (btn === 'C') {
    clear()
  } else if (btn === '.') {
    if (!display.value.includes('.')) {
      display.value += '.'
    }
  } else if (btn === 'X') {

    emit('cancel', null)
  } else if (btn === 'OK') {
    emit('done', Number(display.value))
  } else if (isOperator(btn)) {
    handleOperator(btn)
  } else if (btn === '=') {
    if (operator.value && currentValue.value !== null) {
      display.value = calculate()
      operator.value = null
      currentValue.value = null
      waitingForOperand.value = true
    }
  } else {
    handleNumber(btn)
  }
}

function handleNumber(num: string) {
  if (waitingForOperand.value) {
    display.value = num
    waitingForOperand.value = false
  } else {
    display.value = display.value === '0' ? num : display.value + num
  }
}

function handleOperator(op: string) {
  if (currentValue.value === null) {
    currentValue.value = parseFloat(display.value)
  } else if (operator.value) {
    display.value = calculate()
  }
  operator.value = op
  waitingForOperand.value = true
}

function calculate() {
  const prev = currentValue.value
  const current = parseFloat(display.value)
  let result = 0
  switch (operator.value) {
    case '+':
      result = prev! + current
      break
    case '-':
      result = prev! - current
      break
    case '×':
      result = prev! * current
      break
    case '÷':
      result = prev! / current
      break
  }
  currentValue.value = result
  return result.toString()
}

function clear() {
  display.value = '0'
  currentValue.value = null
  operator.value = null
  waitingForOperand.value = true
}
</script>