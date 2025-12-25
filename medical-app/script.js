document.addEventListener('DOMContentLoaded', () => {

// --- DOM Elements ---
const authScreen = document.getElementById('auth-screen');
const appShell = document.getElementById('app-shell');
const authForm = document.getElementById('auth-form');
const loginBtn = document.getElementById('login-btn');
const registerToggleBtn = document.getElementById('register-toggle-btn');
const logoutBtn = document.getElementById('logout-btn');
const darkModeToggleAuth = document.getElementById('dark-mode-toggle');
const darkModeToggleApp = document.getElementById('dark-mode-app-toggle');

const appDashboard = document.getElementById('app-dashboard');
const sidebarNav = document.getElementById('sidebar-nav');
const dashboardTitle = document.getElementById('dashboard-title');
const userDisplayName = document.getElementById('user-display-name');
const userDisplayRole = document.getElementById('user-display-role');

const genericModal = document.getElementById('generic-modal');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const closeBtns = document.querySelectorAll('.close-btn');

const chatModal = document.getElementById('chat-modal');
const chatPartnerDisplay = document.getElementById('chat-partner');
const chatMessagesContainer = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const sendChatBtn = document.getElementById('send-chat-btn');
let currentChatPatientId = null;

// Notification elements
const notificationToggle = document.getElementById('notification-toggle');
const notificationDropdown = document.getElementById('notification-dropdown');
const notificationCount = document.getElementById('notification-count');
const notificationList = document.getElementById('notification-list');

// --- Data Storage and Initialization ---
let isRegisterMode = false;

// Initialize LocalStorage arrays if they don't exist
if (!localStorage.getItem('users')) {
// Pre-populate with a few sample users for testing
localStorage.setItem('users', JSON.stringify([
{ id: 'u1', name: 'Dr. Smith', email: 'dr@med.com', password: '123', role: 'Doctor' },
{ id: 'u2', name: 'Alice Patient', email: 'alice@pat.com', password: '123', role: 'Patient' },
{ id: 'u3', name: 'Lab Tech John', email: 'lab@med.com', password: '123', role: 'Lab Staff' }
]));
}
if (!localStorage.getItem('appointments')) {
localStorage.setItem('appointments', JSON.stringify([
{ id: 1, patientId: 'u2', doctorName: 'Dr. Smith', date: '2025-12-10', time: '10:00', status: 'Confirmed' }
]));
}
if (!localStorage.getItem('labTests')) {
localStorage.setItem('labTests', JSON.stringify([
{ id: 1, patientId: 'u2', testName: 'Blood Count', dateRequested: '2025-11-20', status: 'Pending Sample', result: null, resultDate: null, labStaff: null },
{ id: 2, patientId: 'u2', testName: 'Urine Analysis', dateRequested: '2025-11-15', status: 'Result Verified', result: 'All parameters normal. WBC: 4.5.', resultDate: '2025-11-18', labStaff: 'Lab Tech John' },
{ id: 3, patientId: 'u2', testName: 'Cholesterol', dateRequested: new Date().toISOString().slice(0, 10), status: 'Result Entered', result: 'High Cholesterol (250 mg/dL)', resultDate: null, labStaff: 'Lab Tech John' }
]));
}
if (!localStorage.getItem('reminders')) {
localStorage.setItem('reminders', JSON.stringify([
{ id: 1, patientId: 'u2', medication: 'Antibiotic X', time: '08:00', dose: '1 pill' }
]));
}
if (!localStorage.getItem('prescriptions')) {
localStorage.setItem('prescriptions', JSON.stringify([
{ id: 1, patientId: 'u2', doctorName: 'Dr. Smith', date: '2025-11-01', medicine: 'Ibuprofen', notes: 'Take 2 pills every 8 hours for pain.' }
]));
}
if (!localStorage.getItem('chatHistory')) {
localStorage.setItem('chatHistory', JSON.stringify({
'u1_u2': [
{ senderId: 'u2', message: 'Hello Dr. Smith, I have a question about my medication.', timestamp: Date.now() - 3600000 },
{ senderId: 'u1', message: 'Hello Alice, I am here to help. What is your concern?', timestamp: Date.now() - 3500000 }
]
}));
}
if (!localStorage.getItem('notifications')) {
localStorage.setItem('notifications', JSON.stringify([
{ id: 1, userId: 'u2', message: 'Your Urine Analysis result is ready!', read: false, type: 'success' },
{ id: 2, userId: 'u1', message: 'New appointment request from Alice Patient.', read: false, type: 'info' }
]));
}
// NEW: Comprehensive Medical Records
if (!localStorage.getItem('patientRecords')) {
localStorage.setItem('patientRecords', JSON.stringify([
{
id: 1,
patientId: 'u2',
doctorId: 'u1',
date: '2025-11-01',
anamnesis: 'Patient presented with mild headache and fatigue for 3 days. Denies fever or respiratory symptoms.',
diagnosis: 'Tension Headache (G44.2)',
therapy: 'Prescribed Ibuprofen (see prescription records). Recommended rest and hydration.',
followUp: '2025-12-01'
}
]));
}

// --- Core Functions ---

const getUsers = () => JSON.parse(localStorage.getItem('users') || '[]');
const setUsers = (users) => localStorage.setItem('users', JSON.stringify(users));

const getAppts = () => JSON.parse(localStorage.getItem('appointments') || '[]');
const setAppts = (appts) => localStorage.setItem('appointments', JSON.stringify(appts));

const getTests = () => JSON.parse(localStorage.getItem('labTests') || '[]');
const setTests = (tests) => localStorage.setItem('labTests', JSON.stringify(tests));

const getReminders = () => JSON.parse(localStorage.getItem('reminders') || '[]');
const setReminders = (reminders) => localStorage.setItem('reminders', JSON.stringify(reminders));

const getPrescriptions = () => JSON.parse(localStorage.getItem('prescriptions') || '[]');
const setPrescriptions = (prescriptions) => localStorage.setItem('prescriptions', JSON.stringify(prescriptions));

const getNotifications = () => JSON.parse(localStorage.getItem('notifications') || '[]');
const setNotifications = (notifications) => localStorage.setItem('notifications', JSON.stringify(notifications));

const getChatHistory = () => JSON.parse(localStorage.getItem('chatHistory') || '{}');
const setChatHistory = (history) => localStorage.setItem('chatHistory', JSON.stringify(history));

// NEW: Patient Records Get/Set
const getPatientRecords = () => JSON.parse(localStorage.getItem('patientRecords') || '[]');
const setPatientRecords = (records) => localStorage.setItem('patientRecords', JSON.stringify(records));


// --- Authentication Logic ---

const transitionToApp = (user) => {
authScreen.classList.remove('screen-visible');
authScreen.classList.add('hidden');
appShell.classList.remove('hidden');
appShell.classList.add('screen-visible');

localStorage.setItem('loggedInUser', JSON.stringify(user));

userDisplayName.textContent = user.name;
userDisplayRole.textContent = user.role;
userDisplayRole.className = `tag tag-${user.role.toLowerCase().replace(' ', '-')}`;

setupDashboard(user);
renderNotifications();
};

const registerUser = (name, email, password, role) => {
const users = getUsers();
if (users.some(u => u.email === email)) {
alert('Registration failed: Email already exists.');
return false;
}
const newUser = { id: 'u' + (users.length + 1), name, email, password, role };
users.push(newUser);
setUsers(users);
alert('Registration successful! Please log in.');
return newUser;
};

const handleAuth = (e) => {
e.preventDefault();
const nameInput = document.getElementById('auth-name');
const email = document.getElementById('auth-email').value;
const password = document.getElementById('auth-password').value;
const role = document.getElementById('auth-role').value;

if (isRegisterMode) {
if (!nameInput.value || !role) return alert('Please fill all fields.');
const newUser = registerUser(nameInput.value, email, password, role);
if (newUser) {
// Automatically log in after registration
transitionToApp(newUser);
}
} else {
const user = getUsers().find(u => u.email === email && u.password === password);
if (user) {
transitionToApp(user);
} else {
alert('Login failed: Invalid email or password.');
}
}
};

const toggleRegisterMode = () => {
isRegisterMode = !isRegisterMode;
const nameInput = document.getElementById('auth-name');
nameInput.style.display = isRegisterMode ? 'block' : 'none';

loginBtn.textContent = isRegisterMode ? 'Register & Login' : 'Login';
registerToggleBtn.textContent = isRegisterMode ? 'Already a user? Login' : 'New User? Register';
};

const handleLogout = () => {
localStorage.removeItem('loggedInUser');
authScreen.classList.add('screen-visible');
appShell.classList.remove('screen-visible');
appShell.classList.add('hidden');
// Reset form and mode
authForm.reset();
isRegisterMode = false;
document.getElementById('auth-name').style.display = 'none';
loginBtn.textContent = 'Login';
registerToggleBtn.textContent = 'New User? Register';
};

// --- Modal Functions ---

const openModal = (title, contentHTML) => {
modalTitle.textContent = title;
modalBody.innerHTML = contentHTML;
genericModal.classList.remove('hidden');
};

const closeModal = () => {
genericModal.classList.add('hidden');
chatModal.classList.add('hidden'); // Close chat if open
};

closeBtns.forEach(btn => {
btn.addEventListener('click', closeModal);
});

genericModal.addEventListener('click', (e) => {
if (e.target === genericModal) closeModal();
});

chatModal.addEventListener('click', (e) => {
if (e.target === chatModal) closeModal();
});

// --- Dashboard Setup and Rendering ---

const setupDashboard = (user) => {
const role = user.role;
let navHTML = '';
let initialContent = '';

dashboardTitle.textContent = `${role} Dashboard`;

switch (role) {
case 'Patient':
navHTML = `
<a href="#" data-view="home" class="active"><i class="fas fa-home"></i> Home</a>
<a href="#" data-view="appointments"><i class="fas fa-calendar-alt"></i> My Appointments</a>
<a href="#" data-view="lab-results"><i class="fas fa-flask"></i> My Lab Results</a>
<a href="#" data-view="medication"><i class="fas fa-pills"></i> Medication Reminders</a>
<a href="#" data-view="new-test"><i class="fas fa-vial"></i> Request New Test</a>
<a href="#" data-view="history"><i class="fas fa-history"></i> Health History</a>
`;
initialContent = renderPatientHome(user);
break;
case 'Doctor':
navHTML = `
<a href="#" data-view="home" class="active"><i class="fas fa-user-md"></i> Home</a>
<a href="#" data-view="view-patients"><i class="fas fa-user-friends"></i> View/Manage Patients</a>
<a href="#" data-view="prescribe"><i class="fas fa-file-prescription"></i> Write Prescription</a>
<a href="#" data-view="verify-results"><i class="fas fa-check-double"></i> Verify Lab Results</a>
<a href="#" data-view="schedule"><i class="fas fa-clock"></i> My Schedule</a>
`;
initialContent = renderDoctorHome(user);
break;
case 'Lab Staff':
navHTML = `
<a href="#" data-view="home" class="active"><i class="fas fa-tachometer-alt"></i> Home</a>
<a href="#" data-view="pending-samples"><i class="fas fa-clipboard-list"></i> Pending Samples</a>
<a href="#" data-view="enter-results"><i class="fas fa-edit"></i> Enter Results</a>
<a href="#" data-view="verify-results"><i class="fas fa-check-double"></i> Verify/Send Results</a>
`;
initialContent = renderLabHome(user);
break;
}

sidebarNav.innerHTML = navHTML;
appDashboard.innerHTML = initialContent;

// Add navigation event listeners
document.querySelectorAll('#sidebar-nav a').forEach(link => {
link.addEventListener('click', (e) => {
e.preventDefault();
document.querySelectorAll('#sidebar-nav a').forEach(l => l.classList.remove('active'));
e.currentTarget.classList.add('active');
renderView(user, e.currentTarget.dataset.view);
});
});
};

// --- PATIENT RENDERERS (Minimized for focus on Doctor/Lab) ---
const renderPatientHome = (user) => `
<div class="dashboard-grid">
<div class="card info-box">
<i class="fas fa-calendar-check"></i>
<div>
<h3>Appointments</h3>
<p>${getAppts().filter(a => a.patientId === user.id && a.status === 'Confirmed').length} Confirmed</p>
</div>
</div>
<div class="card info-box">
<i class="fas fa-flask"></i>
<div>
<h3>Results Ready</h3>
<p>${getTests().filter(t => t.patientId === user.id && t.status === 'Result Verified').length} Verified</p>
</div>
</div>
<div class="card info-box">
<i class="fas fa-heartbeat"></i>
<div>
<h3>Medical Records</h3>
<p>${getPatientRecords().filter(r => r.patientId === user.id).length} Entries</p>
</div>
</div>
</div>
<div class="card" style="margin-top: 20px;">
<h2>Quick Actions</h2>
<button onclick="renderView(JSON.parse(localStorage.getItem('loggedInUser')), 'new-test')" class="btn primary-btn"><i class="fas fa-vial"></i> Request New Test</button>
</div>
`;
const renderPatientAppointments = (user) => { /* ... (Unchanged) ... */
const appts = getAppts().filter(a => a.patientId === user.id);
let html = '<h2>My Appointments</h2>';

if (appts.length === 0) {
html += '<p class="alert alert-info">You have no scheduled appointments.</p>';
return html;
}

html += `<table class="data-table">
<thead>
<tr><th>Doctor</th><th>Date</th><th>Time</th><th>Status</th><th>Action</th></tr>
</thead>
<tbody>
${appts.map(a => `
<tr>
<td>${a.doctorName}</td>
<td>${a.date}</td>
<td>${a.time}</td>
<td><span class="tag">${a.status}</span></td>
<td><button onclick="alert('Appointment ID ${a.id}: Cannot cancel in this demo.')" class="btn secondary-btn small-btn">Cancel</button></td>
</tr>
`).join('')}
</tbody>
</table>`;
return html;
};
const renderPatientLabResults = (user) => { /* ... (Unchanged) ... */
const tests = getTests().filter(t => t.patientId === user.id && t.status === 'Result Verified');
let html = '<h2>My Verified Lab Results</h2>';

if (tests.length === 0) {
html += '<p class="alert alert-info">No verified results are available.</p>';
return html;
}

html += `<table class="data-table">
<thead>
<tr><th>Test Name</th><th>Result Date</th><th>Staff</th><th>Action</th></tr>
</thead>
<tbody>
${tests.map(t => `
<tr>
<td>${t.testName}</td>
<td>${t.resultDate}</td>
<td>${t.labStaff}</td>
<td><button onclick="showLabResultModal(${t.id})" class="btn primary-btn small-btn">View Result</button></td>
</tr>
`).join('')}
</tbody>
</table>`;
return html;
};
window.showLabResultModal = (testId) => { /* ... (Unchanged) ... */
const test = getTests().find(t => t.id === testId);
openModal('Lab Result: ' + test.testName,
`<div class="alert alert-success">Verified by ${test.labStaff} on ${test.resultDate}</div>
<p><strong>Notes/Findings:</strong></p>
<textarea style="width:100%; height: 200px; padding: 10px;" readonly>${test.result}</textarea>
`);
};
const renderPatientMedication = (user) => { /* ... (Unchanged) ... */
const reminders = getReminders().filter(r => r.patientId === user.id);
const prescriptions = getPrescriptions().filter(p => p.patientId === user.id);

let html = '<h2>Medication & Prescriptions</h2>';

// Reminders
html += '<h3 style="margin-top: 30px;">Medication Reminders</h3>';
html += `<div class="card" style="padding: 15px;">
<button onclick="showReminderForm('${user.id}')" class="btn primary-btn" style="margin-bottom: 15px;"><i class="fas fa-plus-circle"></i> Add Reminder</button>
`;

if (reminders.length === 0) {
html += '<p class="alert alert-info">No active medication reminders.</p>';
} else {
html += `<table class="data-table">
<thead><tr><th>Medication</th><th>Time</th><th>Dose</th><th>Action</th></tr></thead>
<tbody>
${reminders.map(r => `
<tr>
<td>${r.medication}</td>
<td>${r.time}</td>
<td>${r.dose}</td>
<td><button onclick="removeReminder(${r.id})" class="btn logout-btn small-btn">Remove</button></td>
</tr>
`).join('')}
</tbody>
</table>`;
}
html += '</div>';

// Prescriptions
html += '<h3 style="margin-top: 30px;">Active Prescriptions</h3>';
if (prescriptions.length === 0) {
html += '<p class="alert alert-info">No current prescriptions on file.</p>';
} else {
html += `<table class="data-table">
<thead><tr><th>Doctor</th><th>Medicine</th><th>Date</th><th>Notes</th></tr></thead>
<tbody>
${prescriptions.map(p => `
<tr>
<td>${p.doctorName}</td>
<td>${p.medicine}</td>
<td>${p.date}</td>
<td>${p.notes.substring(0, 30)}...</td>
</tr>
`).join('')}
</tbody>
</table>`;
}


return html;
};
window.showReminderForm = (patientId) => { /* ... (Unchanged) ... */
openModal('Add New Reminder', `
<form id="reminder-form" class="data-form">
<input type="hidden" name="patientId" value="${patientId}">
<label for="medication">Medication Name</label>
<input type="text" id="medication" required>
<label for="time">Time</label>
<input type="time" id="time" required>
<label for="dose">Dose/Notes</label>
<input type="text" id="dose" required>
<button type="submit" class="btn primary-btn">Save Reminder</button>
</form>
`);
document.getElementById('reminder-form').addEventListener('submit', handleAddReminder);
};
const handleAddReminder = (e) => { /* ... (Unchanged) ... */
e.preventDefault();
const user = JSON.parse(localStorage.getItem('loggedInUser'));
const reminders = getReminders();
const newReminder = {
id: reminders.length + 1,
patientId: user.id,
medication: document.getElementById('medication').value,
time: document.getElementById('time').value,
dose: document.getElementById('dose').value
};
reminders.push(newReminder);
setReminders(reminders);
closeModal();
renderView(user, 'medication');
alert('Reminder saved successfully!');
};
window.removeReminder = (id) => { /* ... (Unchanged) ... */
if (!confirm('Are you sure you want to remove this reminder?')) return;
const user = JSON.parse(localStorage.getItem('loggedInUser'));
const reminders = getReminders().filter(r => r.id !== id);
setReminders(reminders);
renderView(user, 'medication');
alert('Reminder removed.');
};
const renderPatientNewTest = (user) => { /* ... (Unchanged) ... */
return `
<h2>Request New Lab Test</h2>
<div class="card">
<form id="test-request-form" class="data-form">
<label for="test-type">Test Type Requested</label>
<select id="test-type" required>
<option value="Blood Test">Complete Blood Count (CBC)</option>
<option value="Urine Analysis">Urine Analysis</option>
<option value="Cholesterol">Lipid Panel/Cholesterol</option>
<option value="Thyroid">Thyroid Function Test</option>
</select>

<label for="reason">Reason for Request</label>
<textarea id="reason" rows="3" placeholder="Describe symptoms or reason for testing..." required></textarea>

<button type="submit" class="btn primary-btn"><i class="fas fa-paper-plane"></i> Submit Request</button>
</form>
</div>
`;
};
const handleNewTestRequest = (e) => { /* ... (Unchanged) ... */
e.preventDefault();
const user = JSON.parse(localStorage.getItem('loggedInUser'));
const tests = getTests();
const newTest = {
id: tests.length + 1,
patientId: user.id,
testName: document.getElementById('test-type').value,
dateRequested: new Date().toISOString().slice(0, 10),
status: 'Pending Sample',
result: null,
resultDate: null,
labStaff: null
};
tests.push(newTest);
setTests(tests);
alert('Test request submitted successfully! The lab has been notified.');

// Add notification for Lab Staff
const notifications = getNotifications();
notifications.push({
id: notifications.length + 1,
userId: 'u3', // Lab Tech John (u3)
message: `New test request from ${user.name}: ${newTest.testName}.`,
read: false,
type: 'info'
});
setNotifications(notifications);
renderView(user, 'lab-results');
};
const renderPatientHealthHistory = (user) => { /* ... (Unchanged) ... */
const allTests = getTests().filter(t => t.patientId === user.id && t.status !== 'Pending Sample');
const allPrescriptions = getPrescriptions().filter(p => p.patientId === user.id);
const allRecords = getPatientRecords().filter(r => r.patientId === user.id);

let html = '<h2>Comprehensive Health History</h2>';

// Medical Records
html += '<h3 style="margin-top: 30px;">Consultation Records</h3>';
if (allRecords.length === 0) {
html += '<p class="alert alert-info">No consultation records on file.</p>';
} else {
html += `<table class="data-table">
<thead><tr><th>Date</th><th>Doctor</th><th>Diagnosis</th><th>Summary</th></tr></thead>
<tbody>
${allRecords.map(r => {
const doctor = getUsers().find(u => u.id === r.doctorId);
return `
<tr>
<td>${r.date}</td>
<td>${doctor ? doctor.name : 'N/A'}</td>
<td>${r.diagnosis}</td>
<td>${r.therapy.substring(0, 30)}...</td>
</tr>
`;
}).join('')}
</tbody>
</table>`;
}

// Prescriptions
html += '<h3 style="margin-top: 30px;">Past Prescriptions</h3>';
if (allPrescriptions.length === 0) {
html += '<p class="alert alert-info">No past prescriptions recorded.</p>';
} else {
html += `<table class="data-table">
<thead><tr><th>Doctor</th><th>Medicine</th><th>Date</th><th>Notes</th></tr></thead>
<tbody>
${allPrescriptions.map(p => `
<tr>
<td>${p.doctorName}</td>
<td>${p.medicine}</td>
<td>${p.date}</td>
<td>${p.notes.substring(0, 30)}...</td>
</tr>
`).join('')}
</tbody>
</table>`;
}

// Lab Tests
html += '<h3 style="margin-top: 30px;">Past Lab Tests</h3>';
if (allTests.length === 0) {
html += '<p class="alert alert-info">No past lab results recorded.</p>';
} else {
html += `<table class="data-table">
<thead><tr><th>Test</th><th>Status</th><th>Date</th></tr></thead>
<tbody>
${allTests.map(t => `
<tr>
<td>${t.testName}</td>
<td>${t.status}</td>
<td>${t.dateRequested}</td>
</tr>
`).join('')}
</tbody>
</table>`;
}

return html;
};


// --- DOCTOR RENDERERS ---

const renderDoctorHome = (user) => {
const today = new Date().toISOString().slice(0, 10);
const patientsCount = getUsers().filter(u => u.role === 'Patient').length;
const todayApptsCount = getAppts().filter(a => a.doctorName === user.name && a.date === today && a.status === 'Confirmed').length;
const resultsToVerifyCount = getTests().filter(t => t.status === 'Result Entered').length;

return `
<div class="dashboard-grid">
<div class="card info-box">
<i class="fas fa-user-friends"></i>
<div>
<h3>Active Patients</h3>
<p><strong>${patientsCount}</strong> Total Registered</p>
</div>
</div>
<div class="card info-box">
<i class="fas fa-calendar-day"></i>
<div>
<h3>Today's Appts</h3>
<p><strong>${todayApptsCount}</strong> Scheduled Today</p>
</div>
</div>
<div class="card info-box">
<i class="fas fa-check-double text-red"></i>
<div>
<h3>Awaiting Verification</h3>
<p><strong>${resultsToVerifyCount}</strong> Lab Results</p>
</div>
</div>
</div>
<div class="card" style="margin-top: 20px;">
<h2>Quick Actions</h2>
<button onclick="renderView(JSON.parse(localStorage.getItem('loggedInUser')), 'view-patients')" class="btn primary-btn"><i class="fas fa-notes-medical"></i> View Patient Records</button>
<button onclick="renderView(JSON.parse(localStorage.getItem('loggedInUser')), 'verify-results')" class="btn secondary-btn"><i class="fas fa-check"></i> Verify Results</button>
</div>
`;
};

const renderDoctorViewPatients = (user) => {
const patients = getUsers().filter(u => u.role === 'Patient');
let html = '<h2>Manage Patients & Records</h2>';

// --- Register New Patient Form (Unchanged) ---
html += `<div class="card" style="margin-bottom: 20px;">
<h3>Register New Patient</h3>
<form id="doctor-register-patient-form" class="data-form">
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
<input type="text" id="new-pat-name" placeholder="Full Name" required>
<input type="email" id="new-pat-email" placeholder="Email (Unique)" required>
<input type="password" id="new-pat-password" placeholder="Temporary Password" required>
<button type="submit" class="btn primary-btn"><i class="fas fa-user-plus"></i> Register Patient</button>
</div>
</form>
</div>`;

setTimeout(() => {
const form = document.getElementById('doctor-register-patient-form');
if (form) form.addEventListener('submit', handleDoctorRegisterPatient);
}, 0);


// --- Patients Table (Enhanced) ---
html += `<h3>Registered Patients (${patients.length})</h3>`;
if (patients.length === 0) {
html += '<p class="alert alert-info">No registered patients in the system.</p>';
return html;
}

html += `<table class="data-table">
<thead>
<tr><th>Name</th><th>Email</th><th style="width: 300px;">Actions</th></tr>
</thead>
<tbody>
${patients.map(p => `
<tr>
<td>${p.name}</td>
<td>${p.email}</td>
<td>
<button onclick="showMedicalRecordModal('${user.id}', '${p.id}', '${p.name}')" class="btn primary-btn small-btn"><i class="fas fa-notes-medical"></i> Records</button>
<button onclick="showWritePrescriptionModal('${user.name}', '${p.id}', '${p.name}')" class="btn secondary-btn small-btn"><i class="fas fa-file-prescription"></i> Prescribe</button>
<button onclick="showChatModal('${user.id}', '${p.id}', '${p.name}')" class="btn icon-btn" style="color: var(--color-primary);"><i class="fas fa-comment"></i></button>
</td>
</tr>
`).join('')}
</tbody>
</table>`;
return html;
};

const handleDoctorRegisterPatient = (e) => {
e.preventDefault();
const user = JSON.parse(localStorage.getItem('loggedInUser'));
const name = document.getElementById('new-pat-name').value;
const email = document.getElementById('new-pat-email').value;
const password = document.getElementById('new-pat-password').value;

const users = getUsers();
if (users.some(u => u.email === email)) {
alert('Registration failed: Email already exists.');
return;
}

const newUser = { id: 'u' + (users.length + 1), name, email, password, role: 'Patient' };
users.push(newUser);
setUsers(users);

alert(`✅ Patient ${name} registered successfully with temporary password.`);
renderView(user, 'view-patients'); // Reload the patient table
};

// NEW FUNCTION: Display and Input Medical Records
window.showMedicalRecordModal = (doctorId, patientId, patientName) => {
const patientRecords = getPatientRecords().filter(r => r.patientId === patientId).sort((a, b) => new Date(b.date) - new Date(a.date));

let recordHistoryHTML = '';
if (patientRecords.length > 0) {
recordHistoryHTML = '<h4>Record History:</h4><ul style="max-height: 200px; overflow-y: auto; list-style: none; padding-left: 0;">';
patientRecords.forEach(r => {
recordHistoryHTML += `
<li class="card" style="margin-bottom: 10px; padding: 10px; background-color: var(--color-background); border-left: 4px solid var(--color-primary);">
<strong>${r.date} - ${r.diagnosis}</strong>
<br>Anamnesis: ${r.anamnesis.substring(0, 50)}...
</li>
`;
});
recordHistoryHTML += '</ul>';
} else {
recordHistoryHTML = '<p class="alert alert-info">No previous medical records found for this patient.</p>';
}


const modalContent = `
${recordHistoryHTML}

<h4 style="margin-top: 20px; color: var(--color-primary);">New Consultation Record</h4>
<form id="medical-record-form" class="data-form">
<input type="hidden" name="patientId" value="${patientId}">
<input type="hidden" name="doctorId" value="${doctorId}">

<label for="record-anamnesis">Anamnesis (Patient's History/Symptoms)</label>
<textarea id="record-anamnesis" rows="3" required></textarea>

<label for="record-diagnosis">Diagnosis (e.g., Pneumonia J18.9)</label>
<input type="text" id="record-diagnosis" required>

<label for="record-therapy">Therapy and Progress Notes (Treatment Plan)</label>
<textarea id="record-therapy" rows="4" required></textarea>

<button type="submit" class="btn primary-btn"><i class="fas fa-save"></i> Save New Record</button>
</form>
`;

openModal(`Medical Records for ${patientName}`, modalContent);
document.getElementById('medical-record-form').addEventListener('submit', handleSaveMedicalRecord);
};

const handleSaveMedicalRecord = (e) => {
e.preventDefault();
const user = JSON.parse(localStorage.getItem('loggedInUser'));
const records = getPatientRecords();
const patientId = e.target.querySelector('input[name="patientId"]').value;
const doctorId = e.target.querySelector('input[name="doctorId"]').value;

const newRecord = {
id: records.length + 1,
patientId: patientId,
doctorId: doctorId,
date: new Date().toISOString().slice(0, 10),
anamnesis: document.getElementById('record-anamnesis').value,
diagnosis: document.getElementById('record-diagnosis').value,
therapy: document.getElementById('record-therapy').value,
followUp: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10) // Example follow-up date (7 days later)
};

records.push(newRecord);
setPatientRecords(records);
closeModal();
alert('Medical Record saved successfully.');
renderView(user, 'view-patients'); // Refresh patient list
};

// Doctor's version of Verify Results (Same functionality as Lab Staff, but routed from Doctor dashboard)
const renderDoctorVerifyResults = (user) => {
const testsToVerify = getTests().filter(t => t.status === 'Result Entered');
const patients = getUsers();

let html = '<h2>Verify and Authorize Lab Results</h2>';

if (testsToVerify.length === 0) {
html += '<p class="alert alert-success">No results currently awaiting verification.</p>';
return html;
}

html += `<table class="data-table">
<thead>
<tr><th>Patient</th><th>Test Name</th><th>Entered By</th><th>Action</th></tr>
</thead>
<tbody>
${testsToVerify.map(t => {
const patient = patients.find(p => p.id === t.patientId);
return `
<tr>
<td>${patient ? patient.name : 'N/A'}</td>
<td>${t.testName}</td>
<td>${t.labStaff}</td>
<td>
<button onclick="showVerificationModal(${t.id}, '${patient.name}', true)" class="btn accent-btn small-btn"><i class="fas fa-check"></i> Authorize/Send</button>
</td>
</tr>
`;
}).join('')}
</tbody>
</table>`;
return html;
};

const renderDoctorPrescribe = (user) => {
const patients = getUsers().filter(u => u.role === 'Patient');
let html = '<h2>Write New Prescription</h2>';

if (patients.length === 0) {
html += '<p class="alert alert-info">No patients to prescribe to.</p>';
return html;
}

html += `<table class="data-table">
<thead>
<tr><th>Patient Name</th><th>Action</th></tr>
</thead>
<tbody>
${patients.map(p => `
<tr>
<td>${p.name}</td>
<td><button onclick="showWritePrescriptionModal('${user.name}', '${p.id}', '${p.name}')" class="btn primary-btn small-btn">Write Prescription</button></td>
</tr>
`).join('')}
</tbody>
</table>`;
return html;
};

window.showWritePrescriptionModal = (doctorName, patientId, patientName) => {
openModal('Write Prescription for ' + patientName, `
<form id="prescription-form" class="data-form">
<input type="hidden" name="patientId" value="${patientId}">
<input type="hidden" name="doctorName" value="${doctorName}">

<label for="medicine">Medicine Name</label>
<input type="text" id="medicine" placeholder="e.g., Amoxicillin 500mg" required>

<label for="notes">Dosage and Instructions</label>
<textarea id="notes" rows="4" placeholder="Take one capsule every 12 hours for 7 days." required></textarea>

<button type="submit" class="btn primary-btn"><i class="fas fa-save"></i> Save Prescription</button>
</form>
`);
document.getElementById('prescription-form').addEventListener('submit', handleWritePrescription);
};

const handleWritePrescription = (e) => {
e.preventDefault();
const user = JSON.parse(localStorage.getItem('loggedInUser'));
const prescriptions = getPrescriptions();
const patientId = e.target.querySelector('input[name="patientId"]').value;
const doctorName = e.target.querySelector('input[name="doctorName"]').value;

const newPrescription = {
id: prescriptions.length + 1,
patientId: patientId,
doctorName: doctorName,
date: new Date().toISOString().slice(0, 10),
medicine: document.getElementById('medicine').value,
notes: document.getElementById('notes').value
};

prescriptions.push(newPrescription);
setPrescriptions(prescriptions);

// Add notification for Patient
const notifications = getNotifications();
notifications.push({
id: notifications.length + 1,
userId: patientId,
message: `New prescription from Dr. ${doctorName.split(' ')[1]}. Check your records.`,
read: false,
type: 'info'
});
setNotifications(notifications);

closeModal();
alert('Prescription saved successfully and added to the patient\'s record.');
renderView(user, 'prescribe');
};


// --- LAB STAFF RENDERERS (Unchanged functionality) ---

const renderLabHome = (user) => {
const today = new Date().toISOString().slice(0, 10);
const pendingCount = getTests().filter(t => t.status === 'Pending Sample').length;
const enteredCount = getTests().filter(t => t.status === 'Result Entered').length;
const todayProcessedCount = getTests().filter(t => t.resultDate === today).length;

return `
<div class="dashboard-grid">
<div class="card info-box">
<i class="fas fa-clipboard-list"></i>
<div>
<h3>Pending Samples</h3>
<p><strong>${pendingCount}</strong> Awaiting Sample</p>
</div>
</div>
<div class="card info-box">
<i class="fas fa-edit"></i>
<div>
<h3>Awaiting Result Entry</h3>
<p><strong>${getTests().filter(t => t.status === 'Sample Received').length}</strong> Samples in Lab</p>
</div>
</div>
<div class="card info-box">
<i class="fas fa-check-double text-red"></i>
<div>
<h3>Awaiting Verification</h3>
<p><strong>${enteredCount}</strong> Results (Internal)</p>
</div>
</div>
</div>
<div class="card" style="margin-top: 20px;">
<h2>Quick Actions</h2>
<button onclick="renderView(JSON.parse(localStorage.getItem('loggedInUser')), 'enter-results')" class="btn primary-btn"><i class="fas fa-edit"></i> Enter Results</button>
<button onclick="renderView(JSON.parse(localStorage.getItem('loggedInUser')), 'verify-results')" class="btn secondary-btn"><i class="fas fa-check"></i> Verify Results</button>
</div>
<div class="card alert alert-info" style="margin-top: 20px;">
<p>Processed Results Today: <strong>${todayProcessedCount} samples</strong></p>
</div>
`;
};

const renderLabPendingSamples = (user) => {
const pendingTests = getTests().filter(t => t.status === 'Pending Sample');
const receivedTests = getTests().filter(t => t.status === 'Sample Received');
const patients = getUsers();

let html = '<h2>Manage Samples</h2>';

// --- Samples Awaiting Pickup/Arrival ---
html += '<h3>Awaiting Sample Receipt</h3>';
if (pendingTests.length === 0) {
html += '<p class="alert alert-success">No samples currently pending receipt.</p>';
} else {
html += `<table class="data-table">
<thead>
<tr><th>Patient</th><th>Test Name</th><th>Requested Date</th><th>Action</th></tr>
</thead>
<tbody>
${pendingTests.map(t => {
const patient = patients.find(p => p.id === t.patientId);
return `
<tr>
<td>${patient ? patient.name : 'N/A'}</td>
<td>${t.testName}</td>
<td>${t.dateRequested}</td>
<td>
<button onclick="markSampleReceived(${t.id}, '${user.id}')" class="btn primary-btn small-btn">Mark Received</button>
</td>
</tr>
`;
}).join('')}
</tbody>
</table>`;
}

// --- Samples Received (Needs Result Entry) ---
html += '<h3 style="margin-top: 40px;">Received Samples (Ready for Entry)</h3>';
if (receivedTests.length === 0) {
html += '<p class="alert alert-info">No samples currently in the lab.</p>';
} else {
html += `<table class="data-table">
<thead>
<tr><th>Patient</th><th>Test Name</th><th>Status</th></tr>
</thead>
<tbody>
${receivedTests.map(t => {
const patient = patients.find(p => p.id === t.patientId);
return `
<tr>
<td>${patient ? patient.name : 'N/A'}</td>
<td>${t.testName}</td>
<td><span class="tag">Sample Received</span></td>
</tr>
`;
}).join('')}
</tbody>
</table>`;
}

return html;
};

window.markSampleReceived = (testId, labStaffId) => {
const user = JSON.parse(localStorage.getItem('loggedInUser'));
const tests = getTests();
const testIndex = tests.findIndex(t => t.id === testId);

if (testIndex !== -1) {
tests[testIndex].status = 'Sample Received';
tests[testIndex].labStaff = user.name;
setTests(tests);

// Notify Lab Staff that sample is in the queue for entry
const notifications = getNotifications();
notifications.push({
id: notifications.length + 1,
userId: labStaffId,
message: `Sample ID ${testId} received. Ready for result entry.`,
read: false,
type: 'warning'
});
setNotifications(notifications);

alert(`Sample ID ${testId} marked as "Sample Received". Ready for result entry.`);
renderView(user, 'pending-samples');
}
};

const renderLabEnterResults = (user) => {
const testsToEnter = getTests().filter(t => t.status === 'Sample Received');
const patients = getUsers();

let html = '<h2>Enter Lab Results</h2>';

if (testsToEnter.length === 0) {
html += '<p class="alert alert-info">No samples currently marked "Received" to enter results for.</p>';
return html;
}

html += `<table class="data-table">
<thead>
<tr><th>Patient</th><th>Test Name</th><th>Action</th></tr>
</thead>
<tbody>
${testsToEnter.map(t => {
const patient = patients.find(p => p.id === t.patientId);
return `
<tr>
<td>${patient ? patient.name : 'N/A'}</td>
<td>${t.testName}</td>
<td>
<button onclick="showResultEntryModal(${t.id}, '${user.name}')" class="btn primary-btn small-btn"><i class="fas fa-edit"></i> Enter Result</button>
</td>
</tr>
`;
}).join('')}
</tbody>
</table>`;
return html;
};

window.showResultEntryModal = (testId, labStaffName) => {
const test = getTests().find(t => t.id === testId);
const patient = getUsers().find(p => p.id === test.patientId);

if (!test || !patient) return alert('Error: Test or patient not found.');

openModal(`Enter Result for ${patient.name}`, `
<div class="alert alert-info">Test: ${test.testName} (Requested: ${test.dateRequested})</div>
<form id="result-entry-form" class="data-form">
<input type="hidden" name="testId" value="${testId}">
<input type="hidden" name="labStaffName" value="${labStaffName}">

<label for="result-text">Detailed Lab Findings / Text Result</label>
<textarea id="result-text" rows="8" placeholder="Enter findings here (e.g., WBC: 4.5, Normal Range: 4.0-10.0)" required></textarea>

<button type="submit" class="btn primary-btn"><i class="fas fa-save"></i> Submit for Verification</button>
</form>
`);
document.getElementById('result-entry-form').addEventListener('submit', handleResultEntry);
};

const handleResultEntry = (e) => {
e.preventDefault();
const user = JSON.parse(localStorage.getItem('loggedInUser'));
const tests = getTests();
const testId = parseInt(e.target.querySelector('input[name="testId"]').value);
const labStaffName = e.target.querySelector('input[name="labStaffName"]').value;
const resultText = document.getElementById('result-text').value;

const testIndex = tests.findIndex(t => t.id === testId);
if (testIndex !== -1) {
tests[testIndex].result = resultText;
tests[testIndex].labStaff = labStaffName;
tests[testIndex].status = 'Result Entered';
setTests(tests);

// Notification for Doctor/Verifier (u1 is Dr. Smith)
const notifications = getNotifications();
notifications.push({
id: notifications.length + 1,
userId: 'u1',
message: `Result for ${tests[testIndex].testName} entered by ${labStaffName}. Requires verification.`,
read: false,
type: 'warning'
});
setNotifications(notifications);

closeModal();
alert('Result entered successfully and sent for verification.');
renderView(user, 'enter-results');
}
};

const renderLabVerifyResults = (user) => {
const testsToVerify = getTests().filter(t => t.status === 'Result Entered');
const patients = getUsers();

let html = '<h2>Verify and Send Results</h2>';

if (testsToVerify.length === 0) {
html += '<p class="alert alert-success">No results currently awaiting verification.</p>';
return html;
}

html += `<table class="data-table">
<thead>
<tr><th>Patient</th><th>Test Name</th><th>Entered By</th><th>Action</th></tr>
</thead>
<tbody>
${testsToVerify.map(t => {
const patient = patients.find(p => p.id === t.patientId);
return `
<tr>
<td>${patient ? patient.name : 'N/A'}</td>
<td>${t.testName}</td>
<td>${t.labStaff}</td>
<td>
<button onclick="showVerificationModal(${t.id}, '${patient.name}', false)" class="btn accent-btn small-btn"><i class="fas fa-check"></i> Verify/Send</button>
</td>
</tr>
`;
}).join('')}
</tbody>
</table>`;
return html;
};

window.showVerificationModal = (testId, patientName, isDoctor) => {
const test = getTests().find(t => t.id === testId);

const actionText = isDoctor ? 'Confirm Authorization & Send' : 'Confirm Verification & Send';

openModal(`Verify Result for ${patientName}`, `
<div class="alert alert-info">Test: ${test.testName} (Entered by: ${test.labStaff})</div>
<p><strong>Result:</strong></p>
<textarea style="width:100%; height: 200px; padding: 10px;" readonly>${test.result}</textarea>
<div style="margin-top: 20px;">
<button onclick="verifyAndSendResult(${testId})" class="btn primary-btn"><i class="fas fa-check-double"></i> ${actionText} to Patient</button>
<button onclick="closeModal()" class="btn secondary-btn">Cancel</button>
</div>
`);
};

window.verifyAndSendResult = (testId) => {
const user = JSON.parse(localStorage.getItem('loggedInUser'));
const tests = getTests();
const testIndex = tests.findIndex(t => t.id === testId);

if (testIndex !== -1) {
const patientId = tests[testIndex].patientId;
tests[testIndex].status = 'Result Verified';
tests[testIndex].resultDate = new Date().toISOString().slice(0, 10);
setTests(tests);

// Notification for Patient
const patientNotifications = getNotifications();
patientNotifications.push({
id: patientNotifications.length + 1,
userId: patientId,
message: `Your ${tests[testIndex].testName} result is verified and ready!`,
read: false,
type: 'success'
});
setNotifications(patientNotifications);

closeModal();
alert(`Result verified and sent to patient's dashboard.`);

// Determine which view to render back to
const viewToRender = user.role === 'Doctor' ? 'verify-results' : 'verify-results';
renderView(user, viewToRender);
}
};


// --- General View and Event Router ---

const renderView = (user, view) => {
let content = '';
switch (user.role) {
case 'Patient':
if (view === 'appointments') content = renderPatientAppointments(user);
else if (view === 'lab-results') content = renderPatientLabResults(user);
else if (view === 'medication') content = renderPatientMedication(user);
else if (view === 'new-test') content = renderPatientNewTest(user);
else if (view === 'history') content = renderPatientHealthHistory(user);
else content = renderPatientHome(user);
break;
case 'Doctor':
if (view === 'view-patients') content = renderDoctorViewPatients(user);
else if (view === 'prescribe') content = renderDoctorPrescribe(user);
else if (view === 'verify-results') content = renderDoctorVerifyResults(user);
// schedule view is placeholder for now
else content = renderDoctorHome(user);
break;
case 'Lab Staff':
if (view === 'pending-samples') content = renderLabPendingSamples(user);
else if (view === 'enter-results') content = renderLabEnterResults(user);
else if (view === 'verify-results') content = renderLabVerifyResults(user);
else content = renderLabHome(user);
break;
}

appDashboard.innerHTML = content;

// Re-attach specific form handlers after re-rendering
if (view === 'new-test') {
document.getElementById('test-request-form').addEventListener('submit', handleNewTestRequest);
}
};

// --- Chat System (Unchanged) ---

window.showChatModal = (selfId, partnerId, partnerName) => {
chatPartnerDisplay.textContent = `Chat with ${partnerName}`;
currentChatPatientId = partnerId; // Store for sending messages

// Hide generic modal if open, show chat modal
genericModal.classList.add('hidden');
chatModal.classList.remove('hidden');

renderChatMessages(selfId, partnerId);
};

const renderChatMessages = (selfId, partnerId) => {
chatMessagesContainer.innerHTML = '';
const history = getChatHistory();
// Standardize key (u1_u2 or u2_u1)
const key = [selfId, partnerId].sort().join('_');
const messages = history[key] || [];

messages.forEach(msg => {
const messageElement = document.createElement('div');
messageElement.className = `chat-message ${msg.senderId === selfId ? 'sender-self' : 'sender-other'}`;
messageElement.textContent = msg.message;
chatMessagesContainer.appendChild(messageElement);
});

chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
};

const handleSendMessage = () => {
const user = JSON.parse(localStorage.getItem('loggedInUser'));
const messageText = chatInput.value.trim();

if (!messageText || !currentChatPatientId) return;

const selfId = user.id;
const partnerId = currentChatPatientId;
const history = getChatHistory();
const key = [selfId, partnerId].sort().join('_');

const newMessage = {
senderId: selfId,
message: messageText,
timestamp: Date.now()
};

if (!history[key]) history[key] = [];
history[key].push(newMessage);
setChatHistory(history);

chatInput.value = '';
renderChatMessages(selfId, partnerId);
};

sendChatBtn.addEventListener('click', handleSendMessage);
chatInput.addEventListener('keypress', (e) => {
if (e.key === 'Enter') handleSendMessage();
});

// --- Notifications System (Unchanged) ---

const renderNotifications = () => {
const user = JSON.parse(localStorage.getItem('loggedInUser'));
const allNotifications = getNotifications();
const userNotifications = allNotifications.filter(n => n.userId === user.id && !n.read);

notificationCount.textContent = userNotifications.length;
if (userNotifications.length > 0) {
notificationCount.classList.remove('hidden');
} else {
notificationCount.classList.add('hidden');
}

notificationList.innerHTML = userNotifications.map(n => `
<li class="alert alert-${n.type}">${n.message}</li>
`).join('');

if (userNotifications.length === 0) {
notificationList.innerHTML = '<li>No new notifications.</li>';
}
};

notificationToggle.addEventListener('click', () => {
notificationDropdown.classList.toggle('hidden');
});

// --- Dark Mode Toggle (Unchanged) ---
const toggleDarkMode = () => {
document.body.classList.toggle('dark-mode');
// Save preference
localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
};

darkModeToggleAuth.addEventListener('click', toggleDarkMode);
darkModeToggleApp.addEventListener('click', toggleDarkMode);

// --- Initial Check and Event Listeners (Unchanged) ---

// Load theme preference
if (localStorage.getItem('theme') === 'dark') {
document.body.classList.add('dark-mode');
}

// Check if user is already logged in
const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
if (loggedInUser) {
transitionToApp(loggedInUser);
} else {
authScreen.classList.add('screen-visible');
document.getElementById('auth-name').style.display = 'none'; // Ensure name field is hidden on load
}

// Event Listeners
registerToggleBtn.addEventListener('click', toggleRegisterMode);
authForm.addEventListener('submit', handleAuth);
logoutBtn.addEventListener('click', handleLogout);

// Initial check for 'Register' mode visibility
document.getElementById('auth-name').style.display = 'none';

});

