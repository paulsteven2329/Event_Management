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
              <p class="card-text"><em>Date: {{ event.event_date }} | Time: {{ event.event_time || 'Not set' }}</em></p>
              <p v-if="attended[event.event_id]" class="card-text">Location: {{ formatLocation(event.location_latitude, event.location_longitude) }}</p>
              <div class="d-flex justify-content-between align-items-center mt-3">
                <div>
                  <button v-if="!timers[event.event_id]?.started && !event.is_completed" class="btn btn-primary" @click="startEvent(event)">Go</button>
                  <button v-else-if="timers[event.event_id]?.started && !timers[event.event_id]?.ended" class="btn btn-warning" disabled>In Progress</button>
                  <button v-if="timers[event.event_id]?.started && !timers[event.event_id]?.ended" class="btn btn-danger ms-2" @click="endEvent(event)">End</button>
                  <span v-if="event.is_completed" class="badge bg-success ms-2">Completed</span>
                </div>
                <span v-if="timers[event.event_id]?.started && !timers[event.event_id]?.ended" class="badge bg-info">Time Left: {{ timers[event.event_id].timeLeft }}</span>
              </div>
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
  name: 'VolunteerUpcomingEvents',
  components: { LoadingSpinner, ErrorMessage },
  data() {
    return {
      events: [],
      timers: {},
      attended: {},
      noEventsMessage: 'No upcoming events found.',
      loading: false,
      error: '',
    };
  },
  computed: {
    uniqueEvents() {
      return [...new Map(this.events.map(event => [event.event_id, event])).values()];
    },
  },
  created() {
    this.fetchUpcomingEvents();
  },
  beforeUnmount() {
    Object.values(this.timers).forEach(timer => clearInterval(timer.intervalId));
  },
  methods: {
    async fetchUpcomingEvents() {
      const authStore = useAuthStore();
      if (!authStore.volunteerEmail) {
        this.error = 'Please log in to view events.';
        this.$router.push('/volunteer/login');
        return;
      }
      this.loading = true;
      this.error = '';
      try {
        const response = await axios.get('http://localhost:3000/volunteer/upcoming-events', {
          params: { email: authStore.volunteerEmail },
        });
        if (response.data.status === 'success') {
          this.events = response.data.data || [];
          this.noEventsMessage = this.events.length ? '' : 'No events available.';
          this.initializeTimers();
        } else {
          this.error = response.data.message || 'No events found.';
        }
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to load events.';
      } finally {
        this.loading = false;
      }
    },
    initializeTimers() {
      this.events.forEach(event => {
        if (!this.timers[event.event_id] && !event.is_completed) {
          this.timers[event.event_id] = { started: false, ended: false, timeLeft: '01:00:00', intervalId: null, attendanceId: null };
        }
      });
    },
    async getLocation() {
      return new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(pos => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }), reject));
    },
    async startEvent(event) {
      const authStore = useAuthStore();
      if (!authStore.volunteerEmail || this.timers[event.event_id]?.started || event.is_completed) return;
      try {
        const { latitude, longitude } = await this.getLocation();
        const response = await axios.post('http://localhost:3000/volunteer/attendance', {
          email: authStore.volunteerEmail,
          event_id: event.event_id,
          attendance_action: 'start',
          location_latitude: latitude,
          location_longitude: longitude,
        });
        if (response.data.status === 'success') {
          this.timers[event.event_id].started = true;
          this.timers[event.event_id].attendanceId = response.data.data.attendance_id;
          this.startTimer(event.event_id, new Date(response.data.data.start_time));
          event.location_latitude = latitude;
          event.location_longitude = longitude;
          event.is_started = true; // Reflect the start locally
        }
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to start event.';
      }
    },
    startTimer(eventId, startTime) {
      const timer = this.timers[eventId];
      const endTime = startTime.getTime() + 60 * 60 * 1000; // 1 hour default
      timer.intervalId = setInterval(() => {
        const timeLeftMs = endTime - Date.now();
        if (timeLeftMs <= 0) this.endEvent({ event_id: eventId }, true);
        else {
          const h = Math.floor(timeLeftMs / 3600000);
          const m = Math.floor((timeLeftMs % 3600000) / 60000);
          const s = Math.floor((timeLeftMs % 60000) / 1000);
          timer.timeLeft = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }
      }, 1000);
    },
    async endEvent(event, auto = false) {
      const authStore = useAuthStore();
      if (!authStore.volunteerEmail) return;
      const timer = this.timers[event.event_id];
      if (!timer?.started || timer.ended) return;
      timer.ended = true;
      clearInterval(timer.intervalId);
      try {
        const { latitude, longitude } = await this.getLocation();
        const response = await axios.post('http://localhost:3000/volunteer/attendance', {
          email: authStore.volunteerEmail,
          event_id: event.event_id,
          attendance_action: 'end',
          location_latitude: latitude,
          location_longitude: longitude,
        });
        if (response.data.status === 'success') {
          this.attended[event.event_id] = { status: 'completed', location_latitude: latitude, location_longitude: longitude };
          event.location_latitude = latitude;
          event.location_longitude = longitude;
          event.is_completed = true;
          delete this.timers[event.event_id];
          await this.fetchUpcomingEvents();
          if (!auto) alert(`Attendance: Ended (${response.data.data.duration_minutes.toFixed(2)} mins)`);
        }
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to end event.';
      }
    },
    formatLocation(lat, lon) {
      return (lat && lon && !isNaN(lat) && !isNaN(lon)) ? `(${Number(lat).toFixed(4)}, ${Number(lon).toFixed(4)})` : 'Not set';
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
</style>