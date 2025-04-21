<template>
  <div class="settings-container">
    <h2>Update Profile</h2>
    <form @submit.prevent="updateProfile" class="settings-form">
      <form-input label="Select what to update" type="select" v-model="updateOption" @change="resetFields" :options="updateOptions" />
      <form-input v-if="updateOption === 'name'" v-model="profile.first_name" label="First Name" placeholder="Enter your first name" />
      <form-input v-if="updateOption === 'name'" v-model="profile.last_name" label="Last Name" placeholder="Enter your last name" />
      <form-input v-if="updateOption === 'mobile'" v-model="profile.phone_number" label="Phone Number" placeholder="Enter your phone number" />
      <form-input v-if="updateOption === 'password'" v-model="profile.current_password" label="Current Password" type="password" placeholder="Enter your current password" />
      <form-input v-if="updateOption === 'password'" v-model="profile.new_password" label="New Password" type="password" placeholder="Enter your new password" />
      <button type="submit" class="submit-btn">Update Profile</button>
    </form>
  </div>
</template>

<script>
import axios from 'axios';
import { useAuthStore } from '../../store';
import FormInput from '../common/FormInput.vue';

export default {
  name: 'StudentSettings',
  components: { FormInput },
  data() {
    return {
      updateOption: 'name',
      profile: { first_name: '', last_name: '', phone_number: '', current_password: '', new_password: '' },
      updateOptions: [
        { value: 'name', text: 'Name' },
        { value: 'mobile', text: 'Mobile' },
        { value: 'password', text: 'Password' },
      ],
    };
  },
  created() {
    this.fetchProfile();
  },
  methods: {
    async fetchProfile() {
      const authStore = useAuthStore();
      const email = authStore.studentEmail;
      if (!email) {
        alert('Not logged in');
        return;
      }
      try {
        const response = await axios.post('http://localhost:3000/student/profile', { email });
        if (response.data.status === 'success') {
          const { first_name, last_name, phone_number } = response.data.data;
          Object.assign(this.profile, { first_name, last_name: last_name || '', phone_number: phone_number || '' });
        }
      } catch (error) {
        alert('Failed to load profile');
      }
    },
    resetFields() {
      if (this.updateOption !== 'name') this.profile.first_name = this.profile.last_name = '';
      if (this.updateOption !== 'mobile') this.profile.phone_number = '';
      if (this.updateOption !== 'password') this.profile.current_password = this.profile.new_password = '';
    },
    async updateProfile() {
      const authStore = useAuthStore();
      const email = authStore.studentEmail;
      if (!email) {
        alert('Not logged in');
        return;
      }
      const payload = { email };
      if (this.updateOption === 'name') {
        payload.first_name = this.profile.first_name;
        payload.last_name = this.profile.last_name;
      } else if (this.updateOption === 'mobile') {
        payload.phone_number = this.profile.phone_number;
      } else {
        payload.current_password = this.profile.current_password;
        payload.password = this.profile.new_password;
      }
      try {
        const response = await axios.put('http://localhost:3000/student/update-profile', payload);
        if (response.data.status === 'success') {
          alert('Profile updated successfully');
          this.fetchProfile();
          this.resetFields();
        }
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to update profile');
      }
    },
  },
};
</script>

<style scoped>
.settings-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f4f4f9 0%, #e0e7ff 100%);
  padding: 30px;
  max-width: 800px;
  margin: 0 auto;
}

h2 {
  font-size: 2em;
  color: #4CAF50;
  text-align: center;
  margin-bottom: 30px;
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.submit-btn {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 4px;
}
</style>