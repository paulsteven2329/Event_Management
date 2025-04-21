<template>
  <div class="profile-container">
    <h2 class="text-center py-4">Your Volunteer Profile</h2>
    <div class="profile-content">
      <loading-spinner v-if="loading" message="Loading your profile..." />
      <error-message v-else-if="errorMessage" :message="errorMessage" :retry="fetchProfile" />
      <div v-else-if="profile" class="profile-details">
        <div class="profile-card">
          <div class="profile-item"><strong>Volunteer ID:</strong> <span>{{ profile.volunteer_id }}</span></div>
          <div class="profile-item"><strong>First Name:</strong> <span>{{ profile.first_name }}</span></div>
          <div class="profile-item"><strong>Last Name:</strong> <span>{{ profile.last_name }}</span></div>
          <div class="profile-item"><strong>Email:</strong> <span>{{ profile.email }}</span></div>
          <div class="profile-item"><strong>Phone Number:</strong> <span>{{ profile.phone_number || 'Not provided' }}</span></div>
          <div class="profile-item"><strong>Registration Date:</strong> <span>{{ formatDate(profile.registration_date) }}</span></div>
        </div>
        <router-link to="/volunteer/dashboard/settings" class="btn btn-outline-primary mt-3">Edit Profile</router-link>
      </div>
      <div v-else class="text-center py-4">
        <p class="text-muted">No profile data available.</p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { useAuthStore } from '../../store';
import LoadingSpinner from '../common/LoadingSpinner.vue';
import ErrorMessage from '../common/ErrorMessage.vue';

export default {
  name: 'VolunteerProfile',
  components: { LoadingSpinner, ErrorMessage },
  data() {
    return {
      profile: null,
      loading: true,
      errorMessage: null,
    };
  },
  created() {
    this.fetchProfile();
  },
  methods: {
    async fetchProfile() {
      const authStore = useAuthStore();
      if (!authStore.volunteerEmail) {
        this.errorMessage = 'Please log in first.';
        this.loading = false;
        this.$router.push('/volunteer/login');
        return;
      }
      try {
        console.log('Fetching profile for email:', authStore.volunteerEmail);
        const response = await axios.post('http://localhost:3000/volunteer/profile', {
          email: authStore.volunteerEmail,
        });
        console.log('API Response:', response.data);
        if (response.data.status === 'success') {
          this.profile = response.data.data;
          console.log('Profile set to:', this.profile);
        } else {
          this.errorMessage = response.data.message || 'Failed to retrieve profile.';
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        this.errorMessage = error.response?.data?.message || 'An error occurred while fetching the profile.';
      } finally {
        this.loading = false;
      }
    },
    formatDate(dateString) {
      return dateString ? new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Not provided';
    },
  },
};
</script>

<style scoped>
.profile-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f4f4f9 0%, #e0e7ff 100%);
  padding: 2rem;
}

.profile-content {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
  max-width: 700px;
  margin: 0 auto;
}

.profile-card {
  display: grid;
  gap: 1rem;
}

.profile-item {
  font-size: 1.1rem;
  color: #333;
}

.profile-item strong {
  color: #4CAF50;
}
</style>