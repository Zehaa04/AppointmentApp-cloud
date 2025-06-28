const token = window.location.pathname.split("/").pop();
const appointmentDetails = document.getElementById('appointmentDetails');
const nameInput = document.getElementById('name');

let appointments = [];

async function loadAppointment() {
  const res = await fetch(`/api/appointments/${token}/respond`);
  const data = await res.json();

  if (data.error) {
    appointmentDetails.innerHTML = `<p style="color:red">${data.error}</p>`;
    return;
  }

  appointments = data.appointments;
  appointmentDetails.innerHTML = '';

  appointments.forEach((appt, index) => {
    const dateOnly = appt.date.split('T')[0];
    const timePart = appt.time.slice(0, 5);
    const dateTime = new Date(`${dateOnly}T${timePart}`);
    const formatted = dateTime.toLocaleString(undefined, {
      dateStyle: 'long',
      timeStyle: 'short'
    });

    const container = document.createElement('div');
    container.className = 'appointment-entry';

    const title = document.createElement('p');
    title.innerHTML = `<strong>Appointment ${index + 1}:</strong> ${formatted}`;
    container.appendChild(title);

    const yesBtn = document.createElement('button');
    yesBtn.textContent = 'Yes';
    const noBtn = document.createElement('button');
    noBtn.textContent = 'No';

    const responseDiv = document.createElement('div');
    const yesList = document.createElement('p');
    const noList = document.createElement('p');

    const updateLists = () => {
      const yesVotes = appt.responses.filter(r => r.response === 'yes');
      const noVotes = appt.responses.filter(r => r.response === 'no');
      yesList.innerHTML = `✅ Yes (${yesVotes.length}): ${yesVotes.map(r => r.name).join(', ') || 'None'}`;
      noList.innerHTML = `❌ No (${noVotes.length}): ${noVotes.map(r => r.name).join(', ') || 'None'}`;
    };

    yesBtn.onclick = async () => await submitResponse(appt.id, 'yes', appt, updateLists);
    noBtn.onclick = async () => await submitResponse(appt.id, 'no', appt, updateLists);

    container.appendChild(yesBtn);
    container.appendChild(noBtn);
    container.appendChild(yesList);
    container.appendChild(noList);

    appointmentDetails.appendChild(container);
    updateLists();
  });
}

async function submitResponse(appointmentId, responseValue, appt, updateLists) {
  const name = nameInput.value.trim();
  if (!name) {
    alert('Please enter your name before voting.');
    return;
  }

  const res = await fetch(`/api/appointments/${token}/respond`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      responses: [{ appointmentId, response: responseValue }]
    })
  });

  const result = await res.json();
  if (result.success) {
    const existing = appt.responses.find(r => r.name === name);
    if (existing) {
      existing.response = responseValue;
    } else {
      appt.responses.push({ name, response: responseValue });
    }
    updateLists();
  } else {
    alert(result.error || 'Error submitting response.');
  }
}

window.onload = loadAppointment;
