async function init() {
  const response = await fetch('https://cloud-api.directus.cloud/system/status/past');
  const { data } = await response.json();

  const uptimeResponse = await fetch('https://cloud-api.directus.cloud/system/uptime');
  const uptimeData = await uptimeResponse.json();
  const uptime = uptimeData.data + "%";

  const lastStatus = data[0].status;

  const now = new Date();

  const dateString = new Intl.DateTimeFormat('default', { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' }).format(now);

  document.querySelector('#current').classList.add(lastStatus + '-bg');
  document.querySelector('#date').innerText = 'Last updated: ' + dateString;

  let copy = "Unknown";

  switch(lastStatus) {
    case 'red':
      copy = 'System Outage';
      break;
    case 'yellow':
      copy = 'Degraded Performance';
      break;
    case 'green':
      copy = 'Operational';
      break;
  }

  document.querySelector('#current-status').innerText = copy;

  document.body.classList.remove('loading');

  let incidentsHTML = '';
  let graphHTML = '';

  for (let i = 0; i < 90; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateString = new Intl.DateTimeFormat('default', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
    const statusReport = data.find(s => isInDate(new Date(s.datetime), date)) || {};
    incidentsHTML += getIncidentListItem(dateString, statusReport.status, statusReport.description);
    graphHTML += `<li class="${statusReport.status || 'green'}-bg" title="${dateString}"></li>`;
  }

  document.querySelector('#past-incidents').innerHTML = incidentsHTML;
  document.querySelector('#graph').innerHTML = graphHTML;
  document.querySelector('#uptime').innerHTML = uptime;
}

init();

function getIncidentListItem(dateString, status, description) {
  if (!status || status === 'green') {
    return `
      <li>
        <h3>${dateString}</h3>
        <p>No incidents reported.</p>
      </li>
    `;
  }

  return `<li>
    <h3>${dateString}</h3>
    <div>
      <h4 class="${status}">
        ${status === 'red' ?
          'Some users are reporting problems with the Directus Cloud API' :
          'Some users are reporting latency with the Directus Cloud API'
        }
      </h4>
      <h5>${description || 'We\'re investigating'}</h5>
    </div>
  </li>`
}

function isInDate(date1, date2) {
  return date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear();
}
