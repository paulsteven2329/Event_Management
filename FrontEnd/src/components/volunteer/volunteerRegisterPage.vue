<template>
  <div class="register-container d-flex flex-column min-vh-100">
    <app-header title="Volunteer Register" />
    <main class="container my-auto">
      <div class="card shadow-lg border-0 mx-auto" style="max-width: 400px;">
        <div class="card-body p-4 p-md-5">
          <form @submit.prevent="register" class="register-form">
            <form-input v-model="first_name" label="First Name" placeholder="First Name" required />
            <form-input v-model="last_name" label="Last Name" placeholder="Last Name" required />
            <form-input v-model="email" label="Email" type="email" placeholder="Email" required />
            <form-input v-model="password" label="Password" type="password" placeholder="Password" required />
            <form-input v-model="phone_number" label="Phone Number" placeholder="Phone Number (Optional)" />
            <button type="submit" :disabled="loading" class="btn btn-lg w-100 submit-btn">
              <span v-if="loading">Registering...</span>
              <span v-else>Register</span>
            </button>
            <error-message v-if="errorMessage" :message="errorMessage" />
          </form>
          <p class="text-center mt-4 mb-0">
            Already have an account? <router-link to="/volunteer/login" class="login-link-btn fw-medium">Login</router-link>
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
import ErrorMessage from '../common/ErrorMessage.vue';

export default {
  name: 'VolunteerRegister',
  components: { AppHeader, FormInput, ErrorMessage },
  data() {
    return {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      phone_number: '',
      loading: false,
      errorMessage: '',
    };
  },
  methods: {
    async register() {
      this.loading = true;
      this.errorMessage = '';
      if (!this.first_name || !this.last_name || !this.email || !this.password) {
        this.errorMessage = 'First name, last name, email, and password are required!';
        this.loading = false;
        return;
      }
      try {
        const response = await axios.post('http://localhost:3000/volunteer/register', {
          first_name: this.first_name,
          last_name: this.last_name,
          email: this.email,
          password: this.password,
          phone_number: this.phone_number,
        });
        if (response.data.status === 'success') {
          this.$router.push('/volunteer/login');
        }
      } catch (error) {
        this.errorMessage = error.response?.data?.message || 'Registration failed';
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
  background: linear-gradient(45deg, #3e8e41, #66BB6A);
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
  text-decoration: underline;
}
</style>