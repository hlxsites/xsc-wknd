import { addElement } from '../../scripts/scripts.js';
import { getMetadata } from '../../scripts/lib-franklin.js';
// import { createOptimizedPicture } from '../../scripts/lib-franklin.js';

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
        // console.log(createOptimizedPicture(`${getMetadata('urn:adobe:aem:editor:aemconnection')}${adventure.node.primaryImage.dm}`));

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
        observer.observe(scrollContainer.querySelector('.card:last-child'));
      }
    });
  };

  observer = new IntersectionObserver(callback);
  observer.observe(lastCard);
}
