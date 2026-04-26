export function scrapeLead() {
  console.log('Scrapping the lead');

  const nameEl = document.querySelector('h1[data-anonymize="person-name"]')
    || document.querySelector('main section div h1');

  if (!nameEl) {
    throw couldNotScrapeLeadErr();
  }
  const headerSection = nameEl.closest('section[class*="header"]');
  if (!headerSection) {
    throw couldNotScrapeLeadErr();
  }

  const name = nameEl.textContent.trim();
  const headline = headerSection.querySelector('[data-anonymize="headline"]')?.textContent.trim();
  const location = getLocation(headerSection);
  const about = document.querySelector('main section#about-section [data-anonymize="person-blurb"]')?.textContent.trim();

  const lead = {
    name,
    headline,
    location,
    about,
  };

  console.log('Scrapped lead:', lead)

  return lead;
}

function getLocation(headerSection: Element) {
  return headerSection
    .querySelector('svg path[d^="M8 1a5"]')
    ?.closest('div')
    ?.textContent
    ?.trim();
}

function couldNotScrapeLeadErr() {
  return new Error('Could not scrape the lead');
}
