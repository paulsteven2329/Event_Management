<template>
    <div class="dashboard min-vh-100 d-flex flex-column">
      <app-header title="Manage Volunteers" />
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
          <loading-spinner v-if="loading" message="Loading volunteers..." />
          <error-message v-else-if="errorMessage" :message="errorMessage" :retry="fetchData" />
          <div v-else class="dashboard-content">
            <div class="card shadow-sm">
              <div class="card-header"><h5>Volunteers</h5></div>
              <div class="card-body">
                <form @submit.prevent="createVolunteer" class="mb-4">
                  <div class="row">
                    <div class="col-md-2"><form-input v-model="newVolunteer.first_name" label="First Name" required /></div>
                    <div class="col-md-2"><form-input v-model="newVolunteer.last_name" label="Last Name" required /></div>
                    <div class="col-md-2"><form-input v-model="newVolunteer.email" label="Email" type="email" required /></div>
                    <div class="col-md-2"><form-input v-model="newVolunteer.password" label="Password" type="password" required /></div>
                    <div class="col-md-2"><form-input v-model="newVolunteer.phone_number" label="Phone" /></div>
                    <div class="col-md-2"><button type="submit" class="btn btn-primary w-100 mt-4">Create Volunteer</button></div>
                  </div>
                </form>
                <div class="mb-3">
                  <input v-model="volunteerSearch" class="form-control" placeholder="Search volunteers by name or email" @input="filterVolunteers" />
                </div>
                <div v-if="filteredVolunteers.length === 0" class="text-muted text-center py-3">No volunteers found.</div>
                <div v-else class="table-responsive">
                  <table class="table table-striped">
                    <thead>
                      <tr>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Registration Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="volunteer in filteredVolunteers" :key="volunteer.volunteer_id">
                        <td v-if="!volunteer.isEditing">{{ volunteer.first_name }}</td>
                        <td v-else><form-input v-model="volunteer.first_name" label="First Name" /></td>
                        <td v-if="!volunteer.isEditing">{{ volunteer.last_name }}</td>
                        <td v-else><form-input v-model="volunteer.last_name" label="Last Name" /></td>
                        <td v-if="!volunteer.isEditing">{{ volunteer.email }}</td>
                        <td v-else><form-input v-model="volunteer.email" label="Email" type="email" /></td>
                        <td v-if="!volunteer.isEditing">{{ volunteer.phone_number }}</td>
                        <td v-else><form-input v-model="volunteer.phone_number" label="Phone" /></td>
                        <td>{{ formatDate(volunteer.registration_date) }}</td>
                        <td>
                          <button v-if="!volunteer.isEditing" @click="toggleEdit(volunteer)" class="btn btn-sm btn-warning me-2">Edit</button>
                          <button v-else @click="updateVolunteer(volunteer)" class="btn btn-sm btn-success me-2">Save</button>
                          <button @click="deleteVolunteer(volunteer.volunteer_id)" class="btn btn-sm btn-danger">Delete</button>
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
    name: 'AdminVolunteers',
    components: { AppHeader, LoadingSpinner, ErrorMessage, FormInput },
    data() {
      return {
        volunteers: [],
        filteredVolunteers: [],
        newVolunteer: { first_name: '', last_name: '', email: '', password: '', phone_number: '' },
        volunteerSearch: '',
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
          const response = await axios.get(`${BASE_URL}/admin/volunteers`);
          this.volunteers = response.data.status === 'success' ? response.data.data.map(volunteer => ({ ...volunteer, isEditing: false })) : [];
          this.filteredVolunteers = [...this.volunteers];
          this.errorMessage = '';
        } catch (error) {
          this.errorMessage = error.response?.data?.message || 'Failed to load volunteers';
        } finally {
          this.loading = false;
        }
      },
      toggleEdit(volunteer) {
        volunteer.isEditing = !volunteer.isEditing;
      },
      async createVolunteer() {
        try {
          const response = await axios.post(`${BASE_URL}/admin/volunteers`, this.newVolunteer);
          if (response.data.status === 'success') {
            this.volunteers.push({ ...response.data.data, isEditing: false });
            this.filteredVolunteers = [...this.volunteers];
            this.resetNewVolunteer();
          }
        } catch (error) {
          this.errorMessage = error.response?.data?.message || 'Failed to create volunteer';
        }
      },
      async updateVolunteer(volunteer) {
        try {
          const updateData = {
            first_name: volunteer.first_name,
            last_name: volunteer.last_name,
            email: volunteer.email,
            password: volunteer.password || 'default', // Consider a better password update strategy
            phone_number: volunteer.phone_number,
          };
          const response = await axios.put(`${BASE_URL}/admin/volunteers/${volunteer.volunteer_id}`, updateData);
          if (response.data.status === 'success') {
            volunteer.isEditing = false;
            this.filterVolunteers();
          }
        } catch (error) {
          this.errorMessage = error.response?.data?.message || 'Failed to update volunteer';
        }
      },
      async deleteVolunteer(volunteerId) {
        try {
          const response = await axios.delete(`${BASE_URL}/admin/volunteers/${volunteerId}`);
          if (response.data.status === 'success') {
            this.volunteers = this.volunteers.filter(v => v.volunteer_id !== volunteerId);
            this.filteredVolunteers = this.filteredVolunteers.filter(v => v.volunteer_id !== volunteerId);
            alert('Volunteer deleted successfully!');
          }
        } catch (error) {
          this.errorMessage = error.response?.data?.message || 'Failed to delete volunteer';
        }
      },
      filterVolunteers() {
        const search = this.volunteerSearch.toLowerCase();
        this.filteredVolunteers = this.volunteers.filter(volunteer =>
          volunteer.first_name.toLowerCase().includes(search) ||
          volunteer.last_name.toLowerCase().includes(search) ||
          volunteer.email.toLowerCase().includes(search)
        );
      },
      formatDate(date) {
        return date ? new Date(date).toLocaleString() : 'N/A';
      },
      resetNewVolunteer() {
        this.newVolunteer = { first_name: '', last_name: '', email: '', password: '', phone_number: '' };
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