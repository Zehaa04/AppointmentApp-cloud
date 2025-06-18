const token = window.location.pathname.split("/").pop();

const appointmentDetails = document.getElementById('appointmentDetails');
const form = document.getElementById('responseForm');
const nameInput = document.getElementById('name');
const responseStats = document.getElementById('responseStats');

async function loadAppointment() {
  const res = await fetch(`/api/appointments/${token}/respond`);
  const data = await res.json();

  if (data.error) {
    appointmentDetails.innerHTML = `<p style="color:red">${data.error}</p>`;
    form.style.display = 'none';
    return;
  }

  try {
    const dateParts = data.date.split('-');
    const timeParts = data.time.split(':');

    const year = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10) - 1;
    const day = parseInt(dateParts[2], 10);

    const hour = parseInt(timeParts[0], 10);
    const minute = parseInt(timeParts[1], 10);
    const second = timeParts[2] ? parseInt(timeParts[2], 10) : 0;

    const dateTime = new Date(year, month, day, hour, minute, second);

    if (isNaN(dateTime.getTime())) {
      throw new Error();
    }

    const formattedDateTime = dateTime.toLocaleString(undefined, {
      dateStyle: 'long',
      timeStyle: 'short'
    });

    appointmentDetails.innerHTML = `<p>Appointment on <strong>${formattedDateTime}</strong></p>`;
    renderResponses(data.responses);
  } catch {
    appointmentDetails.innerHTML = `<p style="color:red">Could not format appointment date/time.</p>`;
  }
}

function renderResponses(responses) {
  responseStats.innerHTML = '';

  if (!responses || responses.length === 0) {
    responseStats.innerHTML = '<li>No responses yet.</li>';
    return;
  }

  const yes = responses.filter(r => r.response === 'yes');
  const no = responses.filter(r => r.response === 'no');

  if (yes.length) {
    const li = document.createElement('li');
    li.textContent = `✅ Yes (${yes.length}): ${yes.map(r => r.name).join(', ')}`;
    responseStats.appendChild(li);
  }

  if (no.length) {
    const li = document.createElement('li');
    li.textContent = `❌ No (${no.length}): ${no.map(r => r.name).join(', ')}`;
    responseStats.appendChild(li);
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = nameInput.value.trim();
  const answer = e.submitter.dataset.answer;

  if (!name) {
    alert("Please enter your name.");
    return;
  }

  if (!['yes', 'no'].includes(answer)) {
    alert("Please select yes or no.");
    return;
  }

  const res = await fetch(`/api/appointments/${token}/respond`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, response: answer })
  });

  const result = await res.json();
  if (result.success) {
    nameInput.value = '';
    loadAppointment();
  } else {
    alert(result.error || 'Error submitting response.');
  }
});

loadAppointment();
