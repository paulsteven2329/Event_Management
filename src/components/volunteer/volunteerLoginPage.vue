<template>
  <div class="login-container d-flex flex-column min-vh-100">
    <app-header title="Volunteer Login" />
    <main class="container my-auto">
      <div class="card shadow-lg border-0 mx-auto" style="max-width: 400px;">
        <div class="card-body p-4 p-md-5">
          <form @submit.prevent="login" class="login-form">
            <form-input v-model="email" label="Email" type="email" placeholder="Email" required autocomplete="email" />
            <form-input v-model="password" label="Password" type="password" placeholder="Password" required autocomplete="current-password" />
            <button type="submit" :disabled="loading" class="btn btn-lg w-100 submit-btn">
              <span v-if="loading">Logging in...</span>
              <span v-else>Login</span>
            </button>
            <error-message v-if="errorMessage" :message="errorMessage" />
          </form>
          <p class="text-center mt-4 mb-0">
            Don't have an account? <router-link to="/volunteer/register" class="register-link-btn fw-medium">Register</router-link>
          </p>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import axios from 'axios';
import { useAuthStore } from '../../store';
import AppHeader from '../common/AppHeader.vue';
import FormInput from '../common/FormInput.vue';
import ErrorMessage from '../common/ErrorMessage.vue';

export default {
  name: 'VolunteerLogin',
  components: { AppHeader, FormInput, ErrorMessage },
  data() {
    return {
      email: '',
      password: '',
      loading: false,
      errorMessage: '',
    };
  },
  methods: {
    async login() {
      this.loading = true;
      this.errorMessage = '';
      try {
        console.log('Sending login request with:', { email: this.email, password: this.password });
        const response = await axios.post('http://localhost:3000/volunteer/login', {
          email: this.email,
          password: this.password,
        });
        console.log('API Response:', response.data);
        if (response.data.status === 'success') {
          const authStore = useAuthStore();
          const volunteerId = response.data.data.volunteer_id;
          if (!volunteerId) throw new Error('Volunteer ID not found in response');
          authStore.login('volunteer', {
            id: volunteerId,
            email: this.email,
          });
          console.log('Auth Store after login:', authStore.$state);
          await this.$nextTick();
          this.$router.push('/volunteer/dashboard').catch(err => {
            console.error('Navigation error:', err);
            this.errorMessage = 'Navigation to dashboard failed.';
          });
        } else {
          this.errorMessage = response.data.message || 'Invalid email or password';
        }
      } catch (error) {
        console.error('Login error:', error);
        this.errorMessage = error.response?.data?.message || error.message || 'Login failed';
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.login-container {
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
  background: linear-gradient(45deg, #3e8e41, #66BB6A);
  border: none;
  color: white;
}

.submit-btn:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-2px);
}

.register-link-btn {
  color: #4CAF50;
  text-decoration: none;
}

.register-link-btn:hover {
  color: #388E3C;
  text-decoration: underline;
}
</style>