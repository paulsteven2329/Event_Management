<template>
  <div class="attendance-container">
    <h2 class="text-center py-4">Volunteer Attendance Management</h2>
    <div class="attendance-content">
      <loading-spinner v-if="loading" message="Loading attendance records..." />
      <div v-else>
        <!-- Volunteer Attendance Records -->
        <div v-if="attendance.volunteer_attendance?.length" class="mb-5">
          <h3 class="text-success fw-bold mb-3">Your Attendance Records</h3>
          <table class="attendance-table">
            <thead>
              <tr>
                <th>Event Name</th>
                <th>Attendance Date</th>
                <th>Location Latitude</th>
                <th>Location Longitude</th>
                <th>Start Time</th>
                <th>End Time</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="record in attendance.volunteer_attendance" :key="record.volunteer_attendance_id">
                <td>{{ record.event_name || 'N/A' }}</td>
                <td>{{ formatDate(record.attendance_date) }}</td>
                <td>{{ record.location_latitude }}</td>
                <td>{{ record.location_longitude }}</td>
                <td>{{ formatDateTime(record.start_time) }}</td>
                <td>{{ formatDateTime(record.end_time) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="mb-5 text-center">
          <p class="text-muted">No volunteer attendance records found.</p>
        </div>

        <!-- Student Attendance Records -->
        <div v-if="attendance.student_attendance?.length">
          <h3 class="text-success fw-bold mb-3">Student Attendance Records</h3>
          <table class="attendance-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Email</th>
                <th>Event Name</th>
                <th>Status</th>
                <th>Attendance Date</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Location Latitude</th>
                <th>Location Longitude</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="student in attendance.student_attendance" :key="student.attendance_id">
                <td>{{ `${student.first_name} ${student.last_name}` }}</td>
                <td>{{ student.student_email }}</td>
                <td>{{ student.event_name || 'N/A' }}</td>
                <td :class="student.attendance_status === 'present' ? 'status-present' : 'status-absent'">{{ student.attendance_status }}</td>
                <td>{{ formatDate(student.attendance_date) }}</td>
                <td>{{ formatDateTime(student.start_time) }}</td>
                <td>{{ formatDateTime(student.end_time) }}</td>
                <td>{{ student.location_latitude }}</td>
                <td>{{ student.location_longitude }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="text-center">
          <p class="text-muted">No student attendance records found.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { useAuthStore } from '../../store';
import LoadingSpinner from '../common/LoadingSpinner.vue';

export default {
  name: 'VolunteerAttendance',
  components: { LoadingSpinner },
  data() {
    return {
      attendance: { volunteer_attendance: [], student_attendance: [] },
      loading: false,
    };
  },
  created() {
    this.fetchAttendance();
  },
  methods: {
    async fetchAttendance() {
      const authStore = useAuthStore();
      if (!authStore.volunteerEmail) {
        this.$router.push('/volunteer/login');
        return;
      }
      this.loading = true;
      try {
        const response = await axios.get('http://localhost:3000/volunteer/attendance', {
          params: { email: authStore.volunteerEmail },
        });
        if (response.data.status === 'success') {
          this.attendance = response.data.data || { volunteer_attendance: [], student_attendance: [] };
        } else {
          // If backend returns a non-success status, assume no records
          this.attendance = { volunteer_attendance: [], student_attendance: [] };
        }
      } catch (error) {
        console.error('Error fetching attendance:', error);
        // On any error (e.g., 500), default to empty arrays to show "no records" message
        this.attendance = { volunteer_attendance: [], student_attendance: [] };
      } finally {
        this.loading = false;
      }
    },
    formatDate(date) {
      return date ? new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';
    },
    formatDateTime(timestamp) {
      return timestamp ? new Date(timestamp).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A';
    },
  },
};
</script>

<style scoped>
.attendance-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f4f4f9 0%, #e0e7ff 100%);
  padding: 2rem;
}

.attendance-content {
  max-width: 1200px;
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
  margin: 0 auto;
}

.attendance-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

.attendance-table th,
.attendance-table td {
  padding: 0.75rem;
  border-bottom: 1px solid #ddd;
}

.attendance-table th {
  background-color: #3498db;
  color: white;
}

.status-present { color: #4CAF50; }
.status-absent { color: #d32f2f; }

@media (max-width: 768px) {
  .attendance-table {
    font-size: 0.9rem;
  }
}
</style>