import { addElement } from '../../scripts/scripts.js';
import { createOptimizedPicture, getMetadata } from '../../scripts/lib-franklin.js';

async function fetchAdventures(query, cursor) {
  const url = cursor ? new URL(`${query}${cursor}`) : new URL(`${query}`);

  try {
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

    const error = new Error({
      code: 500,
      message: 'login error',
    });

    if (resp.redirected) throw (error);
    return resp.json();
  } catch (error) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(await error.text(), 'text/html');
    const payload = await JSON.parse(doc.querySelector('pre > code').textContent);
    return payload;
  }
}

export default async function decorate(block) {
  const scrollContainer = block.querySelector('.scroll-container');
  const query = scrollContainer.getAttribute('data-query');
  const cardContainer = addElement('div', { class: 'card-container' });
  scrollContainer.append(cardContainer);
  const lastCard = scrollContainer.lastElementChild;

  let observer;
  let adventures;
  let cursor;
  let hasNext = true;
  const callback = async (array) => {
    array.forEach(async (card) => {
      if (card.isIntersecting && hasNext) {
        adventures = await fetchAdventures(query, cursor);
        cursor = adventures.data.adventurePaginated.pageInfo.endCursor;
        hasNext = adventures.data.adventurePaginated.pageInfo.hasNextPage;

        adventures.data.adventurePaginated.edges.forEach((adventure) => {
          const pic = createOptimizedPicture(`${getMetadata('urn:adobe:aem:editor:aemconnection')}${adventure.node.primaryImage.dm}`, adventure.node.slug, true, [{ media: '(min-width: 600px)', width: '2000' }], true);
          const pattern = `
          <div class='card-image'></div> 
          <div class='card-content'>
            <div>
              <h5>${adventure.node.title}</h5>
              <div id='description'>${adventure.node.description.html}</div>
              <div class='detail-info-rail'>
                <div class='detail-info'>
                  <h6>Adventure Type</h6>
                  <span>${adventure.node.adventureType}</span>
                </div>
                <div class='detail-info'>
                  <h6>Trip Length</h6>
                  <span>${adventure.node.tripLength}</span>
                </div>
                <div class='detail-info'>
                  <h6>Difficulty</h6>
                  <span>${adventure.node.difficulty}</span>
                </div>
                <div class='detail-info'>
                  <h6>Group Size</h6>
                  <span>${adventure.node.groupSize}</span>
                </div>
              </div>
              <h6>Itinerary</h6>
              <div id='itinerary'>${adventure.node.itinerary.html}</div>
            </div>
            <div><a href='/' class='button primary'>Book Now</a></div>
          </div>`;

          const cardElem = addElement('div', { class: 'card', id: adventure.node.slug }, { innerHTML: pattern });
          cardElem.querySelector('.card-image').append(pic);
          cardContainer.append(cardElem);
        });
        observer.unobserve(lastCard);
        observer.observe(scrollContainer.querySelector('.card:last-child'));
      }
    });
  };

  observer = new IntersectionObserver(callback);
  observer.observe(lastCard);
}
