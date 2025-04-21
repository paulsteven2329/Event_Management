<template>
  <div class="settings-container">
    <h2 class="text-center py-4">Update Profile</h2>
    <div class="settings-content">
      <loading-spinner v-if="loadingProfile" message="Loading profile..." />
      <form v-else @submit.prevent="updateProfile" class="settings-form">
        <form-input v-model="profile.first_name" label="First Name" placeholder="Enter your first name" />
        <form-input v-model="profile.last_name" label="Last Name" placeholder="Enter your last name" />
        <form-input v-model="profile.phone_number" label="Phone Number" placeholder="Enter your phone number" />
        <form-input v-model="profile.password" label="Password" type="password" placeholder="Enter new password (optional)" />
        <button type="submit" :disabled="updating" class="btn btn-lg w-100 submit-btn">
          <span v-if="updating">Updating...</span>
          <span v-else>Update Profile</span>
        </button>
        <error-message v-if="errorMessage" :message="errorMessage" />
        <div v-if="successMessage" class="success-message mt-3">{{ successMessage }}</div>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { useAuthStore } from '../../store';
import LoadingSpinner from '../common/LoadingSpinner.vue';
import FormInput from '../common/FormInput.vue';
import ErrorMessage from '../common/ErrorMessage.vue';

export default {
  name: 'VolunteerSettings',
  components: { LoadingSpinner, FormInput, ErrorMessage },
  data() {
    return {
      profile: { first_name: '', last_name: '', phone_number: '', password: '' },
      loadingProfile: true,
      updating: false,
      successMessage: '',
      errorMessage: '',
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
        this.loadingProfile = false;
        this.$router.push('/volunteer/login');
        return;
      }
      try {
        console.log('Fetching profile for email:', authStore.volunteerEmail);
        const response = await axios.post('http://localhost:3000/volunteer/profile', {
          email: authStore.volunteerEmail,
        });
        console.log('Profile fetch response:', response.data);
        if (response.data.status === 'success') {
          const { first_name, last_name, phone_number } = response.data.data;
          this.profile = { first_name, last_name, phone_number: phone_number || '', password: '' };
        } else {
          this.errorMessage = response.data.message || 'Failed to load profile data';
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        this.errorMessage = error.response?.data?.message || 'Error loading profile';
      } finally {
        this.loadingProfile = false;
      }
    },
    async updateProfile() {
      const authStore = useAuthStore();
      if (!authStore.volunteerEmail) {
        this.errorMessage = 'Please log in first.';
        return;
      }
      this.updating = true;
      this.successMessage = '';
      this.errorMessage = '';
      const updateData = { email: authStore.volunteerEmail };
      if (this.profile.first_name) updateData.first_name = this.profile.first_name;
      if (this.profile.last_name) updateData.last_name = this.profile.last_name;
      if (this.profile.phone_number) updateData.phone_number = this.profile.phone_number;
      if (this.profile.password) updateData.password = this.profile.password;
      try {
        const response = await axios.put('http://localhost:3000/volunteer/update-profile', updateData);
        if (response.data.status === 'success') {
          this.successMessage = 'Profile updated successfully';
          this.profile.password = '';
        } else {
          this.errorMessage = response.data.message || 'Failed to update profile';
        }
      } catch (error) {
        console.error('Update error:', error);
        this.errorMessage = error.response?.data?.message || 'Failed to update profile';
      } finally {
        this.updating = false;
      }
    },
  },
};
</script>

<style scoped>
.settings-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f4f4f9 0%, #e0e7ff 100%);
  padding: 2rem;
}

.settings-content {
  max-width: 800px;
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
  margin: 0 auto;
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.submit-btn {
  background: linear-gradient(45deg, #4CAF50, #81C784);
  border: none;
  color: white;
}

.submit-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.success-message {
  color: #4CAF50;
  text-align: center;
}
</style>