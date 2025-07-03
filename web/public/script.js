const calendarDiv = document.getElementById('calendar');
const linkOutput = document.getElementById('linkOutput');
const monthYear = document.getElementById('monthYear');
const prevBtn = document.getElementById('prevMonth');
const nextBtn = document.getElementById('nextMonth');

let currentDate = new Date();
let selectedDates = [];
let proposeBtn;

function renderCalendar(date) {
  calendarDiv.innerHTML = '';
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDay = (firstDay.getDay() + 6) % 7;
  const totalDays = lastDay.getDate();

  monthYear.innerText = `${date.toLocaleString('default', { month: 'long' })} ${year}`;

  for (let i = 0; i < startDay; i++) {
    calendarDiv.appendChild(document.createElement('div'));
  }

  for (let day = 1; day <= totalDays; day++) {
    const div = document.createElement('div');
    div.className = 'day';
    const formattedDate = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    div.innerText = day;

    if (selectedDates.includes(formattedDate)) {
      div.classList.add('selected');
    }

    div.onclick = () => {
      if (selectedDates.includes(formattedDate)) return;
      if (selectedDates.length >= 3) return;

      selectedDates.push(formattedDate);
      div.classList.add('selected');

      if (!proposeBtn) {
        proposeBtn = document.createElement('button');
        proposeBtn.innerText = 'Propose Times';
        proposeBtn.onclick = proposeTimes;
        linkOutput.innerHTML = '';
        linkOutput.appendChild(proposeBtn);
      }
    };

    calendarDiv.appendChild(div);
  }

}

async function proposeTimes() {
  const dateTimePairs = [];

  for (const date of selectedDates) {
    const time = prompt(`Enter time for the appointment on ${date} (HH:MM):`);
    if (!/^\d{2}:\d{2}$/.test(time)) return;
    dateTimePairs.push({ date, time });
  }

  if (!dateTimePairs.every(p => p.date && p.time)) return;

  try {
    const response = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dates: dateTimePairs })
    });

    const data = await response.json();

    if (data.token) {
      linkOutput.innerHTML = `<p>Send this link:</p><a href="/respond/${data.token}" target="_blank">/respond/${data.token}</a>`;
      selectedDates = [];
      proposeBtn = null;
    } else {
      linkOutput.innerHTML = `<p>Error: ${data.error || 'Unknown error'}</p>`;
    }
  } catch (err) {
    linkOutput.innerHTML = `<p>Error: ${err.message}</p>`;
  }
}

prevBtn.onclick = () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar(currentDate);
};

nextBtn.onclick = () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar(currentDate);
};

renderCalendar(currentDate);
