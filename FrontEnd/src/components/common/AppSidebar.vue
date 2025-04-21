<template>
    <nav class="sidebar bg-dark text-white p-3 d-flex flex-column">
      <ul class="nav flex-column gap-2">
        <li v-for="item in navItems" :key="item.path" class="nav-item">
          <router-link :to="item.path" class="nav-link text-white" active-class="active">
            <i :class="item.icon" class="me-2"></i> {{ item.label }}
          </router-link>
        </li>
      </ul>
    </nav>
  </template>
  
  <script>
  export default {
    name: 'AppSidebar',
    props: {
      navItems: {
        type: Array,
        required: true,
        default: () => [],
      },
    },
  };
  </script>
  
  <style scoped>
  .sidebar {
    width: 250px;
    background: linear-gradient(180deg, #2C3E50, #1A252F);
    min-height: calc(100vh - 60px); /* Adjust based on header height */
    position: sticky;
    top: 60px; /* Matches header height */
  }
  
  .nav-link {
    padding: 12px 16px;
    border-radius: 6px;
    transition: all 0.3s ease;
    font-weight: 500;
  }
  
  .nav-link:hover {
    background-color: rgba(255, 255, 255, 0.1);
    padding-left: 20px;
  }
  
  .nav-link.active {
    background-color: var(--primary);
    color: white;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
  }
  
  @media (max-width: 768px) {
    .sidebar {
      width: 100%;
      flex-direction: row;
      justify-content: space-around;
      padding: 10px;
      position: static;
      min-height: auto;
    }
  
    .nav {
      flex-direction: row;
      width: 100%;
      gap: 0;
    }
  
    .nav-item {
      flex: 1;
      text-align: center;
    }
  
    .nav-link {
      padding: 8px;
      font-size: 0.9rem;
    }
  
    .nav-link:hover {
      padding-left: 8px;
    }
  }
  </style>