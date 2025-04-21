<template>
  <div class="dashboard min-vh-100 d-flex flex-column">
    <app-header title="Student Dashboard" :logout="logout" />
    <div class="main-container flex-grow-1 d-flex">
      <app-sidebar :nav-items="navItems" />
      <main class="content flex-grow-1 p-4 bg-light">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '../../store';
import AppHeader from '../common/AppHeader.vue';
import AppSidebar from '../common/AppSidebar.vue';

export default {
  name: 'StudentDashboard',
  components: { AppHeader, AppSidebar },
  data() {
    return {
      navItems: [
        { path: '/student/dashboard/profile', label: 'Profile', icon: 'bi-person' },
        { path: '/student/dashboard/attendance', label: 'Attendance', icon: 'bi-calendar-check' },
        { path: '/student/dashboard/upcoming-events', label: 'Upcoming Events', icon: 'bi-calendar-event' },
        { path: '/student/dashboard/settings', label: 'Settings', icon: 'bi-gear' },
      ],
    };
  },
  methods: {
    logout() {
      const authStore = useAuthStore();
      authStore.logout('student');
      this.$router.push('/student/login');
    },
  },
};
</script>

<style scoped>
.dashboard {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.content {
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  margin: 20px;
}

@media (max-width: 768px) {
  .content {
    margin: 10px;
    padding: 15px;
  }
}
</style>