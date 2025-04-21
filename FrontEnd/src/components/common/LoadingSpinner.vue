<template>
    <div class="loading-container">
      <div class="spinner"></div>
      <p v-if="message" class="loading-message">{{ message }}</p>
    </div>
  </template>
  
  <script>
  export default {
    name: 'LoadingSpinner',
    props: {
      message: {
        type: String,
        default: '',
      },
    },
  };
  </script>
  
  <style scoped>
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 2rem;
  }
  
  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid var(--primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  .loading-message {
    font-size: 1.2rem;
    color: var(--text-muted);
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @media (max-width: 576px) {
    .spinner {
      width: 30px;
      height: 30px;
    }
  
    .loading-message {
      font-size: 1rem;
    }
  }
  </style>