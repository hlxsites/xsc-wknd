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

async function fetchAdventure(href) {
  const aem = getMetadata('urn:adobe:aem:editor:aemconnection');
  const { origin } = window.location;
  const pq = (origin.includes('.live') || origin.includes('.page')) ? aem.replace('author', 'publish') : aem;
  const url = new URL(`${pq}${ENDPOINT}${QUERY}${href}`);
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
  const categories = {
    overview: 'Overview',
    itinerary: 'Itinerary',
    gearList: 'What to Bring',
  };

  const slug = block.querySelector('div[data-slug]').getAttribute('data-slug');
  if (!slug) return;

  const gql = await fetchAdventure(slug);
  const adventure = gql.data.adventureList.items[0];

  Object.keys(categories).forEach((category) => {
    const body = document.createElement('div');
    const tab = block.querySelector(`div[data-tab-title$="${categories[category]}"]>div`);
    const picture = tab.querySelector('picture');
    [...tab.children].forEach((item) => {
      const regex = '{(.*?)}';

      if (item.textContent.match(regex)) {
        body.innerHTML = adventure[item.textContent.match(regex)[1]].html;
      }
      item.remove();
    });
    if (picture) body.append(picture);
    tab.append(body);

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

    tab.append(sideBar);
  });
}
