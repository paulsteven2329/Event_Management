<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  data() {
    return {
      isLoggedIn: false
    };
  },
  created() {
    this.checkLoginStatus();
  },
  methods: {
    checkLoginStatus() {
      this.isLoggedIn = !!localStorage.getItem('student_email');
    },
    logout() {
      localStorage.removeItem('student_email');
      this.isLoggedIn = false;
      this.$router.push('/');
    }
  }
};
</script>
