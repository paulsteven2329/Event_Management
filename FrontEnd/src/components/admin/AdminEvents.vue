<template>
    <div class="dashboard min-vh-100 d-flex flex-column">
      <app-header title="Manage Events" />
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
          <loading-spinner v-if="loading" message="Loading events..." />
          <error-message v-else-if="errorMessage" :message="errorMessage" :retry="fetchData" />
          <div v-else class="dashboard-content">
            <div class="card shadow-sm">
              <div class="card-header"><h5>Events</h5></div>
              <div class="card-body">
                <form @submit.prevent="createEvent" class="mb-4">
                  <div class="row g-3 align-items-end">
                    <div class="col-md-2"><form-input v-model="newEvent.event_name" label="Event Name" required /></div>
                    <div class="col-md-3"><form-input v-model="newEvent.event_description" label="Description" type="textarea" rows="1" /></div>
                    <div class="col-md-2"><form-input v-model="newEvent.event_date" label="Date" type="date" required /></div>
                    <div class="col-md-2"><form-input v-model="newEvent.event_time" label="Time" type="time" /></div>
                    <div class="col-md-2">
                      <label class="form-label">Volunteer</label>
                      <select v-model="newEvent.volunteer_id" class="form-select">
                        <option value="">Select</option>
                        <option v-for="volunteer in volunteers" :key="volunteer.volunteer_id" :value="volunteer.volunteer_id">
                          {{ volunteer.first_name + ' ' + volunteer.last_name }}
                        </option>
                      </select>
                    </div>
                    <div class="col-md-1"><button type="submit" class="btn btn-primary w-100">Create</button></div>
                  </div>
                </form>
                <div class="mb-3">
                  <input v-model="eventSearch" class="form-control" placeholder="Search events by name or description" @input="filterEvents" />
                </div>
                <div v-if="filteredEvents.length === 0" class="text-muted text-center py-3">No events found.</div>
                <div v-else class="table-responsive">
                  <table class="table table-striped">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Volunteer</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="event in filteredEvents" :key="event.event_id">
                        <td v-if="!event.isEditing">{{ event.event_name }}</td>
                        <td v-else><form-input v-model="event.event_name" label="Name" /></td>
                        <td v-if="!event.isEditing">{{ event.event_description }}</td>
                        <td v-else><form-input v-model="event.event_description" label="Description" type="textarea" rows="1" /></td>
                        <td v-if="!event.isEditing">{{ formatDate(event.event_date) }}</td>
                        <td v-else><form-input v-model="event.event_date" label="Date" type="date" /></td>
                        <td v-if="!event.isEditing">{{ event.event_time || 'N/A' }}</td>
                        <td v-else><form-input v-model="event.event_time" label="Time" type="time" /></td>
                        <td v-if="!event.isEditing">{{ getVolunteerName(event.volunteer_id) }}</td>
                        <td v-else>
                          <select v-model="event.volunteer_id" class="form-select">
                            <option value="">Select</option>
                            <option v-for="volunteer in volunteers" :key="volunteer.volunteer_id" :value="volunteer.volunteer_id">
                              {{ volunteer.first_name + ' ' + volunteer.last_name }}
                            </option>
                          </select>
                        </td>
                        <td>
                          <button v-if="!event.isEditing" @click="toggleEdit(event)" class="btn btn-sm btn-warning me-2">Edit</button>
                          <button v-else @click="updateEvent(event)" class="btn btn-sm btn-success me-2">Save</button>
                          <button @click="deleteEvent(event.event_id)" class="btn btn-sm btn-danger">Delete</button>
                        </td>
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
  import FormInput from '../common/FormInput.vue';
  
  const BASE_URL = 'http://localhost:3000';
  
  export default {
    name: 'AdminEvents',
    components: { AppHeader, LoadingSpinner, ErrorMessage, FormInput },
    data() {
      return {
        events: [],
        filteredEvents: [],
        volunteers: [],
        newEvent: { event_name: '', event_description: '', event_date: '', event_time: '', volunteer_id: '' },
        eventSearch: '',
        loading: true,
        errorMessage: '',
      };
    },
    async created() {
      await this.fetchData();
    },
    methods: {
      async fetchData() {
        this.loading = true;
        try {
          const [eventsRes, volunteersRes] = await Promise.all([
            axios.get(`${BASE_URL}/admin/events`),
            axios.get(`${BASE_URL}/admin/volunteers`),
          ]);
          this.events = eventsRes.data.status === 'success' ? eventsRes.data.data.map(event => ({
            ...event,
            event_date: this.normalizeDate(event.event_date),
            isEditing: false,
          })) : [];
          this.filteredEvents = [...this.events];
          this.volunteers = volunteersRes.data.status === 'success' ? volunteersRes.data.data : [];
          this.errorMessage = '';
        } catch (error) {
          this.errorMessage = error.response?.data?.message || 'Failed to load events';
        } finally {
          this.loading = false;
        }
      },
      toggleEdit(event) {
        event.isEditing = !event.isEditing;
      },
      async createEvent() {
        try {
          const response = await axios.post(`${BASE_URL}/admin/events`, {
            ...this.newEvent,
            event_date: this.normalizeDate(this.newEvent.event_date),
          });
          if (response.data.status === 'success') {
            this.events.push({ ...response.data.data, isEditing: false });
            this.filteredEvents = [...this.events];
            this.resetNewEvent();
          }
        } catch (error) {
          this.errorMessage = error.response?.data?.message || 'Failed to create event';
        }
      },
      async updateEvent(event) {
        try {
          const updateData = {
            event_name: event.event_name,
            event_description: event.event_description,
            event_date: this.normalizeDate(event.event_date),
            event_time: event.event_time,
            volunteer_id: event.volunteer_id || null,
          };
          const response = await axios.put(`${BASE_URL}/admin/events/${event.event_id}`, updateData);
          if (response.data.status === 'success') {
            event.event_date = this.normalizeDate(response.data.data.event_date);
            event.isEditing = false;
            this.filterEvents();
          }
        } catch (error) {
          this.errorMessage = error.response?.data?.message || 'Failed to update event';
        }
      },
      async deleteEvent(eventId) {
        try {
          const response = await axios.delete(`${BASE_URL}/admin/events/${eventId}`);
          if (response.data.status === 'success') {
            this.events = this.events.filter(e => e.event_id !== eventId);
            this.filteredEvents = this.filteredEvents.filter(e => e.event_id !== eventId);
            alert('Event deleted successfully!');
          }
        } catch (error) {
          this.errorMessage = error.response?.data?.message || 'Failed to delete event';
        }
      },
      filterEvents() {
        const search = this.eventSearch.toLowerCase();
        this.filteredEvents = this.events.filter(event =>
          event.event_name.toLowerCase().includes(search) ||
          (event.event_description && event.event_description.toLowerCase().includes(search))
        );
      },
      getVolunteerName(volunteerId) {
        const volunteer = this.volunteers.find(v => v.volunteer_id === volunteerId);
        return volunteer ? `${volunteer.first_name} ${volunteer.last_name}` : 'No Volunteer';
      },
      normalizeDate(date) {
        if (!date) return null;
        const d = new Date(date);
        return isNaN(d) ? null : d.toISOString().split('T')[0];
      },
      formatDate(date) {
        return date ? new Date(date).toLocaleDateString() : 'N/A';
      },
      resetNewEvent() {
        this.newEvent = { event_name: '', event_description: '', event_date: '', event_time: '', volunteer_id: '' };
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
  .table th, .table td {
    vertical-align: middle;
  }
  .form-select, .form-control {
    width: 100%;
  }
  .btn-primary {
    background-color: #007bff;
    border-color: #007bff;
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