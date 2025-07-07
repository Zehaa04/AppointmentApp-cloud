// Extract the token from the current URL path
const token = window.location.pathname.split("/").pop();

const appointmentDetails = document.getElementById('appointmentDetails');
const nameInput = document.getElementById('name');

let appointments = [];

// Load appointment details and render voting UI
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
    // Format date and time nicely for display
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

    // Create Yes and No buttons for voting
    const yesBtn = document.createElement('button');
    yesBtn.textContent = 'Yes';
    const noBtn = document.createElement('button');
    noBtn.textContent = 'No';

    // Create elements to show who voted yes/no
    const responseDiv = document.createElement('div');
    const yesList = document.createElement('p');
    const noList = document.createElement('p');

    // Function to update name lists under each response
    const updateLists = () => {
      const yesVotes = appt.responses.filter(r => r.response === 'yes');
      const noVotes = appt.responses.filter(r => r.response === 'no');
      yesList.innerHTML = `✅ Yes (${yesVotes.length}): ${yesVotes.map(r => r.name).join(', ') || 'None'}`;
      noList.innerHTML = `❌ No (${noVotes.length}): ${noVotes.map(r => r.name).join(', ') || 'None'}`;
    };

    // Bind button events to submit vote and update UI
    yesBtn.onclick = async () => await submitResponse(appt.id, 'yes', appt, updateLists);
    noBtn.onclick = async () => await submitResponse(appt.id, 'no', appt, updateLists);

    container.appendChild(yesBtn);
    container.appendChild(noBtn);
    container.appendChild(yesList);
    container.appendChild(noList);

    appointmentDetails.appendChild(container);
    updateLists(); // Initial population of vote lists
  });
}

// Submit the user's response to the backend
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

  // If successful, update local appointment response list
  if (result.success) {
    const existing = appt.responses.find(r => r.name === name);
    if (existing) {
      existing.response = responseValue; // Overwrite previous vote
    } else {
      appt.responses.push({ name, response: responseValue }); // Add new vote
    }
    updateLists();
  } else {
    alert(result.error || 'Error submitting response.');
  }
}

// Load the appointment data when page loads
window.onload = loadAppointment;
