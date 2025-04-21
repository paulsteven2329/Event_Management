const express = require('express');
const moment = require('moment');
const cors = require('cors');
const session = require('express-session');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = 3000;

// Middleware
app.use(cors({
  origin: 'http://localhost:8080',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }, // 24 hours
}));

// MySQL Connection Pool
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Test Database Connection
(async () => {
  try {
    const connection = await db.getConnection();
    console.log('Connected to MySQL');
    connection.release();
  } catch (err) {
    console.error('Database connection failed:', err);
  }
})();

// Utility Function for Response
const sendResponse = (res, statusCode, message, data = null) => {
  res.status(statusCode).json(data ? { status: statusCode < 400 ? 'success' : 'error', message, data } : { status: statusCode < 400 ? 'success' : 'error', message });
};

// Utility Function for Distance Calculation
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in meters
}

// Authentication Middleware
const isAuthenticated = (role) => (req, res, next) => {
  const sessionKey = `${role}_id`;
  if (!req.session[sessionKey]) {
    return sendResponse(res, 401, `Unauthorized access. Please login as ${role} first!`);
  }
  req[role] = { id: req.session[sessionKey] };
  next();
};

// ================== ADMIN ROUTES ==================
// Events
// Events
app.get('/admin/events', async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM events ORDER BY event_date ASC');
    sendResponse(res, 200, 'Events retrieved', results);
  } catch (err) {
    console.error('Error fetching admin events:', err);
    sendResponse(res, 500, 'Database error');
  }
});

app.post('/admin/events', async (req, res) => {
  const { event_name, event_description, event_date, event_time, volunteer_id } = req.body;
  if (!event_name || !event_date) return sendResponse(res, 400, 'Event name and date are required');
  try {
    const [result] = await db.query(
      'INSERT INTO events (event_name, event_description, event_date, event_time, volunteer_id, is_started, is_completed) VALUES (?, ?, ?, ?, ?, 0, 0)',
      [event_name, event_description || null, event_date, event_time || null, volunteer_id || null]
    );
    sendResponse(res, 201, 'Event created', {
      event_id: result.insertId,
      event_name,
      event_description,
      event_date,
      event_time,
      volunteer_id,
      is_started: 0,
      is_completed: 0,
    });
  } catch (err) {
    console.error('Error creating event:', err);
    sendResponse(res, 500, 'Database error');
  }
});

app.put('/admin/events/:id', async (req, res) => {
  const eventId = req.params.id;
  const { event_name, event_description, event_date, event_time, volunteer_id } = req.body;
  if (!event_name || !event_date) return sendResponse(res, 400, 'Event name and date are required');
  try {
    const [result] = await db.query(
      'UPDATE events SET event_name = ?, event_description = ?, event_date = ?, event_time = ?, volunteer_id = ? WHERE event_id = ?',
      [event_name, event_description || null, event_date, event_time || null, volunteer_id || null, eventId]
    );
    if (result.affectedRows === 0) return sendResponse(res, 404, 'Event not found');
    sendResponse(res, 200, 'Event updated', { event_id: eventId, event_name, event_description, event_date, event_time, volunteer_id });
  } catch (err) {
    console.error('Error updating event:', err);
    sendResponse(res, 500, 'Database error');
  }
});

app.delete('/admin/events/:id', async (req, res) => {
  const eventId = req.params.id;
  try {
    await db.query('DELETE FROM attendance WHERE event_id = ?', [eventId]);
    await db.query('DELETE FROM volunteerAttendance WHERE event_id = ?', [eventId]);
    const [result] = await db.query('DELETE FROM events WHERE event_id = ?', [eventId]);
    if (result.affectedRows === 0) return sendResponse(res, 404, 'Event not found');
    sendResponse(res, 200, 'Event deleted');
  } catch (err) {
    console.error('Error deleting event:', err);
    sendResponse(res, 500, 'Database error');
  }
});

// Students
app.get('/admin/students', async (req, res) => {
  try {
    const [results] = await db.query('SELECT student_id, first_name, last_name, email, phone_number, registration_date FROM students');
    sendResponse(res, 200, 'Students retrieved', results);
  } catch (err) {
    console.error('Error fetching students:', err);
    sendResponse(res, 500, 'Database error');
  }
});

// Students
app.post('/admin/students', async (req, res) => {
  const { first_name, last_name, email, password, phone_number, volunteer_id } = req.body;
  console.log('Received student data:', req.body); // Debug log
  if (!first_name || !last_name || !email || !password) return sendResponse(res, 400, 'First name, last name, email, and password are required');
  try {
    const [result] = await db.query(
      'INSERT INTO students (first_name, last_name, email, password, phone_number, volunteer_id, registration_date) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [first_name, last_name, email, password, phone_number || null, volunteer_id || null]
    );
    sendResponse(res, 201, 'Student created', {
      student_id: result.insertId,
      first_name,
      last_name,
      email,
      phone_number,
      volunteer_id,
      registration_date: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Error creating student:', err);
    sendResponse(res, 500, 'Database error');
  }
});

app.put('/admin/students/:id', async (req, res) => {
  const studentId = req.params.id;
  const { first_name, last_name, email, password, phone_number } = req.body;
  if (!first_name || !last_name || !email || !password) return sendResponse(res, 400, 'First name, last_name, email, and password are required');
  try {
    const [result] = await db.query(
      'UPDATE students SET first_name = ?, last_name = ?, email = ?, password = ?, phone_number = ? WHERE student_id = ?',
      [first_name, last_name, email, password, phone_number || null, studentId]
    );
    if (result.affectedRows === 0) return sendResponse(res, 404, 'Student not found');
    sendResponse(res, 200, 'Student updated', { student_id: studentId, first_name, last_name, email, phone_number });
  } catch (err) {
    console.error('Error updating student:', err);
    sendResponse(res, 500, 'Database error');
  }
});

app.delete('/admin/students/:id', async (req, res) => {
  const studentId = req.params.id;
  try {
    await db.query('DELETE FROM attendance WHERE student_id = ?', [studentId]); // Remove related attendance records
    const [result] = await db.query('DELETE FROM students WHERE student_id = ?', [studentId]);
    if (result.affectedRows === 0) return sendResponse(res, 404, 'Student not found');
    sendResponse(res, 200, 'Student deleted');
  } catch (err) {
    console.error('Error deleting student:', err);
    sendResponse(res, 500, 'Database error');
  }
});

// Volunteers
app.get('/admin/volunteers', async (req, res) => {
  try {
    const [results] = await db.query('SELECT volunteer_id, first_name, last_name, email, phone_number, registration_date FROM volunteers');
    sendResponse(res, 200, 'Volunteers retrieved', results);
  } catch (err) {
    console.error('Error fetching volunteers:', err);
    sendResponse(res, 500, 'Database error');
  }
});

// Volunteers
app.post('/admin/volunteers', async (req, res) => {
  const { first_name, last_name, email, password, phone_number } = req.body;
  if (!first_name || !last_name || !email || !password) return sendResponse(res, 400, 'First name, last_name, email, and password are required');
  try {
    const [result] = await db.query(
      'INSERT INTO volunteers (first_name, last_name, email, password, phone_number, registration_date) VALUES (?, ?, ?, ?, ?, NOW())',
      [first_name, last_name, email, password, phone_number || null]
    );
    sendResponse(res, 201, 'Volunteer created', {
      volunteer_id: result.insertId,
      first_name,
      last_name,
      email,
      phone_number,
      registration_date: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Error creating volunteer:', err);
    sendResponse(res, 500, 'Database error');
  }
});

app.put('/admin/volunteers/:id', async (req, res) => {
  const volunteerId = req.params.id;
  const { first_name, last_name, email, password, phone_number } = req.body;
  if (!first_name || !last_name || !email || !password) return sendResponse(res, 400, 'First name, last_name, email, and password are required');
  try {
    const [result] = await db.query(
      'UPDATE volunteers SET first_name = ?, last_name = ?, email = ?, password = ?, phone_number = ? WHERE volunteer_id = ?',
      [first_name, last_name, email, password, phone_number || null, volunteerId]
    );
    if (result.affectedRows === 0) return sendResponse(res, 404, 'Volunteer not found');
    sendResponse(res, 200, 'Volunteer updated', { volunteer_id: volunteerId, first_name, last_name, email, phone_number });
  } catch (err) {
    console.error('Error updating volunteer:', err);
    sendResponse(res, 500, 'Database error');
  }
});
app.delete('/admin/volunteers/:id', async (req, res) => {
  const volunteerId = req.params.id;
  try {
    await db.query('DELETE FROM volunteerAttendance WHERE volunteer_id = ?', [volunteerId]); // Remove related attendance
    await db.query('UPDATE events SET volunteer_id = NULL WHERE volunteer_id = ?', [volunteerId]); // Clear volunteer assignments
    const [result] = await db.query('DELETE FROM volunteers WHERE volunteer_id = ?', [volunteerId]);
    if (result.affectedRows === 0) return sendResponse(res, 404, 'Volunteer not found');
    sendResponse(res, 200, 'Volunteer deleted');
  } catch (err) {
    console.error('Error deleting volunteer:', err);
    sendResponse(res, 500, 'Database error');
  }
});

// Attendance (unchanged)
app.get('/admin/student-attendance', async (req, res) => {
  try {
    const [results] = await db.query(
      'SELECT a.attendance_id, a.student_id, a.event_id, a.attendance_status, a.start_time, a.end_time, s.email, e.event_name ' +
      'FROM attendance a JOIN students s ON a.student_id = s.student_id JOIN events e ON a.event_id = e.event_id'
    );
    sendResponse(res, 200, 'Student attendance retrieved', results);
  } catch (err) {
    console.error('Error fetching student attendance:', err);
    sendResponse(res, 500, 'Database error');
  }
});

app.post('/admin/student-attendance', async (req, res) => {
  const { email, event_id } = req.body;
  try {
    const [student] = await db.query('SELECT student_id FROM students WHERE email = ?', [email]);
    if (!student.length) return sendResponse(res, 404, 'Student not found');
    const student_id = student[0].student_id;
    await db.query(
      'INSERT INTO attendance (student_id, event_id, attendance_status, start_time) VALUES (?, ?, ?, ?)',
      [student_id, event_id, 'present', new Date().toISOString()]
    );
    sendResponse(res, 200, 'Attendance recorded');
  } catch (err) {
    console.error('Error recording student attendance:', err);
    sendResponse(res, 500, 'Database error');
  }
});

app.get('/admin/volunteer-attendance', async (req, res) => {
  try {
    const [results] = await db.query(
      'SELECT va.volunteer_attendance_id, va.volunteer_id, va.event_id, va.start_time, va.end_time, v.email, e.event_name ' +
      'FROM volunteerAttendance va JOIN volunteers v ON va.volunteer_id = v.volunteer_id JOIN events e ON va.event_id = e.event_id'
    );
    sendResponse(res, 200, 'Volunteer attendance retrieved', results);
  } catch (err) {
    console.error('Error fetching volunteer attendance:', err);
    sendResponse(res, 500, 'Database error');
  }
});

app.post('/admin/volunteer-attendance', async (req, res) => {
  const { email, event_id, start_time, end_time, location_latitude, location_longitude } = req.body;
  try {
    const [volunteer] = await db.query('SELECT volunteer_id FROM volunteers WHERE email = ?', [email]);
    if (!volunteer.length) return sendResponse(res, 404, 'Volunteer not found');
    const volunteer_id = volunteer[0].volunteer_id;
    if (start_time) {
      await db.query(
        'INSERT INTO volunteerAttendance (volunteer_id, event_id, start_time, location_latitude, location_longitude) VALUES (?, ?, ?, ?, ?)',
        [volunteer_id, event_id, start_time, location_latitude, location_longitude]
      );
    } else if (end_time) {
      await db.query(
        'UPDATE volunteerAttendance SET end_time = ?, location_latitude = ?, location_longitude = ? WHERE volunteer_id = ? AND event_id = ? AND end_time IS NULL',
        [end_time, location_latitude, location_longitude, volunteer_id, event_id]
      );
    }
    sendResponse(res, 200, 'Attendance updated');
  } catch (err) {
    console.error('Error recording volunteer attendance:', err);
    sendResponse(res, 500, 'Database error');
  }
});
// ================== VOLUNTEER ROUTES ==================
// ================== VOLUNTEER ROUTES ==================

app.post('/volunteer/register', async (req, res) => {
  const { first_name, last_name, email, password, phone_number } = req.body;
  if (!first_name || !last_name || !email || !password) return sendResponse(res, 400, 'First name, last name, email, and password are required');

  try {
    const [existing] = await db.query('SELECT email FROM volunteers WHERE email = ?', [email]);
    if (existing.length > 0) return sendResponse(res, 400, 'Email already exists');

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO volunteers (first_name, last_name, email, password, phone_number, registration_date) VALUES (?, ?, ?, ?, ?, NOW())',
      [first_name, last_name, email, hashedPassword, phone_number || null]
    );
    sendResponse(res, 201, 'Volunteer registered', { volunteer_id: result.insertId });
  } catch (err) {
    console.error('Error registering volunteer:', err);
    sendResponse(res, 500, 'Database error');
  }
});

app.post('/volunteer/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return sendResponse(res, 400, 'Email and password are required');

  try {
    const [results] = await db.query('SELECT volunteer_id, password FROM volunteers WHERE email = ?', [email]);
    if (results.length === 0) return sendResponse(res, 401, 'Invalid credentials');

    const volunteer = results[0];
    const isMatch = await bcrypt.compare(password, volunteer.password);
    if (!isMatch) return sendResponse(res, 401, 'Invalid credentials');

    sendResponse(res, 200, 'Login successful', { volunteer_id: volunteer.volunteer_id, email });
  } catch (err) {
    console.error('Error logging in volunteer:', err);
    sendResponse(res, 500, 'Database error');
  }
});

app.post('/volunteer/profile', async (req, res) => {
  const { email } = req.body;
  if (!email) return sendResponse(res, 400, 'Email is required');

  try {
    const [results] = await db.query(
      'SELECT volunteer_id, first_name, last_name, email, phone_number, registration_date FROM volunteers WHERE email = ?',
      [email]
    );
    if (results.length === 0) return sendResponse(res, 404, 'Profile not found');
    sendResponse(res, 200, 'Profile retrieved', results[0]);
  } catch (err) {
    console.error('Error fetching volunteer profile:', err);
    sendResponse(res, 500, 'Database error');
  }
});

app.put('/volunteer/update-profile', async (req, res) => {
  const { email, first_name, last_name, phone_number, current_password, password } = req.body;
  if (!email) return sendResponse(res, 400, 'Email is required');
  if (!first_name && !last_name && !phone_number && !password) return sendResponse(res, 400, 'At least one field must be provided');

  try {
    const [volunteer] = await db.query('SELECT password FROM volunteers WHERE email = ?', [email]);
    if (volunteer.length === 0) return sendResponse(res, 404, 'Volunteer not found');

    let hashedPassword = null;
    if (password) {
      if (!current_password) return sendResponse(res, 400, 'Current password is required to update password');
      const isMatch = await bcrypt.compare(current_password, volunteer[0].password);
      if (!isMatch) return sendResponse(res, 401, 'Current password incorrect');
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const updates = [];
    const params = [];
    if (first_name) { updates.push('first_name = ?'); params.push(first_name); }
    if (last_name !== undefined) { updates.push('last_name = ?'); params.push(last_name); }
    if (phone_number !== undefined) { updates.push('phone_number = ?'); params.push(phone_number); }
    if (hashedPassword) { updates.push('password = ?'); params.push(hashedPassword); }
    params.push(email);

    if (updates.length === 0) return sendResponse(res, 400, 'No valid fields to update');

    const [result] = await db.query(`UPDATE volunteers SET ${updates.join(', ')} WHERE email = ?`, params);
    if (result.affectedRows === 0) return sendResponse(res, 404, 'Volunteer not found');
    sendResponse(res, 200, 'Profile updated');
  } catch (err) {
    console.error('Error updating volunteer profile:', err);
    sendResponse(res, 500, 'Database error');
  }
});

app.get('/volunteer/upcoming-events', async (req, res) => {
  const { email } = req.query;
  if (!email) return sendResponse(res, 400, 'Email is required');

  try {
    const [volunteer] = await db.query('SELECT volunteer_id FROM volunteers WHERE email = ?', [email]);
    if (volunteer.length === 0) return sendResponse(res, 404, 'Volunteer not found');

    const [results] = await db.query(
      'SELECT event_id, event_name, event_description, event_date, event_time, is_started, is_completed ' +
      'FROM events WHERE volunteer_id = ? AND event_date >= CURDATE() ORDER BY event_date ASC',
      [volunteer[0].volunteer_id]
    );
    sendResponse(res, 200, 'Upcoming events retrieved', results);
  } catch (err) {
    console.error('Error fetching upcoming events:', err);
    sendResponse(res, 500, 'Database error');
  }
});

app.post('/volunteer/attendance', async (req, res) => {
  const { email, event_id, attendance_action, location_latitude, location_longitude } = req.body;
  if (!email || !event_id || !attendance_action || !location_latitude || !location_longitude) {
    return sendResponse(res, 400, 'Email, event_id, attendance_action, latitude, and longitude are required');
  }

  try {
    const [volunteer] = await db.query('SELECT volunteer_id FROM volunteers WHERE email = ?', [email]);
    if (volunteer.length === 0) return sendResponse(res, 404, 'Volunteer not found');
    const volunteer_id = volunteer[0].volunteer_id;

    const [event] = await db.query('SELECT volunteer_id, is_started, is_completed FROM events WHERE event_id = ?', [event_id]);
    if (event.length === 0 || event[0].volunteer_id !== volunteer_id) {
      return sendResponse(res, 404, 'Event not found or not assigned to you');
    }

    if (event[0].is_completed) {
      return sendResponse(res, 400, 'Event is already completed and cannot be modified');
    }

    if (attendance_action === 'start') {
      if (event[0].is_started) return sendResponse(res, 400, 'Event already started');
      await db.query('UPDATE events SET is_started = 1 WHERE event_id = ?', [event_id]);
      const [result] = await db.query(
        'INSERT INTO volunteerAttendance (volunteer_id, event_id, location_latitude, location_longitude, attendance_date, start_time) ' +
        'VALUES (?, ?, ?, ?, CURDATE(), NOW())',
        [volunteer_id, event_id, location_latitude, location_longitude]
      );

      await db.query(
        'INSERT INTO attendance (student_id, event_id, volunteer_id, attendance_status, location_latitude, location_longitude, date, start_time) ' +
        'SELECT s.student_id, ?, ?, "pending", ?, ?, CURDATE(), NOW() ' +
        'FROM students s ' +
        'WHERE s.volunteer_id = ? AND NOT EXISTS (SELECT 1 FROM attendance a WHERE a.student_id = s.student_id AND a.event_id = ?)',
        [event_id, volunteer_id, location_latitude, location_longitude, volunteer_id, event_id]
      );

      sendResponse(res, 200, 'Event started', { attendance_id: result.insertId, start_time: new Date().toISOString() });
    } else if (attendance_action === 'end') {
      if (!event[0].is_started) return sendResponse(res, 400, 'Event not started yet');

      const [volunteerAttendance] = await db.query(
        'SELECT start_time FROM volunteerAttendance WHERE event_id = ? AND volunteer_id = ? AND end_time IS NULL',
        [event_id, volunteer_id]
      );
      if (volunteerAttendance.length === 0) return sendResponse(res, 404, 'Active attendance not found');

      const duration_minutes = (new Date() - new Date(volunteerAttendance[0].start_time)) / (1000 * 60);
      const endTime = new Date().toISOString();

      // Update volunteer attendance
      await db.query(
        'UPDATE volunteerAttendance SET end_time = NOW(), location_latitude = ?, location_longitude = ? ' +
        'WHERE event_id = ? AND volunteer_id = ? AND end_time IS NULL',
        [location_latitude, location_longitude, event_id, volunteer_id]
      );

      // Mark pending students as absent
      await db.query(
        'UPDATE attendance SET attendance_status = "absent" ' +
        'WHERE event_id = ? AND attendance_status = "pending"',
        [event_id]
      );

      // Mark event as completed
      await db.query('UPDATE events SET is_completed = 1 WHERE event_id = ?', [event_id]);

      sendResponse(res, 200, 'Event ended and completed', { duration_minutes, end_time: endTime });
    } else {
      sendResponse(res, 400, 'Invalid attendance_action');
    }
  } catch (err) {
    console.error('Error recording volunteer attendance:', err);
    sendResponse(res, 500, 'Database error');
  }
});

app.get('/volunteer/attendance', async (req, res) => {
  const { email } = req.query;
  if (!email) return sendResponse(res, 400, 'Email is required');

  try {
    const [volunteer] = await db.query('SELECT volunteer_id FROM volunteers WHERE email = ?', [email]);
    if (volunteer.length === 0) return sendResponse(res, 404, 'Volunteer not found');
    const volunteer_id = volunteer[0].volunteer_id;

    const [volunteerAttendance] = await db.query(
      'SELECT va.volunteer_attendance_id, va.attendance_date, va.location_latitude, va.location_longitude, va.start_time, va.end_time, e.event_name ' +
      'FROM volunteerAttendance va LEFT JOIN events e ON va.event_id = e.event_id WHERE va.volunteer_id = ?',
      [volunteer_id]
    );

    // Fetch student attendance records for this volunteer (using students.volunteer_id)
    const [studentAttendance] = await db.query(
      'SELECT a.attendance_id, s.first_name, s.last_name, s.email AS student_email, e.event_name, a.attendance_status, a.date AS attendance_date, ' +
      'a.location_latitude, a.location_longitude, a.start_time, a.end_time ' +
      'FROM attendance a ' +
      'JOIN students s ON a.student_id = s.student_id ' +
      'LEFT JOIN events e ON a.event_id = e.event_id ' +
      'WHERE s.volunteer_id = ?',
      [volunteer_id]
    );

    sendResponse(res, 200, 'Attendance retrieved', {
      volunteer_attendance: volunteerAttendance,
      student_attendance: studentAttendance,
    });
  } catch (err) {
    console.error('Error fetching volunteer attendance:', err);
    sendResponse(res, 500, 'Database error');
  }
});
// ================== STUDENT ROUTES ==================
// Student Routes
app.post('/student/register', async (req, res) => {
  const { first_name, last_name, email, password, phone_number, volunteer_id } = req.body;
  if (!first_name || !email || !password) return sendResponse(res, 400, 'First name, email, and password are required');

  try {
    const [existing] = await db.query('SELECT email FROM students WHERE email = ?', [email]);
    if (existing.length > 0) return sendResponse(res, 400, 'Email already registered');

    if (volunteer_id) {
      const [volunteer] = await db.query('SELECT volunteer_id FROM volunteers WHERE volunteer_id = ?', [volunteer_id]);
      if (volunteer.length === 0) return sendResponse(res, 400, 'Invalid volunteer_id');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO students (first_name, last_name, email, password, phone_number, volunteer_id, registration_date) ' +
      'VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [first_name, last_name || null, email, hashedPassword, phone_number || null, volunteer_id || null]
    );
    sendResponse(res, 201, 'Registration successful', { scholar_id: result.insertId });
  } catch (err) {
    console.error('Error registering student:', err);
    sendResponse(res, 500, 'Database error');
  }
});

app.post('/student/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('Login request received:', { email, password });
  if (!email || !password) return sendResponse(res, 400, 'Email and password are required');

  try {
    console.log('Querying database for email:', email);
    const [rows] = await db.query('SELECT * FROM students WHERE email = ?', [email]);
    console.log('Query result:', rows);
    if (rows.length === 0) return sendResponse(res, 401, 'Invalid email or password');

    const student = rows[0];
    console.log('Student found:', { student_id: student.student_id, email: student.email });

    console.log('Comparing passwords...');
    const isMatch = await bcrypt.compare(password, student.password);
    console.log('Password match:', isMatch);
    if (!isMatch) return sendResponse(res, 401, 'Invalid email or password');

    sendResponse(res, 200, 'Login successful', { student_id: student.student_id, email: student.email });
  } catch (err) {
    console.error('Login error:', err.stack);
    sendResponse(res, 500, `Database error: ${err.message}`);
  }
});

app.get('/student/email-check', async (req, res) => {
  const { email } = req.query;
  if (!email) return sendResponse(res, 400, 'Email is required');
  try {
    const [rows] = await db.query('SELECT email FROM students WHERE email = ?', [email]);
    sendResponse(res, 200, 'Email check completed', { exists: rows.length > 0 });
  } catch (err) {
    console.error('Email check error:', err);
    sendResponse(res, 500, 'Database error');
  }
});

app.get('/student/volunteers', async (req, res) => {
  try {
    const [results] = await db.query('SELECT volunteer_id, first_name, last_name FROM volunteers');
    sendResponse(res, 200, 'Volunteers retrieved', results);
  } catch (err) {
    console.error('Error fetching volunteers:', err);
    sendResponse(res, 500, 'Database error');
  }
});

app.post('/student/profile', async (req, res) => {
  const { email } = req.body;
  if (!email) return sendResponse(res, 400, 'Email is required');

  try {
    const [results] = await db.query(
      'SELECT s.student_id, s.first_name, s.last_name, s.email, s.phone_number, s.registration_date, ' +
      'CONCAT(v.first_name, " ", v.last_name) AS volunteer_name ' +
      'FROM students s LEFT JOIN volunteers v ON s.volunteer_id = v.volunteer_id WHERE s.email = ?',
      [email]
    );
    if (results.length === 0) return sendResponse(res, 404, 'Profile not found');
    sendResponse(res, 200, 'Profile retrieved', results[0]);
  } catch (err) {
    console.error('Error fetching student profile:', err);
    sendResponse(res, 500, 'Database error');
  }
});

app.post('/student/attendance', async (req, res) => {
  const { email, event_id, attendance_action, location_latitude, location_longitude } = req.body;
  if (!email || !event_id || !attendance_action || !location_latitude || !location_longitude) {
    return sendResponse(res, 400, 'Email, event_id, attendance_action, latitude, and longitude are required');
  }

  try {
    const [student] = await db.query('SELECT student_id, volunteer_id FROM students WHERE email = ?', [email]);
    if (student.length === 0) return sendResponse(res, 404, 'Student not found');
    const { student_id, volunteer_id } = student[0];

    const [event] = await db.query('SELECT is_started, is_completed, volunteer_id FROM events WHERE event_id = ?', [event_id]);
    if (event.length === 0 || event[0].volunteer_id !== volunteer_id) {
      return sendResponse(res, 404, 'Event not found or not linked to your volunteer');
    }

    if (event[0].is_completed) {
      return sendResponse(res, 400, 'Event is completed and cannot be modified');
    }

    if (attendance_action === 'start') {
      if (!event[0].is_started) return sendResponse(res, 400, 'Event has not started yet');

      const [attendance] = await db.query(
        'SELECT attendance_id, start_time FROM attendance WHERE student_id = ? AND event_id = ? AND attendance_status = "pending"',
        [student_id, event_id]
      );
      if (attendance.length === 0) {
        return sendResponse(res, 404, 'No pending attendance record found for this event');
      }

      const [volunteerAttendance] = await db.query(
        'SELECT start_time FROM volunteerAttendance WHERE event_id = ? AND volunteer_id = ? AND end_time IS NULL',
        [event_id, volunteer_id]
      );
      if (volunteerAttendance.length > 0) {
        const eventStartTime = new Date(volunteerAttendance[0].start_time);
        const currentTime = new Date();
        const timeDiffMinutes = (currentTime - eventStartTime) / (1000 * 60);
        if (timeDiffMinutes > 60) {
          await db.query(
            'UPDATE attendance SET attendance_status = "absent" WHERE student_id = ? AND event_id = ? AND attendance_status = "pending"',
            [student_id, event_id]
          );
          return sendResponse(res, 400, 'Attendance window has expired; marked as absent');
        }
      }

      await db.query(
        'UPDATE attendance SET attendance_status = "present", location_latitude = ?, location_longitude = ?, start_time = NOW() ' +
        'WHERE student_id = ? AND event_id = ? AND attendance_status = "pending"',
        [location_latitude, location_longitude, student_id, event_id]
      );

      sendResponse(res, 200, 'Attendance marked as present', { start_time: new Date().toISOString() });
    } else if (attendance_action === 'end') {
      const [attendance] = await db.query(
        'SELECT attendance_id, start_time FROM attendance WHERE student_id = ? AND event_id = ? AND attendance_status = "present" AND end_time IS NULL',
        [student_id, event_id]
      );
      if (attendance.length === 0) {
        return sendResponse(res, 404, 'No active attendance record found for this event');
      }

      const duration_minutes = (new Date() - new Date(attendance[0].start_time)) / (1000 * 60);
      await db.query(
        'UPDATE attendance SET end_time = NOW(), location_latitude = ?, location_longitude = ? ' +
        'WHERE student_id = ? AND event_id = ? AND attendance_status = "present" AND end_time IS NULL',
        [location_latitude, location_longitude, student_id, event_id]
      );

      sendResponse(res, 200, 'Attendance ended', { duration_minutes, end_time: new Date().toISOString() });
    } else {
      sendResponse(res, 400, 'Invalid attendance_action');
    }
  } catch (err) {
    console.error('Error marking student attendance:', err);
    sendResponse(res, 500, 'Database error');
  }
});

app.put('/student/update-profile', async (req, res) => {
  const { email, first_name, last_name, phone_number, current_password, password } = req.body;
  if (!email) return sendResponse(res, 400, 'Email is required');
  if (!first_name && !last_name && !phone_number && !password) return sendResponse(res, 400, 'At least one field must be provided');

  try {
    const [student] = await db.query('SELECT password FROM students WHERE email = ?', [email]);
    if (student.length === 0) return sendResponse(res, 404, 'Student not found');

    let hashedPassword = null;
    if (password) {
      if (!current_password) return sendResponse(res, 400, 'Current password is required to update password');
      const isMatch = await bcrypt.compare(current_password, student[0].password);
      if (!isMatch) return sendResponse(res, 401, 'Current password incorrect');
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const updates = [];
    const params = [];
    if (first_name) { updates.push('first_name = ?'); params.push(first_name); }
    if (last_name !== undefined) { updates.push('last_name = ?'); params.push(last_name); }
    if (phone_number !== undefined) { updates.push('phone_number = ?'); params.push(phone_number); }
    if (hashedPassword) { updates.push('password = ?'); params.push(hashedPassword); }
    params.push(email);

    if (updates.length === 0) return sendResponse(res, 400, 'No valid fields to update');

    const [result] = await db.query(`UPDATE students SET ${updates.join(', ')} WHERE email = ?`, params);
    if (result.affectedRows === 0) return sendResponse(res, 404, 'Student not found');
    sendResponse(res, 200, 'Profile updated');
  } catch (err) {
    console.error('Error updating student profile:', err);
    sendResponse(res, 500, 'Database error');
  }
});

app.get('/student/events', async (req, res) => {
  const { email } = req.query;
  if (!email) return sendResponse(res, 400, 'Email is required');

  try {
    const [student] = await db.query('SELECT volunteer_id FROM students WHERE email = ?', [email]);
    if (student.length === 0) return sendResponse(res, 404, 'Student not found');
    if (!student[0].volunteer_id) return sendResponse(res, 200, 'No volunteer assigned', []);

    const [results] = await db.query(
      'SELECT event_id, event_name, event_description, event_date, event_time, volunteer_id ' +
      'FROM events WHERE volunteer_id = ? AND is_started = 1 AND is_completed = 0 AND event_date >= CURDATE() ORDER BY event_date ASC',
      [student[0].volunteer_id]
    );
    sendResponse(res, 200, 'Upcoming events retrieved', results);
  } catch (err) {
    console.error('Error fetching student events:', err);
    sendResponse(res, 500, 'Database error');
  }
});
app.get('/student/attendance', async (req, res) => {
  const { email } = req.query;
  if (!email) return sendResponse(res, 400, 'Email is required');

  try {
    const [student] = await db.query('SELECT student_id FROM students WHERE email = ?', [email]);
    if (student.length === 0) return sendResponse(res, 404, 'Student not found');
    const student_id = student[0].student_id;

    const [results] = await db.query(
      'SELECT event_id, attendance_status, start_time ' +
      'FROM attendance WHERE student_id = ?',
      [student_id]
    );
    sendResponse(res, 200, 'Attendance retrieved', results);
  } catch (err) {
    console.error('Error fetching student attendance:', err);
    sendResponse(res, 500, 'Database error');
  }
});
app.post('/student/attendance', async (req, res) => {
  const { email, event_id, attendance_action, location_latitude, location_longitude } = req.body;
  if (!email || !event_id || !attendance_action || !location_latitude || !location_longitude) {
    return sendResponse(res, 400, 'Email, event_id, attendance_action, latitude, and longitude are required');
  }

  try {
    const [student] = await db.query('SELECT student_id, volunteer_id FROM students WHERE email = ?', [email]);
    if (student.length === 0) return sendResponse(res, 404, 'Student not found');
    const { student_id, volunteer_id } = student[0];

    const [event] = await db.query('SELECT is_started, volunteer_id FROM events WHERE event_id = ?', [event_id]);
    if (event.length === 0 || event[0].volunteer_id !== volunteer_id) {
      return sendResponse(res, 404, 'Event not found or not linked to your volunteer');
    }

    if (attendance_action === 'start') {
      if (!event[0].is_started) return sendResponse(res, 400, 'Event has not started yet');

      const [attendance] = await db.query(
        'SELECT attendance_id, start_time FROM attendance WHERE student_id = ? AND event_id = ? AND attendance_status = "pending"',
        [student_id, event_id]
      );
      if (attendance.length === 0) {
        return sendResponse(res, 404, 'No pending attendance record found for this event');
      }

      // Check attendance window (1 hour from volunteer's start)
      const [volunteerAttendance] = await db.query(
        'SELECT start_time FROM volunteerAttendance WHERE event_id = ? AND volunteer_id = ? AND end_time IS NULL',
        [event_id, volunteer_id]
      );
      if (volunteerAttendance.length > 0) {
        const eventStartTime = new Date(volunteerAttendance[0].start_time);
        const currentTime = new Date();
        const timeDiffMinutes = (currentTime - eventStartTime) / (1000 * 60);
        if (timeDiffMinutes > 60) { // 1-hour window
          await db.query(
            'UPDATE attendance SET attendance_status = "absent" WHERE student_id = ? AND event_id = ? AND attendance_status = "pending"',
            [student_id, event_id]
          );
          return sendResponse(res, 400, 'Attendance window has expired; marked as absent');
        }
      }

      await db.query(
        'UPDATE attendance SET attendance_status = "present", location_latitude = ?, location_longitude = ?, start_time = NOW() ' +
        'WHERE student_id = ? AND event_id = ? AND attendance_status = "pending"',
        [location_latitude, location_longitude, student_id, event_id]
      );

      sendResponse(res, 200, 'Attendance marked as present', { start_time: new Date().toISOString() });
    } else {
      sendResponse(res, 400, 'Invalid attendance_action');
    }
  } catch (err) {
    console.error('Error marking student attendance:', err);
    sendResponse(res, 500, 'Database error');
  }
});

app.get('/student/upcoming-events', async (req, res) => {
  const { email } = req.query;
  if (!email) return sendResponse(res, 400, 'Email is required');

  try {
    const [student] = await db.query('SELECT student_id, volunteer_id FROM students WHERE email = ?', [email]);
    if (student.length === 0) return sendResponse(res, 404, 'Student not found');
    const { student_id, volunteer_id } = student[0];

    if (!volunteer_id) {
      return sendResponse(res, 200, 'No volunteer assigned, no events available', []);
    }

    const [results] = await db.query(
      'SELECT e.event_id, e.event_name, e.event_description, e.event_date, e.event_time, e.is_started, e.is_completed ' +
      'FROM events e ' +
      'WHERE e.volunteer_id = ? AND e.event_date >= CURDATE() ORDER BY e.event_date ASC',
      [volunteer_id]
    );

    sendResponse(res, 200, 'Upcoming events retrieved', results);
  } catch (err) {
    console.error('Error fetching upcoming events:', err);
    sendResponse(res, 500, 'Database error');
  }
});
app.get('/student/attendance-by-email', async (req, res) => {
  const { email } = req.query;
  if (!email) return sendResponse(res, 400, 'Email is required');

  try {
    const [student] = await db.query('SELECT student_id FROM students WHERE email = ?', [email]);
    if (student.length === 0) return sendResponse(res, 404, 'Student not found');
    const student_id = student[0].student_id;

    const [results] = await db.query(
      'SELECT a.attendance_id, a.event_id, e.event_name, a.attendance_status, a.start_time, a.end_time ' +
      'FROM attendance a ' +
      'LEFT JOIN events e ON a.event_id = e.event_id ' +
      'WHERE a.student_id = ?',
      [student_id]
    );
    sendResponse(res, 200, 'Attendance retrieved', results);
  } catch (err) {
    console.error('Error fetching student attendance:', err);
    sendResponse(res, 500, 'Database error');
  }
});

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in meters
}
// ================== START SERVER ==================

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});