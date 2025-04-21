<template>
    <header class="header-gradient py-3 px-4 d-flex align-items-center justify-content-between">
      <h1 class="h3 mb-0 text-white">{{ title }}</h1>
      <button v-if="logout" class="btn btn-danger logout-btn" @click="logout">
        <i class="bi bi-box-arrow-right me-2"></i> Logout
      </button>
    </header>
  </template>
  
  <script>
  export default {
    name: 'AppHeader',
    props: {
      title: {
        type: String,
        required: true,
      },
      logout: {
        type: Function,
        default: null,
      },
    },
  };
  </script>
  
  <style scoped>
  .header-gradient {
    background: linear-gradient(90deg, var(--primary), var(--secondary));
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  
  .logout-btn {
    transition: transform 0.2s, opacity 0.2s;
  }
  
  .logout-btn:hover {
    opacity: 0.9;
    transform: translateY(-2px);
  }
  </style>