<template>
    <div class="dashboard min-vh-100 d-flex flex-column">
      <app-header title="Manage Students" />
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
          <loading-spinner v-if="loading" message="Loading students..." />
          <error-message v-else-if="errorMessage" :message="errorMessage" :retry="fetchData" />
          <div v-else class="dashboard-content">
            <div class="card shadow-sm">
              <div class="card-header"><h5>Students</h5></div>
              <div class="card-body">
                <form @submit.prevent="createStudent" class="mb-4">
                  <div class="row">
                    <div class="col-md-2"><form-input v-model="newStudent.first_name" label="First Name" required /></div>
                    <div class="col-md-2"><form-input v-model="newStudent.last_name" label="Last Name" required /></div>
                    <div class="col-md-2"><form-input v-model="newStudent.email" label="Email" type="email" required /></div>
                    <div class="col-md-2"><form-input v-model="newStudent.password" label="Password" type="password" required /></div>
                    <div class="col-md-2"><form-input v-model="newStudent.phone_number" label="Phone" /></div>
                    <div class="col-md-2">
                      <label class="form-label">Preferred Volunteer</label>
                      <select v-model="newStudent.volunteer_id" class="form-select">
                        <option value="">Select Volunteer</option>
                        <option v-for="volunteer in volunteers" :key="volunteer.volunteer_id" :value="volunteer.volunteer_id">
                          {{ volunteer.first_name }} {{ volunteer.last_name }}
                        </option>
                      </select>
                    </div>
                    <div class="col-md-2"><button type="submit" class="btn btn-primary w-100 mt-4">Create Student</button></div>
                  </div>
                </form>
                <div class="mb-3">
                  <input v-model="studentSearch" class="form-control" placeholder="Search students by name or email" @input="filterStudents" />
                </div>
                <div v-if="filteredStudents.length === 0" class="text-muted text-center py-3">No students found.</div>
                <div v-else class="table-responsive">
                  <table class="table table-striped">
                    <thead>
                      <tr>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Volunteer</th>
                        <th>Registration Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="student in filteredStudents" :key="student.student_id">
                        <td v-if="!student.isEditing">{{ student.first_name }}</td>
                        <td v-else><form-input v-model="student.first_name" label="First Name" /></td>
                        <td v-if="!student.isEditing">{{ student.last_name }}</td>
                        <td v-else><form-input v-model="student.last_name" label="Last Name" /></td>
                        <td v-if="!student.isEditing">{{ student.email }}</td>
                        <td v-else><form-input v-model="student.email" label="Email" type="email" /></td>
                        <td v-if="!student.isEditing">{{ student.phone_number }}</td>
                        <td v-else><form-input v-model="student.phone_number" label="Phone" /></td>
                        <td v-if="!student.isEditing">{{ getVolunteerName(student.volunteer_id) }}</td>
                        <td v-else>
                          <select v-model="student.volunteer_id" class="form-select">
                            <option value="">Select Volunteer</option>
                            <option v-for="volunteer in volunteers" :key="volunteer.volunteer_id" :value="volunteer.volunteer_id">
                              {{ volunteer.first_name }} {{ volunteer.last_name }}
                            </option>
                          </select>
                        </td>
                        <td>{{ formatDate(student.registration_date) }}</td>
                        <td>
                          <button v-if="!student.isEditing" @click="toggleEdit(student)" class="btn btn-sm btn-warning me-2">Edit</button>
                          <button v-else @click="updateStudent(student)" class="btn btn-sm btn-success me-2">Save</button>
                          <button @click="deleteStudent(student.student_id)" class="btn btn-sm btn-danger">Delete</button>
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
    name: 'AdminStudents',
    components: { AppHeader, LoadingSpinner, ErrorMessage, FormInput },
    data() {
      return {
        students: [],
        filteredStudents: [],
        volunteers: [],
        newStudent: { first_name: '', last_name: '', email: '', password: '', phone_number: '', volunteer_id: '' },
        studentSearch: '',
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
          const [studentsRes, volunteersRes] = await Promise.all([
            axios.get(`${BASE_URL}/admin/students`),
            axios.get(`${BASE_URL}/admin/volunteers`),
          ]);
          this.students = studentsRes.data.status === 'success' ? studentsRes.data.data.map(student => ({ ...student, isEditing: false })) : [];
          this.filteredStudents = [...this.students];
          this.volunteers = volunteersRes.data.status === 'success' ? volunteersRes.data.data : [];
          this.errorMessage = '';
        } catch (error) {
          this.errorMessage = error.response?.data?.message || 'Failed to load students';
        } finally {
          this.loading = false;
        }
      },
      toggleEdit(student) {
        student.isEditing = !student.isEditing;
      },
      async createStudent() {
        console.log('Creating student with data:', this.newStudent); // Debug log
        try {
          const response = await axios.post(`${BASE_URL}/admin/students`, {
            first_name: this.newStudent.first_name,
            last_name: this.newStudent.last_name,
            email: this.newStudent.email,
            password: this.newStudent.password,
            phone_number: this.newStudent.phone_number || null,
            volunteer_id: this.newStudent.volunteer_id ? Number(this.newStudent.volunteer_id) : null, // Ensure numeric or null
          });
          if (response.data.status === 'success') {
            this.students.push({ ...response.data.data, isEditing: false });
            this.filteredStudents = [...this.students];
            this.resetNewStudent();
          }
        } catch (error) {
          this.errorMessage = error.response?.data?.message || 'Failed to create student';
          console.error('Create student error:', error.response || error);
        }
      },
      async updateStudent(student) {
        try {
          const updateData = {
            first_name: student.first_name,
            last_name: student.last_name,
            email: student.email,
            password: student.password || 'default',
            phone_number: student.phone_number || null,
            volunteer_id: student.volunteer_id ? Number(student.volunteer_id) : null, // Ensure numeric or null
          };
          const response = await axios.put(`${BASE_URL}/admin/students/${student.student_id}`, updateData);
          if (response.data.status === 'success') {
            student.isEditing = false;
            this.filterStudents();
          }
        } catch (error) {
          this.errorMessage = error.response?.data?.message || 'Failed to update student';
        }
      },
      async deleteStudent(studentId) {
        try {
          const response = await axios.delete(`${BASE_URL}/admin/students/${studentId}`);
          if (response.data.status === 'success') {
            this.students = this.students.filter(s => s.student_id !== studentId);
            this.filteredStudents = this.filteredStudents.filter(s => s.student_id !== studentId);
            alert('Student deleted successfully!');
          }
        } catch (error) {
          this.errorMessage = error.response?.data?.message || 'Failed to delete student';
        }
      },
      filterStudents() {
        const search = this.studentSearch.toLowerCase();
        this.filteredStudents = this.students.filter(student =>
          student.first_name.toLowerCase().includes(search) ||
          student.last_name.toLowerCase().includes(search) ||
          student.email.toLowerCase().includes(search)
        );
      },
      getVolunteerName(volunteerId) {
        const volunteer = this.volunteers.find(v => v.volunteer_id === volunteerId);
        return volunteer ? `${volunteer.first_name} ${volunteer.last_name}` : 'No Volunteer';
      },
      formatDate(date) {
        return date ? new Date(date).toLocaleString() : 'N/A';
      },
      resetNewStudent() {
        this.newStudent = { first_name: '', last_name: '', email: '', password: '', phone_number: '', volunteer_id: '' };
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