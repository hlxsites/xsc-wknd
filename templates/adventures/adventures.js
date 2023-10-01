import { getMetadata } from '../../scripts/aem.js';
import { useGraphQL } from '../../scripts/scripts.js';

const QUERY = '/graphql/execute.json/aem-demo-assets/adventure-by-slug-v2;slug=';
const ADVENTUREDETAILS = {
  activity: 'Activity',
  adventureType: 'Adventure Type',
  tripLength: 'Trip Length',
  groupSize: 'Group Size',
  difficulty: 'Difficulty',
  price: 'Price',
};

export default async function decorate(block) {
  const categories = {
    overview: 'Overview',
    itinerary: 'Itinerary',
    gearList: 'What to Bring',
  };

  const slug = block.querySelector('div[data-slug]').getAttribute('data-slug');
  if (!slug) return;

  const aem = getMetadata('urn:adobe:aem:editor:aemconnection').startsWith('aem:')
    ? getMetadata('urn:adobe:aem:editor:aemconnection').replace('aem:', '')
    : getMetadata('urn:adobe:aem:editor:aemconnection');

  const { adventures } = await useGraphQL(`${aem}${QUERY}`, slug);
  const adventure = adventures.data.adventureList.items[0];

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
