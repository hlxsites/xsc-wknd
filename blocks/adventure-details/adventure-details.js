import { getMetadata } from '../../scripts/lib-franklin.js';

const ENDPOINT = '/graphql/execute.json/aem-demo-assets/';
const QUERY = 'adventure-by-slug;slug=';
const ADVENTUREDETAILS = {
  activity: 'Activity',
  adventureType: 'Adventure Type',
  tripLength: 'Trip Length',
  groupSize: 'Group Size',
  difficulty: 'Difficulty',
  price: 'Price',
};

const TABS = {
  description: 'Overview',
  itinerary: 'Itinerary',
  gearList: 'What to Bring',
};

async function fetchAdventure(href) {
  const aem = getMetadata('urn:adobe:aem:editor:aemconnection');
  const url = new URL(`${aem}${ENDPOINT}${QUERY}${href}`);
  const resp = await fetch(
    url,
    {
      headers: {
        'Content-Type': 'text/html',
      },
      method: 'get',
      credentials: 'include',
    },
  );
  return resp.json();
}

export default async function decorate(block) {
  const link = block.querySelector('div');
  const linkText = link.textContent.replace(/[\n\r]+|[\s]{2,}/g, ' ').trim();

  if (!linkText) return;

  const gql = await fetchAdventure(linkText);
  const adventure = gql.data.adventureList.items[0];

  link.remove();

  // const heroContent = document.querySelector('.hero.block .hero-content');
  // heroContent.innerHTML = `<h1>${adventure.title}</h1>`;

  const tabPanels = document.createElement('div');
  tabPanels.classList.add('tab-panels');

  let first = true;

  Object.keys(TABS).forEach((s) => {
    const input = document.createElement('input');
    input.setAttribute('type', 'radio');
    input.setAttribute('id', `tab-${s.toLowerCase()}`);
    input.setAttribute('name', 'tab');
    input.classList.add('tab');
    if (first) {
      input.checked = true;
      first = false;
    }

    block.append(input);

    const lbl = document.createElement('label');
    lbl.setAttribute('for', `tab-${s.toLowerCase()}`);
    lbl.textContent = TABS[s];
    block.append(lbl);
  });

  Object.keys(TABS).forEach((s) => {
    const tabPanel = document.createElement('div');
    tabPanel.classList.add('tab-panel');
    tabPanel.classList.add(s.toLowerCase());
    tabPanel.innerHTML = `<div class='content-panel'>${adventure[s].html}</div>`;

    const sideBar = document.createElement('div');
    sideBar.classList.add('side-bar');

    Object.keys(ADVENTUREDETAILS).forEach((detail) => {
      const dt = document.createElement('dt');
      const dd = document.createElement('dd');
      const dl = document.createElement('dl');

      dt.textContent = ADVENTUREDETAILS[detail];
      dd.textContent = adventure[detail];
      dl.append(dt);
      dl.append(dd);
      sideBar.append(dl);
    });

    tabPanel.setAttribute('id', s);
    tabPanel.append(sideBar);
    tabPanels.append(tabPanel);
  });

  block.append(tabPanels);
}
