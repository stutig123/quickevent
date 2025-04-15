document.addEventListener('DOMContentLoaded', () => {
  const loginSection = document.getElementById('loginSection');
  const adminSection = document.getElementById('adminSection');
  const adminLoginForm = document.getElementById('adminLoginForm');
  const loginMsg = document.getElementById('loginMsg');
  const adminEvents = document.getElementById('adminEvents');

  adminLoginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const pass = document.getElementById('adminPass').value;
    
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: pass }),
      });

      const data = await response.json();

      if (response.ok) {
        loginSection.style.display = 'none';
        adminSection.style.display = 'block';
        loadPendingEvents();
      } else {
        loginMsg.textContent = data.message || 'Login failed. Please try again.';
      }
    } catch (error) {
      console.error('Error:', error);
      loginMsg.textContent = 'An error occurred. Please try again.';
    }
  });

  const loadPendingEvents = async () => {
    const res = await fetch('/api/all-events');
    const events = await res.json();
    adminEvents.innerHTML = '';

    const pending = events.filter(e => !e.approved);
    if (pending.length === 0) {
      adminEvents.innerHTML = '<p>No events pending approval.</p>';
      return;
    }

    pending.forEach(event => {
      const div = document.createElement('div');
      div.className = 'event-card pending';
      div.innerHTML = `
        <h3>${event.title}</h3>
        <p><strong>Date:</strong> ${event.date}</p>
        <p><strong>Organizer:</strong> ${event.organizer}</p>
        <p>${event.description}</p>
        <button onclick="approveEvent(${event.id}, true)">✅ Approve</button>
        <button onclick="approveEvent(${event.id}, false)">❌ Reject</button>
      `;
      adminEvents.appendChild(div);
    });
  };

  window.approveEvent = async (id, approve) => {
    await fetch(`/api/events/${id}/approve`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approved: approve })
    });
    loadPendingEvents();
  };
});
  