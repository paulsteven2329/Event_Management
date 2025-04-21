<template>
    <div class="error-container">
      <p class="error-message">{{ message }}</p>
      <button v-if="retry" class="btn btn-danger retry-btn" @click="retry">Retry</button>
    </div>
  </template>
  
  <script>
  export default {
    name: 'ErrorMessage',
    props: {
      message: {
        type: String,
        required: true,
      },
      retry: {
        type: Function,
        default: null,
      },
    },
  };
  </script>
  
  <style scoped>
  .error-container {
    text-align: center;
    padding: 2rem;
  }
  
  .error-message {
    font-size: 1.2rem;
    color: var(--danger);
    margin-bottom: 1rem;
  }
  
  .retry-btn {
    padding: 0.5rem 1rem;
    transition: background-color 0.3s ease;
  }
  
  .retry-btn:hover {
    background-color: #b71c1c;
  }
  
  @media (max-width: 576px) {
    .error-message {
      font-size: 1rem;
    }
  }
  </style>