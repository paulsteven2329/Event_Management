import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../store';

// General Components
import WelcomePage from '../components/WelcomePage.vue';

// Admin Components
import AdminDashboard from '../components/admin/AdminDashboard.vue';
import AdminStudents from '../components/admin/AdminStudents.vue';
import AdminVolunteers from '../components/admin/AdminVolunteers.vue';
import AdminEvents from '../components/admin/AdminEvents.vue';

// Student Components
import StudentLogin from '../components/students/Login.vue';
import StudentRegister from '../components/students/Register.vue';
import StudentDashboard from '../components/students/Dashboard.vue';
import StudentProfile from '../components/students/Profile.vue';
import StudentAttendance from '../components/students/Attendance.vue';
import StudentUpcomingEvents from '../components/students/UpcomingEvents.vue';
import StudentSettings from '../components/students/Student_Settings.vue';

// Volunteer Components
import VolunteerLogin from '../components/volunteer/volunteerLoginPage.vue';
import VolunteerRegister from '../components/volunteer/volunteerRegisterPage.vue';
import VolunteerDashboard from '../components/volunteer/VolunteerDashboard.vue';
import VolunteerProfile from '../components/volunteer/volunteerProfile.vue';
import VolunteerAttendance from '../components/volunteer/VolunteerAttendance.vue';
import VolunteerUpcomingEvents from '../components/volunteer/VolunteerUpcomingEvents.vue';
import VolunteerSettings from '../components/volunteer/VolunteerProfileUpdate.vue';

const routes = [
  { path: '/', name: 'Welcome', component: WelcomePage },
  { path: '/admin/dashboard', name: 'AdminDashboard', component: AdminDashboard },
  { path: '/admin/students', name: 'AdminStudents', component: AdminStudents },
  { path: '/admin/volunteers', name: 'AdminVolunteers', component: AdminVolunteers },
  { path: '/admin/events', name: 'AdminEvents', component: AdminEvents },

  // Student Routes
  { path: '/student/login', name: 'StudentLogin', component: StudentLogin },
  { path: '/student/register', name: 'StudentRegister', component: StudentRegister },
  {
    path: '/student/dashboard',
    name: 'StudentDashboard',
    component: StudentDashboard,
    meta: { requiresStudent: true },
    children: [
      { path: 'profile', name: 'StudentProfile', component: StudentProfile },
      { path: 'attendance', name: 'StudentAttendance', component: StudentAttendance },
      { path: 'upcoming-events', name: 'StudentUpcomingEvents', component: StudentUpcomingEvents },
      { path: 'settings', name: 'StudentSettings', component: StudentSettings },
    ],
  },

  // Volunteer Routes
  { path: '/volunteer/login', name: 'VolunteerLogin', component: VolunteerLogin },
  { path: '/volunteer/register', name: 'VolunteerRegister', component: VolunteerRegister },
  {
    path: '/volunteer/dashboard',
    name: 'VolunteerDashboard',
    component: VolunteerDashboard,
    meta: { requiresVolunteer: true },
    children: [
      { path: 'profile', name: 'VolunteerProfile', component: VolunteerProfile },
      { path: 'attendance', name: 'VolunteerAttendance', component: VolunteerAttendance },
      { path: 'upcoming-events', name: 'VolunteerUpcomingEvents', component: VolunteerUpcomingEvents },
      { path: 'settings', name: 'VolunteerSettings', component: VolunteerSettings },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const isStudentLoggedIn = !!authStore.studentEmail;
  const isVolunteerLoggedIn = !!authStore.volunteerEmail;

  if (to.meta.requiresStudent && !isStudentLoggedIn) {
    next('/student/login');
  } else if (to.meta.requiresVolunteer && !isVolunteerLoggedIn) {
    next('/volunteer/login');
  } else {
    next(); // No redirect for admin routes
  }
});

export default router;