<template>
  <div class="events-container">
    <h2 class="text-success fw-bold text-center py-4">Upcoming Events</h2>
    <div class="container events-content">
      <loading-spinner v-if="loading" message="Loading events..." />
      <error-message v-else-if="error" :message="error" :retry="fetchUpcomingEvents" />
      <div v-else-if="uniqueEvents.length" class="events-list">
        <div v-for="event in uniqueEvents" :key="event.event_id" class="event-item mb-4">
          <div class="card shadow-sm">
            <div class="card-body">
              <h5 class="card-title text-dark">{{ event.event_name }}</h5>
              <p class="card-text text-muted">{{ event.event_description }}</p>
              <p class="card-text"><em>Date: {{ formatDate(event.event_date) }} | Time: {{ event.event_time || 'Not set' }}</em></p>
              <div v-if="event.is_completed" class="badge bg-danger mt-3">Event is completed</div>
              <div v-else-if="prompts[event.event_id]" class="alert alert-info mt-3">
                Event has started! Please mark your attendance.
                <button class="btn btn-sm btn-primary ms-2" @click="markAttendance(event, 'start')">Mark Present</button>
              </div>
              <div v-else-if="isActive(event)" class="mt-3">
                <span class="badge bg-success">Present</span>
                <button class="btn btn-sm btn-warning ms-2" @click="markAttendance(event, 'end')">End Attendance</button>
              </div>
              <div v-else-if="event.is_started" class="badge bg-info mt-3">Event Started</div>
              <div v-else class="badge bg-warning mt-3">Not Started</div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="text-center py-4">
        <p class="text-muted">{{ noEventsMessage }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { useAuthStore } from '../../store';
import LoadingSpinner from '../common/LoadingSpinner.vue';
import ErrorMessage from '../common/ErrorMessage.vue';

export default {
  name: 'StudentUpcomingEvents',
  components: { LoadingSpinner, ErrorMessage },
  data() {
    return {
      events: [],
      prompts: {},
      attendanceStatus: {},
      noEventsMessage: 'No upcoming events found.',
      loading: false,
      error: '',
      pollInterval: null,
    };
  },
  computed: {
    uniqueEvents() {
      return [...new Map(this.events.map(event => [event.event_id, event])).values()];
    },
  },
  created() {
    this.fetchUpcomingEvents();
    this.startPolling();
  },
  beforeUnmount() {
    if (this.pollInterval) clearInterval(this.pollInterval);
  },
  methods: {
    async fetchUpcomingEvents() {
      const authStore = useAuthStore();
      if (!authStore.studentEmail) {
        this.error = 'Please log in to view events.';
        this.$router.push('/student/login');
        return;
      }
      this.loading = true;
      this.error = '';
      try {
        const response = await axios.get('http://localhost:3000/student/upcoming-events', {
          params: { email: authStore.studentEmail },
        });
        if (response.data.status === 'success') {
          this.events = response.data.data || [];
          this.noEventsMessage = this.events.length ? '' : 'No events available.';
          this.checkPrompts();
        } else {
          this.error = response.data.message || 'No events found.';
        }
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to load events.';
      } finally {
        this.loading = false;
      }
    },
    async checkPrompts() {
      const authStore = useAuthStore();
      if (!authStore.studentEmail) return;
      try {
        const response = await axios.get('http://localhost:3000/student/attendance-by-email', {
          params: { email: authStore.studentEmail },
        });
        if (response.data.status === 'success') {
          const attendanceRecords = response.data.data || [];
          this.prompts = {};
          this.attendanceStatus = {};
          attendanceRecords.forEach(record => {
            if (record.attendance_status === 'pending') {
              this.prompts[record.event_id] = true;
            }
            this.attendanceStatus[record.event_id] = {
              status: record.attendance_status,
              end_time: record.end_time,
            };
          });
          this.$forceUpdate();
        }
      } catch (error) {
        console.error('Error checking prompts:', error);
      }
    },
    startPolling() {
      this.pollInterval = setInterval(() => {
        this.fetchUpcomingEvents();
      }, 5000); // 5 seconds for testing
    },
    async markAttendance(event, action) {
      const authStore = useAuthStore();
      if (!authStore.studentEmail) return;
      try {
        const { latitude, longitude } = await this.getLocation();
        const response = await axios.post('http://localhost:3000/student/attendance', {
          email: authStore.studentEmail,
          event_id: event.event_id,
          attendance_action: action,
          location_latitude: latitude.toString(),
          location_longitude: longitude.toString(),
        });
        if (response.data.status === 'success') {
          if (action === 'start') {
            this.prompts[event.event_id] = false;
            this.attendanceStatus[event.event_id] = { status: 'present', end_time: null };
            alert('Attendance marked successfully!');
          } else if (action === 'end') {
            this.attendanceStatus[event.event_id].end_time = response.data.data.end_time;
            alert('Attendance ended successfully!');
          }
          this.fetchUpcomingEvents();
        } else {
          this.error = response.data.message || `Failed to ${action} attendance.`;
        }
      } catch (error) {
        this.error = error.response?.data?.message || `Failed to ${action} attendance.`;
        console.error(`Error marking attendance (${action}):`, error);
      }
    },
    async getLocation() {
      return new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(pos => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }), reject));
    },
    formatDate(date) {
      return date ? new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';
    },
    isActive(event) {
      return (
        this.attendanceStatus[event.event_id]?.status === 'present' &&
        !this.attendanceStatus[event.event_id]?.end_time &&
        !event.is_completed
      );
    },
  },
};
</script>

<style scoped>
.events-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f4f4f9 0%, #e0e7ff 100%);
}

.events-content {
  max-width: 900px;
}

.events-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.event-item .card {
  transition: transform 0.2s ease;
}

.event-item .card:hover {
  transform: translateY(-5px);
}

.btn-primary {
  background-color: #4CAF50;
  border-color: #4CAF50;
}

.btn-warning {
  background-color: #FFC107;
  border-color: #FFC107;
}

.badge.bg-danger {
  font-size: 1rem;
}
</style>