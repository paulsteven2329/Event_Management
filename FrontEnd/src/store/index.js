import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    studentId: localStorage.getItem('student_id') || null,
    studentEmail: localStorage.getItem('student_email') || null,
    volunteerId: localStorage.getItem('volunteer_id') || null,
    volunteerEmail: localStorage.getItem('volunteer_email') || null,
    adminId: localStorage.getItem('admin_id') || null,
    adminEmail: localStorage.getItem('admin_email') || null,
  }),
  actions: {
    login(role, { id, email }) {
      if (role === 'student') {
        this.studentId = id;
        this.studentEmail = email;
        localStorage.setItem('student_id', id);
        localStorage.setItem('student_email', email);
      } else if (role === 'volunteer') {
        this.volunteerId = id;
        this.volunteerEmail = email;
        localStorage.setItem('volunteer_id', id);
        localStorage.setItem('volunteer_email', email);
      } else if (role === 'admin') {
        this.adminId = id;
        this.adminEmail = email || null;
        localStorage.setItem('admin_id', id);
        if (email) localStorage.setItem('admin_email', email);
      }
    },
    logout(role) {
      if (role === 'student') {
        this.studentId = null;
        this.studentEmail = null;
        localStorage.removeItem('student_id');
        localStorage.removeItem('student_email');
      } else if (role === 'volunteer') {
        this.volunteerId = null;
        this.volunteerEmail = null;
        localStorage.removeItem('volunteer_id');
        localStorage.removeItem('volunteer_email');
      } else if (role === 'admin') {
        this.adminId = null;
        this.adminEmail = null;
        localStorage.removeItem('admin_id');
        localStorage.removeItem('admin_email');
      }
    },
  },
});