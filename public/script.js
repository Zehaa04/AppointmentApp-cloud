const calendarDiv = document.getElementById('calendar');
const linkOutput = document.getElementById('linkOutput');
const today = new Date();

for (let i = 0; i < 30; i++) {
  const day = new Date();
  day.setDate(today.getDate() + i);

  const div = document.createElement('div');
  div.className = 'day';
  const formatted = day.toISOString().split('T')[0];
  div.innerText = formatted;

  
  div.onclick = async () => {
    const response = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: formatted })
    });
    const data = await response.json();
    linkOutput.innerHTML = `<a href="/respond/${data.token}" target="_blank">Share this link</a>`;
  };
  calendarDiv.appendChild(div);
}