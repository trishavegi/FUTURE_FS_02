// Mock Data Store (since backend not yet implemented)
let leads = [
  {
    id: 1,
    name: "Priya Sharma",
    email: "priya.sharma@example.com",
    phone: "+91 98765 43210",
    source: "website",
    status: "new",
    notes: [{ note: "Interested in bridal makeup package", createdAt: new Date().toISOString() }],
    followUpDate: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    name: "Rajesh Kumar",
    email: "rajesh.k@example.com",
    phone: "+91 99887 66554",
    source: "referral",
    status: "contacted",
    notes: [{ note: "Referred by existing client", createdAt: new Date().toISOString() }],
    followUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 3,
    name: "Anjali Mehta",
    email: "anjali.m@example.com",
    phone: "+91 87654 32109",
    source: "social_media",
    status: "converted",
    notes: [{ note: "Booked bridal package", createdAt: new Date().toISOString() }],
    followUpDate: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 4,
    name: "Vikram Singh",
    email: "vikram.s@example.com",
    phone: "+91 76543 21098",
    source: "walk_in",
    status: "new",
    notes: [{ note: "Walked in for consultation", createdAt: new Date().toISOString() }],
    followUpDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 5,
    name: "Neha Gupta",
    email: "neha.g@example.com",
    phone: "+91 65432 10987",
    source: "website",
    status: "contacted",
    notes: [{ note: "Sent price list", createdAt: new Date().toISOString() }],
    followUpDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

let nextId = 6;
let currentUser = null;
let statusChart, sourceChart, trendsChart;

// DOM Elements
const loginContainer = document.getElementById('loginContainer');
const dashboard = document.getElementById('dashboard');
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');

// Initialize Dashboard
function initDashboard() {
  updateStats();
  displayRecentLeads();
  displayAllLeads();
  updateCharts();
  updateTrendsChart();
  updateStatusBreakdown();
  setCurrentDate();
  
  // Set up event listeners for tabs
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = item.dataset.tab;
      switchTab(tab);
    });
  });
  
  // View all leads button
  document.querySelector('.view-all-btn')?.addEventListener('click', () => {
    switchTab('leads');
  });
  
  // Search and filter
  document.getElementById('searchLead')?.addEventListener('input', () => displayAllLeads());
  document.getElementById('statusFilter')?.addEventListener('change', () => displayAllLeads());
  document.getElementById('sourceFilter')?.addEventListener('change', () => displayAllLeads());
  document.getElementById('refreshLeadsBtn')?.addEventListener('click', () => {
    displayAllLeads();
    updateStats();
  });
  
  // Add lead form
  document.getElementById('addLeadForm')?.addEventListener('submit', addLead);
}

// Switch Tabs
function switchTab(tabName) {
  // Update nav items
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
    if (item.dataset.tab === tabName) {
      item.classList.add('active');
    }
  });
  
  // Update tab contents
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  
  const tabMap = {
    'dashboard': 'dashboardTab',
    'leads': 'leadsTab',
    'new-lead': 'newLeadTab',
    'analytics': 'analyticsTab'
  };
  
  document.getElementById(tabMap[tabName]).classList.add('active');
  
  // Refresh data when switching to leads tab
  if (tabName === 'leads') {
    displayAllLeads();
  }
  if (tabName === 'analytics') {
    updateCharts();
    updateTrendsChart();
    updateStatusBreakdown();
  }
}

// Update Stats
function updateStats() {
  const total = leads.length;
  const newLeads = leads.filter(l => l.status === 'new').length;
  const contacted = leads.filter(l => l.status === 'contacted').length;
  const converted = leads.filter(l => l.status === 'converted').length;
  
  document.getElementById('totalLeads').textContent = total;
  document.getElementById('newLeads').textContent = newLeads;
  document.getElementById('contactedLeads').textContent = contacted;
  document.getElementById('convertedLeads').textContent = converted;
}

// Display Recent Leads
function displayRecentLeads() {
  const recentLeads = [...leads].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
  const tbody = document.getElementById('recentLeadsTable');
  tbody.innerHTML = recentLeads.map(lead => `
    <tr>
      <td><strong>${escapeHtml(lead.name)}</strong></td>
      <td>${escapeHtml(lead.email)}</td>
      <td>${formatSource(lead.source)}</td>
      <td><span class="status-badge status-${lead.status}">${formatStatus(lead.status)}</span></td>
      <td>${formatDate(lead.createdAt)}</td>
    </tr>
  `).join('');
}

// Display All Leads
function displayAllLeads() {
  let filteredLeads = [...leads];
  
  const searchTerm = document.getElementById('searchLead')?.value.toLowerCase() || '';
  const statusFilter = document.getElementById('statusFilter')?.value || 'all';
  const sourceFilter = document.getElementById('sourceFilter')?.value || 'all';
  
  if (searchTerm) {
    filteredLeads = filteredLeads.filter(lead => 
      lead.name.toLowerCase().includes(searchTerm) ||
      lead.email.toLowerCase().includes(searchTerm) ||
      lead.phone.includes(searchTerm)
    );
  }
  
  if (statusFilter !== 'all') {
    filteredLeads = filteredLeads.filter(lead => lead.status === statusFilter);
  }
  
  if (sourceFilter !== 'all') {
    filteredLeads = filteredLeads.filter(lead => lead.source === sourceFilter);
  }
  
  const tbody = document.getElementById('allLeadsTable');
  tbody.innerHTML = filteredLeads.map(lead => `
    <tr>
      <td><strong>${escapeHtml(lead.name)}</strong><br><small style="color:#666">${escapeHtml(lead.email)}</small></td>
      <td>${escapeHtml(lead.phone)}</td>
      <td>${formatSource(lead.source)}</td>
      <td><span class="status-badge status-${lead.status}">${formatStatus(lead.status)}</span></td>
      <td>${lead.followUpDate ? formatDate(lead.followUpDate) : '-'}</td>
      <td class="action-btns">
        <button class="view-lead-btn" onclick="viewLead(${lead.id})"><i class="fas fa-eye"></i> View</button>
        <button class="edit-lead-btn" onclick="editLead(${lead.id})"><i class="fas fa-edit"></i> Edit</button>
      </td>
    </tr>
  `).join('');
}

// View Lead Details
function viewLead(id) {
  const lead = leads.find(l => l.id === id);
  if (!lead) return;
  
  const modal = document.getElementById('leadModal');
  const content = document.getElementById('leadDetailContent');
  
  content.innerHTML = `
    <div style="padding: 24px;">
      <h2 style="color: #1a1a2e; margin-bottom: 20px;">Lead Details</h2>
      <div style="background: #f8f9fc; border-radius: 16px; padding: 20px; margin-bottom: 20px;">
        <p><strong><i class="fas fa-user"></i> Name:</strong> ${escapeHtml(lead.name)}</p>
        <p><strong><i class="fas fa-envelope"></i> Email:</strong> ${escapeHtml(lead.email)}</p>
        <p><strong><i class="fas fa-phone"></i> Phone:</strong> ${escapeHtml(lead.phone)}</p>
        <p><strong><i class="fas fa-globe"></i> Source:</strong> ${formatSource(lead.source)}</p>
        <p><strong><i class="fas fa-tag"></i> Status:</strong> <span class="status-badge status-${lead.status}">${formatStatus(lead.status)}</span></p>
        <p><strong><i class="fas fa-calendar"></i> Created:</strong> ${formatDate(lead.createdAt)}</p>
        ${lead.followUpDate ? `<p><strong><i class="fas fa-bell"></i> Follow-up:</strong> ${formatDate(lead.followUpDate)}</p>` : ''}
      </div>
      <div style="margin-bottom: 20px;">
        <h3><i class="fas fa-sticky-note"></i> Notes & History</h3>
        ${lead.notes.map(note => `
          <div style="background: #f8f9fc; border-radius: 12px; padding: 12px; margin-top: 10px;">
            <p>${escapeHtml(note.note)}</p>
            <small style="color: #999;">${formatDate(note.createdAt)}</small>
          </div>
        `).join('')}
      </div>
      <div>
        <label style="display: block; margin-bottom: 8px; font-weight: 500;"><i class="fas fa-plus-circle"></i> Add Note</label>
        <textarea id="newNote" rows="2" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 10px;" placeholder="Type your note here..."></textarea>
        <div style="margin-top: 12px;">
          <label style="font-weight: 500;">Update Status:</label>
          <select id="statusUpdate" style="margin-left: 10px; padding: 8px; border-radius: 8px;">
            <option value="new" ${lead.status === 'new' ? 'selected' : ''}>New</option>
            <option value="contacted" ${lead.status === 'contacted' ? 'selected' : ''}>Contacted</option>
            <option value="converted" ${lead.status === 'converted' ? 'selected' : ''}>Converted</option>
            <option value="lost" ${lead.status === 'lost' ? 'selected' : ''}>Lost</option>
          </select>
        </div>
        <button onclick="updateLead(${lead.id})" style="margin-top: 15px; padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 10px; cursor: pointer;">
          <i class="fas fa-save"></i> Save Changes
        </button>
      </div>
    </div>
  `;
  
  modal.style.display = 'flex';
  
  // Close modal
  document.querySelector('#leadModal .close-modal').onclick = () => {
    modal.style.display = 'none';
  };
  window.onclick = (e) => {
    if (e.target === modal) modal.style.display = 'none';
  };
}

// Update Lead
function updateLead(id) {
  const lead = leads.find(l => l.id === id);
  if (!lead) return;
  
  const newNote = document.getElementById('newNote')?.value;
  const newStatus = document.getElementById('statusUpdate')?.value;
  
  if (newNote && newNote.trim()) {
    lead.notes.unshift({
      note: newNote.trim(),
      createdAt: new Date().toISOString()
    });
  }
  
  if (newStatus && newStatus !== lead.status) {
    lead.status = newStatus;
    lead.updatedAt = new Date().toISOString();
  }
  
  updateStats();
  displayAllLeads();
  displayRecentLeads();
  updateCharts();
  updateStatusBreakdown();
  updateTrendsChart();
  
  document.getElementById('leadModal').style.display = 'none';
  alert('Lead updated successfully!');
}

// Edit Lead (quick edit)
function editLead(id) {
  const lead = leads.find(l => l.id === id);
  if (!lead) return;
  
  const newStatus = prompt('Update status (new/contacted/converted/lost):', lead.status);
  if (newStatus && ['new', 'contacted', 'converted', 'lost'].includes(newStatus.toLowerCase())) {
    lead.status = newStatus.toLowerCase();
    lead.updatedAt = new Date().toISOString();
    updateStats();
    displayAllLeads();
    displayRecentLeads();
    updateCharts();
    updateStatusBreakdown();
    updateTrendsChart();
    alert('Status updated successfully!');
  }
}

// Add Lead
function addLead(e) {
  e.preventDefault();
  
  const name = document.getElementById('leadName').value.trim();
  const email = document.getElementById('leadEmail').value.trim();
  const phone = document.getElementById('leadPhone').value.trim();
  const source = document.getElementById('leadSource').value;
  const notes = document.getElementById('leadNotes').value;
  const followUpDate = document.getElementById('leadFollowUp').value;
  
  if (!name || !email || !phone) {
    alert('Please fill all required fields');
    return;
  }
  
  const newLead = {
    id: nextId++,
    name,
    email,
    phone,
    source,
    status: 'new',
    notes: notes ? [{ note: notes, createdAt: new Date().toISOString() }] : [],
    followUpDate: followUpDate || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  leads.unshift(newLead);
  updateStats();
  displayRecentLeads();
  displayAllLeads();
  updateCharts();
  updateStatusBreakdown();
  updateTrendsChart();
  
  document.getElementById('addLeadForm').reset();
  alert('Lead added successfully!');
  switchTab('leads');
}

// Update Charts
function updateCharts() {
  const statusCounts = {
    new: leads.filter(l => l.status === 'new').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    converted: leads.filter(l => l.status === 'converted').length,
    lost: leads.filter(l => l.status === 'lost').length
  };
  
  const sourceCounts = {
    website: leads.filter(l => l.source === 'website').length,
    referral: leads.filter(l => l.source === 'referral').length,
    social_media: leads.filter(l => l.source === 'social_media').length,
    walk_in: leads.filter(l => l.source === 'walk_in').length,
    other: leads.filter(l => l.source === 'other').length
  };
  
  const ctx1 = document.getElementById('statusChart')?.getContext('2d');
  const ctx2 = document.getElementById('sourceChart')?.getContext('2d');
  
  if (statusChart) statusChart.destroy();
  if (sourceChart) sourceChart.destroy();
  
  if (ctx1) {
    statusChart = new Chart(ctx1, {
      type: 'doughnut',
      data: {
        labels: ['New', 'Contacted', 'Converted', 'Lost'],
        datasets: [{
          data: [statusCounts.new, statusCounts.contacted, statusCounts.converted, statusCounts.lost],
          backgroundColor: ['#1976d2', '#f57c00', '#388e3c', '#d32f2f']
        }]
      },
      options: { responsive: true, maintainAspectRatio: true }
    });
  }
  
  if (ctx2) {
    sourceChart = new Chart(ctx2, {
      type: 'bar',
      data: {
        labels: ['Website', 'Referral', 'Social Media', 'Walk-in', 'Other'],
        datasets: [{
          label: 'Leads',
          data: [sourceCounts.website, sourceCounts.referral, sourceCounts.social_media, sourceCounts.walk_in, sourceCounts.other],
          backgroundColor: '#667eea'
        }]
      },
      options: { responsive: true, maintainAspectRatio: true }
    });
  }
  
  // Update conversion rate
  const convertedCount = statusCounts.converted;
  const totalLeads = leads.length;
  const rate = totalLeads > 0 ? ((convertedCount / totalLeads) * 100).toFixed(1) : 0;
  document.getElementById('conversionRate').innerHTML = rate;
  document.getElementById('convertedCount').textContent = convertedCount;
  document.getElementById('totalForRate').textContent = totalLeads;
}

// Update Trends Chart
function updateTrendsChart() {
  const last7Days = [];
  const counts = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    last7Days.push(dateStr);
    
    const count = leads.filter(lead => {
      const leadDate = new Date(lead.createdAt);
      return leadDate.toDateString() === date.toDateString();
    }).length;
    counts.push(count);
  }
  
  const ctx = document.getElementById('trendsChart')?.getContext('2d');
  if (trendsChart) trendsChart.destroy();
  
  if (ctx) {
    trendsChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: last7Days,
        datasets: [{
          label: 'New Leads',
          data: counts,
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          fill: true,
          tension: 0.4
        }]
      },
      options: { responsive: true, maintainAspectRatio: true }
    });
  }
}

// Update Status Breakdown
function updateStatusBreakdown() {
  const container = document.getElementById('statusBreakdown');
  const statuses = [
    { name: 'New', key: 'new', color: '#1976d2' },
    { name: 'Contacted', key: 'contacted', color: '#f57c00' },
    { name: 'Converted', key: 'converted', color: '#388e3c' },
    { name: 'Lost', key: 'lost', color: '#d32f2f' }
  ];
  
  const total = leads.length;
  
  container.innerHTML = statuses.map(status => {
    const count = leads.filter(l => l.status === status.key).length;
    const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
    return `
      <div style="margin-bottom: 15px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
          <span>${status.name}</span>
          <span>${count} leads (${percentage}%)</span>
        </div>
        <div style="background: #eee; border-radius: 10px; overflow: hidden;">
          <div style="width: ${percentage}%; background: ${status.color}; height: 8px; border-radius: 10px;"></div>
        </div>
      </div>
    `;
  }).join('');
}

// Helper Functions
function formatStatus(status) {
  const map = { new: 'New', contacted: 'Contacted', converted: 'Converted', lost: 'Lost' };
  return map[status] || status;
}

function formatSource(source) {
  const map = {
    website: 'Website',
    referral: 'Referral',
    social_media: 'Social Media',
    walk_in: 'Walk-in',
    other: 'Other'
  };
  return map[source] || source;
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}

function setCurrentDate() {
  const date = new Date();
  document.getElementById('currentDate').innerHTML = date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

// Login Handler
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;
  
  if (username === 'admin' && password === 'admin123') {
    currentUser = { username };
    loginContainer.style.display = 'none';
    dashboard.style.display = 'flex';
    initDashboard();
  } else {
    alert('Invalid credentials! Use admin / admin123');
  }
});

// Logout Handler
logoutBtn.addEventListener('click', () => {
  currentUser = null;
  loginContainer.style.display = 'flex';
  dashboard.style.display = 'none';
  document.getElementById('loginForm').reset();
});