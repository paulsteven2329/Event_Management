<template>
  <div class="form-group mb-3">
    <label v-if="label" :for="id" class="form-label">{{ label }}</label>
    <input
      v-if="type !== 'select' && type !== 'textarea'"
      :id="id"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :required="required"
      class="form-control form-control-lg"
      @input="$emit('update:modelValue', $event.target.value)"
    />
    <textarea
      v-else-if="type === 'textarea'"
      :id="id"
      :value="modelValue"
      :placeholder="placeholder"
      :required="required"
      class="form-control form-control-lg"
      @input="$emit('update:modelValue', $event.target.value)"
    ></textarea>
    <select
      v-else
      :id="id"
      :value="modelValue"
      class="form-control form-control-lg"
      :required="required"
      @change="$emit('update:modelValue', $event.target.value)"
    >
      <option v-for="option in options" :key="option.value" :value="option.value" :disabled="option.disabled">{{ option.text }}</option>
    </select>
  </div>
</template>

<script>
export default {
  name: 'FormInput',
  props: {
    label: { type: String, default: '' }, // Made optional with default empty string
    type: { type: String, default: 'text' },
    modelValue: { type: [String, Number], default: '' },
    placeholder: { type: String, default: '' },
    required: { type: Boolean, default: false },
    options: { type: Array, default: () => [] }, // For select inputs
  },
  computed: {
    id() {
      // Generate a unique ID, use label if provided, otherwise use a random string
      const base = this.label ? this.label.toLowerCase().replace(/\s/g, '-') : 'input';
      return `${base}-${Math.random().toString(36).substr(2, 5)}`;
    },
  },
};
</script>

<style scoped>
.form-label {
  font-weight: 600;
  color: #333;
}

.form-control {
  border-radius: 8px;
  border: 1px solid #ced4da;
  padding: 12px 16px;
  background-color: #f8f9fa;
  transition: all 0.3s ease;
}

.form-control:focus {
  border-color: #4CAF50;
  background-color: #fff;
  box-shadow: 0 0 0 0.2rem rgba(76, 175, 80, 0.25);
}
</style>