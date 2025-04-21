<template>
  <div class="welcome-container d-flex flex-column min-vh-100">
    <header class="header-gradient text-center py-4">
      <div class="logo">
        <h1 class="display-4 fw-bold text-white mb-2">Welcome</h1>
        <p class="lead text-light opacity-75">
          Please select your account type to continue
        </p>
      </div>
    </header>

    <main class="container my-auto">
      <div class="card shadow-lg border-0 mx-auto" style="max-width: 480px;">
        <div class="card-body p-4 p-md-5">
          <p class="text-center fw-medium mb-4 fs-5">Are you a:</p>
          <div class="btn-group d-flex gap-2 mb-4" role="group">
            <button 
              type="button" 
              class="btn flex-grow-1" 
              :class="{ 'student-btn': true, 'active': selectedType === 'student' }"
              @click="selectType('student')"
            >
              Student
            </button>
            <button 
              type="button" 
              class="btn flex-grow-1" 
              :class="{ 'volunteer-btn': true, 'active': selectedType === 'volunteer' }"
              @click="selectType('volunteer')"
            >
              Volunteer
            </button>
            <button 
              type="button" 
              class="btn flex-grow-1" 
              :class="{ 'admin-btn': true, 'active': selectedType === 'admin' }"
              @click="selectType('admin')"
            >
              Admin
            </button>
          </div>
          <button 
            @click="navigateToLogin"
            class="btn btn-primary w-100 btn-lg proceed-btn position-relative overflow-hidden"
            :disabled="!selectedType"
          >
            Proceed to Login
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
export default {
  name: 'WelcomePage',
  data() {
    return {
      selectedType: null
    };
  },
  methods: {
    selectType(type) {
      this.selectedType = type;
    },
    navigateToLogin() {
      if (this.selectedType === 'student') {
        this.$router.push('/student/login');
      } else if (this.selectedType === 'volunteer') {
        this.$router.push('/volunteer/login');
      } else if (this.selectedType === 'admin') {
        this.$router.push('/admin/dashboard'); // Changed to /admin/login
      }
    }
  }
};
</script>

<style scoped>
/* Custom styles with Bootstrap integration */
.welcome-container {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.header-gradient {
  background: linear-gradient(90deg, rgba(255,255,255,0.1), rgba(255,255,255,0.2));
}

.card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  transition: transform 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
}

/* Button group styling */
.btn-group .btn {
  transition: all 0.3s ease;
  border: none;
}

/* Student button */
.student-btn {
  background: linear-gradient(45deg, #4CAF50, #81C784);
  color: white;
}

.student-btn:not(.active):hover {
  opacity: 0.9;
}

.student-btn.active {
  background: linear-gradient(45deg, #388E3C, #66BB6A);
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
}

/* Volunteer button */
.volunteer-btn {
  background: linear-gradient(45deg, #3e8e41, #66BB6A);
  color: white;
}

.volunteer-btn:not(.active):hover {
  opacity: 0.9;
}

.volunteer-btn.active {
  background: linear-gradient(45deg, #2E7D32, #4CAF50);
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
}

/* Admin button */
.admin-btn {
  background: linear-gradient(45deg, #0288D1, #4FC3F7);
  color: white;
}

.admin-btn:not(.active):hover {
  opacity: 0.9;
}

.admin-btn.active {
  background: linear-gradient(45deg, #0277BD, #29B6F6);
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
}

/* Proceed button */
.proceed-btn {
  background: linear-gradient(45deg, #0288D1, #4FC3F7);
  border: none;
}

.proceed-btn:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}

.proceed-btn:disabled {
  background: #B0BEC5;
  opacity: 0.7;
  cursor: not-allowed;
}

.proceed-btn::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(255,255,255,0.2);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: width 0.4s ease, height 0.4s ease;
}

.proceed-btn:hover::after:not(:disabled) {
  width: 200%;
  height: 200%;
}

/* Animation for header */
.header-gradient {
  animation: fadeIn 1s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Responsive adjustments */
@media (max-width: 576px) {
  .card {
    margin: 0 15px;
  }
  
  .display-4 {
    font-size: 2.5rem;
  }
  
  .lead {
    font-size: 1rem;
  }
  
  .btn-group {
    flex-direction: column;
    gap: 10px;
  }
}
</style>