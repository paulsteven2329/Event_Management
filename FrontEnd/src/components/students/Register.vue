<template>
  <div class="register-container d-flex flex-column min-vh-100">
    <app-header title="Student Register" />
    <main class="container my-auto">
      <div class="card shadow-lg border-0 mx-auto" style="max-width: 400px;">
        <div class="card-body p-4 p-md-5">
          <form @submit.prevent="register" class="register-form">
            <form-input v-model="first_name" label="First Name" placeholder="First Name" required />
            <form-input v-model="last_name" label="Last Name" placeholder="Last Name" required />
            <form-input v-model="email" label="Email" type="email" placeholder="Email" required autocomplete="email" />
            <form-input v-model="password" label="Password" type="password" placeholder="Password" required autocomplete="new-password" />
            <form-input v-model="phone_number" label="Phone Number" placeholder="Phone Number (Optional)" />
            <form-input label="Volunteer" type="select" v-model="volunteer_id" :options="volunteerOptions" required />
            <button type="submit" :disabled="loading" class="btn btn-lg w-100 submit-btn">
              <span v-if="loading">Registering...</span>
              <span v-else>Register</span>
            </button>
          </form>
          <p v-if="errorMessage" class="text-danger text-center mt-3 mb-0">{{ errorMessage }}</p>
          <p class="text-center mt-4 mb-0">
            Already have an account? <router-link to="/student/login" class="login-link-btn fw-medium">Login</router-link>
          </p>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import axios from 'axios';
import AppHeader from '../common/AppHeader.vue';
import FormInput from '../common/FormInput.vue';

const BASE_URL = 'http://localhost:3000';

export default {
  name: 'StudentRegister',
  components: { AppHeader, FormInput },
  data() {
    return {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      phone_number: '',
      volunteer_id: '',
      volunteers: [],
      errorMessage: '',
      loading: false,
    };
  },
  computed: {
    volunteerOptions() {
      return [
        { value: '', text: 'Select Volunteer', disabled: true },
        ...this.volunteers.map((v) => ({ value: v.volunteer_id, text: `${v.first_name} ${v.last_name}` })),
      ];
    },
  },
  created() {
    this.fetchVolunteers();
  },
  methods: {
    async fetchVolunteers() {
      try {
        const response = await axios.get(`${BASE_URL}/student/volunteers`);
        if (response.data.status === 'success') {
          this.volunteers = response.data.data;
        } else {
          this.errorMessage = 'Failed to load volunteers: ' + response.data.message;
        }
      } catch (error) {
        console.error('Volunteers fetch error:', error);
        this.errorMessage = 'Failed to load volunteers';
      }
    },
    async register() {
      this.loading = true;
      this.errorMessage = '';
      if (!this.first_name || !this.last_name || !this.email || !this.password || !this.volunteer_id) {
        this.errorMessage = 'All fields except phone number are required!';
        this.loading = false;
        return;
      }
      try {
        const response = await axios.post(`${BASE_URL}/student/register`, {
          first_name: this.first_name,
          last_name: this.last_name,
          email: this.email,
          password: this.password,
          phone_number: this.phone_number || null,
          volunteer_id: this.volunteer_id,
        });
        if (response.data.status === 'success') {
          alert('Registration successful! Please log in.');
          this.$router.push('/student/login');
        } else {
          this.errorMessage = response.data.message;
        }
      } catch (error) {
        this.errorMessage = error.response?.data?.message || 'Registration failed';
        console.error('Register error:', error);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.register-container {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  transition: transform 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
}

.submit-btn {
  background: linear-gradient(45deg, #4CAF50, #81C784);
  border: none;
  color: white;
}

.submit-btn:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-2px);
}

.login-link-btn {
  color: #4CAF50;
  text-decoration: none;
}

.login-link-btn:hover {
  color: #388E3C;
  text-decoration: underline Isla;
}
</style>