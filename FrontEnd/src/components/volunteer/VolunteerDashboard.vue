<template>
  <div class="dashboard min-vh-100 d-flex flex-column">
    <app-header title="Volunteer Dashboard" :logout="logout" />
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
  name: 'VolunteerDashboard',
  components: { AppHeader, AppSidebar },
  data() {
    return {
      navItems: [
        { path: '/volunteer/dashboard/profile', label: 'Profile', icon: 'bi-person' },
        { path: '/volunteer/dashboard/attendance', label: 'Attendance', icon: 'bi-calendar-check' },
        { path: '/volunteer/dashboard/upcoming-events', label: 'Upcoming Events', icon: 'bi-calendar-event' },
        // Removed '/volunteer/dashboard/live-events' as no matching endpoint exists
        { path: '/volunteer/dashboard/settings', label: 'Settings', icon: 'bi-gear' },
      ],
    };
  },
  methods: {
    logout() {
      useAuthStore().logout('volunteer');
      this.$router.push('/volunteer/login');
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