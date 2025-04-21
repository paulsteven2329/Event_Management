<template>
  <div class="profile p-4">
    <h2>Profile</h2>
    <loading-spinner v-if="loading" message="Loading profile..." />
    <error-message v-else-if="errorMessage" :message="errorMessage" :retry="fetchProfile" />
    <div v-else class="card">
      <div class="card-body">
        <p><strong>First Name:</strong> {{ profile.first_name }}</p>
        <p><strong>Last Name:</strong> {{ profile.last_name }}</p>
        <p><strong>Email:</strong> {{ profile.email }}</p>
        <p><strong>Phone:</strong> {{ profile.phone_number || 'N/A' }}</p>
        <p><strong>Volunteer:</strong> {{ profile.volunteer_name || 'None' }}</p>
        <p><strong>Registered:</strong> {{ formatDate(profile.registration_date) }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { useAuthStore } from '../../store';
import LoadingSpinner from '../common/LoadingSpinner.vue';
import ErrorMessage from '../common/ErrorMessage.vue';

const BASE_URL = 'http://localhost:3000';

export default {
  name: 'StudentProfile',
  components: { LoadingSpinner, ErrorMessage },
  data() {
    return {
      profile: {},
      loading: true,
      errorMessage: '',
    };
  },
  async created() {
    await this.fetchProfile();
  },
  methods: {
    async fetchProfile() {
      this.loading = true;
      const authStore = useAuthStore();
      const email = authStore.studentEmail;
      if (!email) {
        this.errorMessage = 'Not logged in';
        this.loading = false;
        return;
      }
      try {
        const response = await axios.post(`${BASE_URL}/student/profile`, { email });
        if (response.data.status === 'success') {
          this.profile = response.data.data;
          this.errorMessage = '';
        } else {
          this.errorMessage = response.data.message;
        }
      } catch (error) {
        console.error('Profile fetch error:', error);
        this.errorMessage = error.response?.data?.message || 'Failed to fetch profile';
      } finally {
        this.loading = false;
      }
    },
    formatDate(date) {
      return date ? new Date(date).toLocaleString() : 'N/A';
    },
  },
};
</script>

<style scoped>
.profile {
  max-width: 800px;
  margin: 0 auto;
}
</style>