document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('eventForm');
    const msg = document.getElementById('formMsg');
    const eventsList = document.getElementById('eventsList');
  
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const eventData = {
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        date: document.getElementById('date').value,
        organizer: document.getElementById('organizer').value
      };
  
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      });
  
      const data = await res.json();
      msg.textContent = data.message;
      form.reset();
    });
  
    const loadEvents = async () => {
      const res = await fetch('/api/events');
      const events = await res.json();
      const eventsList = document.getElementById('eventsList');
      eventsList.innerHTML = '';
      events.forEach(event => {
        const div = document.createElement('div');
        div.className = 'event-card animate-slide-up';
        div.innerHTML = `
          <h3>${event.title}</h3>
          <p><strong>Date:</strong> ${event.date}</p>
          <p><strong>Organizer:</strong> ${event.organizer}</p>
          <p>${event.description}</p>
          <input type="text" placeholder="Your Name" id="join-${event.id}" />
          <button onclick="joinEvent(${event.id})">Join Event</button>
        `;
        eventsList.appendChild(div);
      });
    };
  
    loadEvents();
    setInterval(loadEvents, 10000); // Auto-refresh every 10 seconds
  });
  
  async function joinEvent(id) {
    const name = document.getElementById(`join-${id}`).value;
    if (!name.trim()) return alert('Please enter your name.');
    
    const res = await fetch(`/api/events/${id}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
  
    const data = await res.json();
    alert(data.message);
  }
  