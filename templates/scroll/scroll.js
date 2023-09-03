import { addElement } from '../../scripts/scripts.js';
import { getMetadata } from '../../scripts/lib-franklin.js';

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
  let adventures = await fetchAdventures(query);
  let cursor = adventures.data.adventurePaginated.pageInfo.endCursor;
  let hasNext = adventures.data.adventurePaginated.pageInfo.hasNextPage;
  const cardContainer = addElement('div', { class: 'card-container' });
  scrollContainer.append(cardContainer);
  let lastCard = scrollContainer.lastElementChild;

  let observer;
  const callback = async (array) => {
    array.forEach(async (card) => {
      if (card.isIntersecting) {
        adventures.data.adventurePaginated.edges.forEach((adventure) => {
          const cardContent = `
            <div class='card-image'>
              <img src='${getMetadata('urn:adobe:aem:editor:aemconnection')}${adventure.node.primaryImage.dm}' />
            </div> 
            <div class='card-content'>
              <h5>${adventure.node.title}</h5>
              <div class='description'>${adventure.node.description.html}</div>
            </div>`;

          const cardElem = addElement('div', { class: 'card', id: adventure.node.slug }, { innerHTML: cardContent });
          cardContainer.append(cardElem);
        });
        observer.unobserve(lastCard);
        if (hasNext) {
          console.log('requesting content');
          adventures = await fetchAdventures(query, cursor);
          cursor = adventures.data.adventurePaginated.pageInfo.endCursor;
          hasNext = adventures.data.adventurePaginated.pageInfo.hasNextPage;
          lastCard = scrollContainer.lastElementChild;
          observer.observe(scrollContainer.lastElementChild);
        }
      }
    });
  };

  observer = new IntersectionObserver(callback);
  observer.observe(lastCard);
}
