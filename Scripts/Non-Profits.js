/*
  To use a spreadsheet, publish it as a public CSV and paste the URL below.
  Example Google Sheets CSV export URL:
  https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/gviz/tq?tqx=out:csv&sheet=Sheet1

  Required columns:
  Title, logo, Type, Description, Tags, Site URL
*/
const BUSINESSES_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTAHDBExdx8UOIb-6x_Y4VBY0kVXGeP3xetxg1O63uw6SmW0lRmv3yJBm8HQ77L8pNBNdyQXkn5nk6I/pub?gid=0&single=true&output=csv';

const SAMPLE_BUSINESSES = [
  {
    Title: 'Example Coffee Co.',
    logo: 'https://via.placeholder.com/320x180?text=Logo',
    Type: 'Coffee Shop',
    Description: 'A sample business entry to show how cards are generated from spreadsheet rows.',
    Tags: 'Coffee,Local,Takeout',
    'Site URL': 'https://example.com'
  }
];

function parseCsv(csvText) {
  const lines = csvText.trim().split(/\r?\n/).filter(Boolean);
  if (!lines.length) return [];

  const headers = parseRow(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseRow(line);
    return headers.reduce((row, header, index) => {
      row[header] = values[index] ? values[index].trim() : '';
      return row;
    }, {});
  });
}

function parseRow(row) {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < row.length; i += 1) {
    const char = row[i];

    if (inQuotes) {
      if (char === '"') {
        if (row[i + 1] === '"') {
          current += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
      continue;
    }

    if (char === ',') {
      values.push(current);
      current = '';
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      continue;
    }

    current += char;
  }

  values.push(current);
  return values.map((value) => value.trim());
}

function parseTags(tagString) {
  return tagString
    .split(/[,|;]/g)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function buildBusinessCard(data) {
  const card = document.createElement('article');
  card.className = 'business-card';

  // Logo rendering is disabled per request.
  // const logoWrapper = document.createElement('div');
  // logoWrapper.className = 'business-card__logo';
  //
  // if (data.logo) {
  //   const image = document.createElement('img');
  //   image.src = data.logo;
  //   image.alt = `${data.Title || 'Business'} logo`;
  //   image.loading = 'lazy';
  //   logoWrapper.appendChild(image);
  // } else {
  //   const placeholder = document.createElement('div');
  //   placeholder.className = 'business-card__logo--placeholder';
  //   placeholder.textContent = 'No logo provided.';
  //   logoWrapper.appendChild(placeholder);
  // }

  const body = document.createElement('div');
  body.className = 'business-card__body';

  const top = document.createElement('div');
  top.className = 'business-card__top';

  const title = document.createElement('h2');
  title.className = 'business-card__title';
  title.textContent = data.Title || 'Untitled Business';

  top.appendChild(title);

  if (data.Type) {
    const typePill = document.createElement('div');
    typePill.className = 'business-card__type';
    typePill.textContent = data.Type;
    top.appendChild(typePill);
  }

  body.appendChild(top);

  if (data.Description) {
    const description = document.createElement('p');
    description.className = 'business-card__description';
    description.textContent = data.Description;
    body.appendChild(description);
  }

  const tags = parseTags(data.Tags || '');
  if (tags.length) {
    const tagList = document.createElement('ul');
    tagList.className = 'business-card__tags';

    tags.forEach((tag) => {
      const tagItem = document.createElement('li');
      tagItem.className = 'business-card__tag';
      tagItem.textContent = tag;
      tagList.appendChild(tagItem);
    });

    body.appendChild(tagList);
  }

  const siteUrl = (data['Site URL'] || data['site url'] || data.URL || data.Url || '')
    .toString()
    .trim();

  if (siteUrl) {
    const footer = document.createElement('div');
    footer.className = 'business-card__footer';

    const link = document.createElement('a');
    link.className = 'business-card__link';
    link.textContent = 'Visit Site';
    link.href = siteUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    footer.appendChild(link);

    body.appendChild(footer);
  }

  // logoWrapper is disabled, do not append it.
  card.appendChild(body);

  return card;
}

async function loadBusinesses() {
  const container = document.getElementById('businesses-grid');
  if (!container) return;

  container.innerHTML = '<div class="businesses-loading">Loading Non Profits…</div>';

  try {
    let businesses = [];

    if (BUSINESSES_CSV_URL.trim()) {
      const response = await fetch(BUSINESSES_CSV_URL, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`Unable to load sheet: ${response.status} ${response.statusText}`);
      }
      const csv = await response.text();
      businesses = parseCsv(csv);
    } else {
      businesses = SAMPLE_BUSINESSES;
    }

    if (!businesses.length) {
      throw new Error('No businesses were found. Check your spreadsheet URL and header names.');
    }

    container.innerHTML = '';
    businesses.forEach((business) => container.appendChild(buildBusinessCard(business)));
  } catch (error) {
    container.innerHTML = `<div class="businesses-error">${error.message}</div>`;
  }
}

window.addEventListener('DOMContentLoaded', () => {
  loadBusinesses();
  setupSearch();
});

function setupSearch() {
  const searchInput = document.getElementById('business-search');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    filterBusinesses(query);
  });
}

function filterBusinesses(query) {
  const cards = document.querySelectorAll('.business-card');
  cards.forEach((card) => {
    const title = card.querySelector('.business-card__title')?.textContent.toLowerCase() || '';
    const type = card.querySelector('.business-card__type')?.textContent.toLowerCase() || '';
    const description = card.querySelector('.business-card__description')?.textContent.toLowerCase() || '';
    const tags = Array.from(card.querySelectorAll('.business-card__tag')).map(tag => tag.textContent.toLowerCase()).join(' ');

    const searchableText = `${title} ${type} ${description} ${tags}`;
    const isVisible = !query || searchableText.includes(query);
    card.style.display = isVisible ? '' : 'none';
  });
}
