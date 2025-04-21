<template>
  <div>
    <h2>Attendance</h2>
    <div v-if="attendance.length">
      <table>
        <thead>
          <tr>
            <th>Event</th>
            <th>Status</th>
            <th>Start Time</th>
            <th>End Time</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="record in attendance" :key="record.attendance_id">
            <td>{{ record.event_name }}</td>
            <td>{{ record.attendance_status }}</td>
            <td>{{ formatDateTime(record.start_time) }}</td>
            <td>{{ formatDateTime(record.end_time) || 'N/A' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-else>No attendance records found.</p>
  </div>
</template>

<script>
import axios from 'axios';
import { useAuthStore } from '../../store';

export default {
  name: 'StudentAttendance',
  data() {
    return {
      attendance: [],
    };
  },
  created() {
    this.fetchAttendance();
  },
  methods: {
    async fetchAttendance() {
      const authStore = useAuthStore();
      if (!authStore.studentEmail) {
        this.$router.push('/student/login');
        return;
      }
      try {
        const response = await axios.get('http://localhost:3000/student/attendance-by-email', {
          params: { email: authStore.studentEmail },
        });
        if (response.data.status === 'success') {
          this.attendance = response.data.data || [];
        } else {
          console.error('Failed to fetch attendance:', response.data.message);
        }
      } catch (error) {
        console.error('Attendance fetch error:', error);
      }
    },
    formatDateTime(datetime) {
      return datetime ? new Date(datetime).toLocaleString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'
      }) : '';
    },
  },
};
</script>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

th, td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

th {
  background-color: #f2f2f2;
}
</style>