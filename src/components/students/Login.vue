<template>
  <div class="login-container d-flex flex-column min-vh-100">
    <app-header title="Student Login" />
    <main class="container my-auto">
      <div class="card shadow-lg border-0 mx-auto" style="max-width: 400px;">
        <div class="card-body p-4 p-md-5">
          <form @submit.prevent="login" class="login-form">
            <form-input v-model="email" label="Email" type="email" placeholder="Email" required autocomplete="email" />
            <form-input v-model="password" label="Password" type="password" placeholder="Password" required autocomplete="current-password" />
            <button type="submit" :disabled="loading" class="btn btn-lg w-100 submit-btn position-relative overflow-hidden">
              <span v-if="loading">Logging in...</span>
              <span v-else>Login</span>
            </button>
          </form>
          <p class="text-center mt-4 mb-0">
            Don't have an account?
            <router-link to="/student/register" class="register-link-btn fw-medium">Register</router-link>
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

export default {
  name: 'StudentLogin',
  components: { AppHeader, FormInput },
  data() {
    return {
      email: '',
      password: '',
      loading: false,
    };
  },
  methods: {
    async login() {
      this.loading = true;
      try {
        const response = await axios.post('http://localhost:3000/student/login', {
          email: this.email,
          password: this.password,
        });
        if (response.data.status === 'success') {
          const authStore = useAuthStore();
          authStore.login('student', {
            id: response.data.data.student_id,
            email: response.data.data.email,
          });
          this.$router.push('/student/dashboard');
        } else {
          alert('Login failed: ' + response.data.message);
        }
      } catch (error) {
        console.error('Login error:', error);
        alert(error.response?.data?.message || 'An error occurred during login');
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
  background: linear-gradient(45deg, #4CAF50, #81C784);
  border: none;
  color: white;
}

.submit-btn:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-2px);
}

.submit-btn:disabled {
  background: #B0BEC5;
  opacity: 0.7;
  cursor: not-allowed;
}

.submit-btn::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: width 0.4s ease, height 0.4s ease;
}

.submit-btn:hover::after:not(:disabled) {
  width: 200%;
  height: 200%;
}

.register-link-btn {
  color: #4CAF50;
  text-decoration: none;
  transition: color 0.3s ease;
}

.register-link-btn:hover {
  color: #388E3C;
  text-decoration: underline;
}

@media (max-width: 576px) {
  .card {
    margin: 0 15px;
  }
}
</style>