const calendarDiv = document.getElementById('calendar');
const linkOutput = document.getElementById('linkOutput');
const today = new Date();

for (let i = 0; i < 30; i++) {
  const day = new Date();
  day.setDate(today.getDate() + i);

  const div = document.createElement('div');
  div.className = 'day';
  const formattedDate = day.toISOString().split('T')[0];
  div.innerText = formattedDate;

  div.onclick = async () => {
    const time = prompt(`Enter time for the appointment on ${formattedDate} (HH:MM):`);
    
    
    if (!time || !/^\d{2}:\d{2}$/.test(time)) {
      alert("Invalid time format. Please use HH:MM.");
      return;
    }

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: formattedDate, time })
      });

      const data = await response.json();

      if (data.token) {
        linkOutput.innerHTML = `<p>Send this link:</p><a href="/respond/${data.token}" target="_blank">/respond/${data.token}</a>`;
      } else {
        linkOutput.innerHTML = `<p>Error: ${data.error || 'Unknown error'}</p>`;
      }
    } catch (err) {
      linkOutput.innerHTML = `<p>Error: ${err.message}</p>`;
    }
  };

  calendarDiv.appendChild(div);
}
