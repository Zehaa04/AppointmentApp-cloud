const calendarDiv = document.getElementById('calendar');
const linkOutput = document.getElementById('linkOutput');
const monthYear = document.getElementById('monthYear');
const prevBtn = document.getElementById('prevMonth');
const nextBtn = document.getElementById('nextMonth');

let currentDate = new Date();

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
