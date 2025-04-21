<template>
  <div class="dashboard min-vh-100 d-flex flex-column">
    <app-header title="Admin Dashboard" />
    <div class="d-flex flex-grow-1">
      <!-- Sidebar Navigation -->
      <nav class="sidebar bg-dark text-white p-3">
        <ul class="nav flex-column">
          <li class="nav-item">
            <router-link to="/admin/dashboard" class="nav-link text-white" active-class="active">
              <i class="bi bi-house-door me-2"></i> Dashboard
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/admin/events" class="nav-link text-white" active-class="active">
              <i class="bi bi-calendar-event me-2"></i> Events
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/admin/students" class="nav-link text-white" active-class="active">
              <i class="bi bi-person me-2"></i> Students
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/admin/volunteers" class="nav-link text-white" active-class="active">
              <i class="bi bi-person-check me-2"></i> Volunteers
            </router-link>
          </li>
        </ul>
      </nav>

      <!-- Main Content -->
      <div class="main-container flex-grow-1 p-4 bg-light">
        <loading-spinner v-if="loading" message="Loading dashboard data..." />
        <error-message v-else-if="errorMessage" :message="errorMessage" :retry="fetchData" />
        <div v-else class="dashboard-content">
          <div class="row mb-4">
            <div class="col-md-3">
              <div class="card shadow-sm">
                <div class="card-body text-center">
                  <h5 class="card-title">Total Students</h5>
                  <p class="card-text display-4">{{ totalStudents }}</p>
                </div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="card shadow-sm">
                <div class="card-body text-center">
                  <h5 class="card-title">Total Volunteers</h5>
                  <p class="card-text display-4">{{ totalVolunteers }}</p>
                </div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="card shadow-sm">
                <div class="card-body text-center">
                  <h5 class="card-title">Total Events</h5>
                  <p class="card-text display-4">{{ totalEvents }}</p>
                </div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="card shadow-sm">
                <div class="card-body text-center">
                  <h5 class="card-title">Attendance Records</h5>
                  <p class="card-text display-4">{{ totalAttendance }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Student Attendance -->
          <div class="card mb-4 shadow-sm">
            <div class="card-header"><h5>Student Attendance</h5></div>
            <div class="card-body">
              <div v-if="!studentAttendance.length" class="text-muted text-center py-3">
                No student attendance data available.
              </div>
              <div v-else class="table-responsive">
                <table class="table table-striped">
                  <thead>
                    <tr>
                      <th>Email</th>
                      <th>Event</th>
                      <th>Status</th>
                      <th>Start Time</th>
                      <th>End Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="record in studentAttendance" :key="record.attendance_id">
                      <td>{{ record.email }}</td>
                      <td>{{ record.event_name }}</td>
                      <td>{{ record.attendance_status }}</td>
                      <td>{{ formatDate(record.start_time) }}</td>
                      <td>{{ formatDate(record.end_time) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Volunteer Attendance -->
          <div class="card mb-4 shadow-sm">
            <div class="card-header"><h5>Volunteer Attendance</h5></div>
            <div class="card-body">
              <div v-if="!volunteerAttendance.length" class="text-muted text-center py-3">
                No volunteer attendance data available.
              </div>
              <div v-else class="table-responsive">
                <table class="table table-striped">
                  <thead>
                    <tr>
                      <th>Email</th>
                      <th>Event</th>
                      <th>Start Time</th>
                      <th>End Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="record in volunteerAttendance" :key="record.volunteer_attendance_id">
                      <td>{{ record.email }}</td>
                      <td>{{ record.event_name }}</td>
                      <td>{{ formatDate(record.start_time) }}</td>
                      <td>{{ formatDate(record.end_time) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import AppHeader from '../common/AppHeader.vue';
import LoadingSpinner from '../common/LoadingSpinner.vue';
import ErrorMessage from '../common/ErrorMessage.vue';

const BASE_URL = 'http://localhost:3000';

export default {
  name: 'AdminDashboard',
  components: { AppHeader, LoadingSpinner, ErrorMessage },
  data() {
    return {
      students: [],
      volunteers: [],
      events: [],
      studentAttendance: [],
      volunteerAttendance: [],
      loading: true,
      errorMessage: '',
    };
  },
  async created() {
    await this.fetchData();
  },
  computed: {
    totalStudents() {
      return this.students.length || 0;
    },
    totalVolunteers() {
      return this.volunteers.length || 0;
    },
    totalEvents() {
      return this.events.length || 0;
    },
    totalAttendance() {
      return (this.studentAttendance.length || 0) + (this.volunteerAttendance.length || 0);
    },
  },
  methods: {
    async fetchData() {
      this.loading = true;
      try {
        const [studentsRes, volunteersRes, eventsRes, studentAttRes, volunteerAttRes] = await Promise.all([
          axios.get(`${BASE_URL}/admin/students`),
          axios.get(`${BASE_URL}/admin/volunteers`),
          axios.get(`${BASE_URL}/admin/events`),
          axios.get(`${BASE_URL}/admin/student-attendance`),
          axios.get(`${BASE_URL}/admin/volunteer-attendance`),
        ]);
        this.students = studentsRes.data.status === 'success' ? studentsRes.data.data : [];
        this.volunteers = volunteersRes.data.status === 'success' ? volunteersRes.data.data : [];
        this.events = eventsRes.data.status === 'success' ? eventsRes.data.data : [];
        this.studentAttendance = studentAttRes.data.status === 'success' ? studentAttRes.data.data : [];
        this.volunteerAttendance = volunteerAttRes.data.status === 'success' ? volunteerAttRes.data.data : [];
        console.log('Fetched Student Attendance:', this.studentAttendance);
        console.log('Fetched Volunteer Attendance:', this.volunteerAttendance);
        this.errorMessage = '';
      } catch (error) {
        this.errorMessage = error.response?.data?.message || 'Failed to load dashboard data';
        console.error('Fetch error:', error.response || error);
      } finally {
        this.loading = false;
      }
    },
    formatDate(date) {
      return date ? new Date(date).toLocaleString() : 'N/A';
    },
  },
};
</script>

<style scoped>
.dashboard {
  overflow: hidden;
}
.sidebar {
  width: 250px;
  min-width: 250px;
  height: 100%;
  position: fixed;
  top: 60px;
  bottom: 0;
  overflow-y: auto;
}
.main-container {
  margin-left: 250px;
  width: calc(100% - 250px);
}
.dashboard-content {
  max-width: 1400px;
  margin: 0 auto;
}
.card {
  border-radius: 10px;
}
.nav-link {
  padding: 10px 15px;
  border-radius: 5px;
}
.nav-link:hover {
  background-color: #495057;
}
.nav-link.active {
  background-color: #007bff;
}
</style>