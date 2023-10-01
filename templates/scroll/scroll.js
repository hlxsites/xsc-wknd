import { addElement, useGraphQL } from '../../scripts/scripts.js';
import { createOptimizedPicture } from '../../scripts/aem.js';

export default async function decorate(block) {
  const scrollContainer = block.querySelector('.scroll-container');
  const query = scrollContainer.getAttribute('data-query');
  const cardContainer = addElement('div', { class: 'card-container' });
  scrollContainer.append(cardContainer);
  const lastCard = scrollContainer.lastElementChild;

  let observer;
  let cursor;
  let { adventures, environment } = await useGraphQL(query, cursor);// eslint-disable-line prefer-const, max-len
  let hasNext = true;
  let initial = true;
  const callback = async (array) => {
    array.forEach(async (card) => {
      if (card.isIntersecting && hasNext) {
        if (initial) initial = false;
        else ({ adventures } = await useGraphQL(query, cursor));
        cursor = adventures.data.adventurePaginated.pageInfo.endCursor;
        hasNext = adventures.data.adventurePaginated.pageInfo.hasNextPage;

        adventures.data.adventurePaginated.edges.forEach((adventure) => {
          const pic = createOptimizedPicture(`${environment}${adventure.node.primaryImage.dm}`, adventure.node.slug, true);
          [...pic.children].forEach((source) => {
            if (source.hasAttribute('srcset')) source.setAttribute('srcset', `${environment}${source.srcset}`);
            else if (source.hasAttribute('src')) {
              const { pathname } = new URL(source.src);
              source.setAttribute('src', `${environment}${pathname}`);
            }
          });
          const pattern = `
          <div class='card-image fade-in-image'></div> 
          <div class='card-content'>
            <div>
              <h5 itemProp='title' itemType='text' data-editor-itemlabel='Title'>${adventure.node.title}</h5>
              <div id='description'  itemProp='description' itemType='richtext' data-editor-itemlabel='Description'>${adventure.node.description.html}</div>
              <div class='detail-info-rail'>
                <div class='detail-info'>
                  <h6>Adventure Type</h6>
                  <span>${adventure.node.adventureType}</span>
                </div>
                <div class='detail-info'>
                  <h6>Trip Length</h6>
                  <span itemProp='tripLength' itemType='text' data-editor-itemlabel='Trip Length'>${adventure.node.tripLength}</span>
                </div>
                <div class='detail-info'>
                  <h6>Difficulty</h6>
                  <span>${adventure.node.difficulty}</span>
                </div>
                <div class='detail-info'>
                  <h6>Group Size</h6>
                  <span itemProp='groupSize' itemType='integer' data-editor-itemlabel='Group Size'>${adventure.node.groupSize}</span>
                </div>
              </div>
              <h6>Itinerary</h6>
              <div id='itinerary'>${adventure.node.itinerary.html}</div>
            </div>
            <div></div>
          </div>`;

          const editorProps = {
            itemID: `urn:aemconnection:${adventure.node.fragmentPath}/jcr:content/data/master`,
            itemType: 'reference',
            itemfilter: 'cf',
            class: 'card',
            id: adventure.node.slug,
          };

          const { pathname } = window.location;
          const lang = pathname.split('/')[1];
          const cardElem = addElement('div', editorProps, { innerHTML: pattern });
          const button = addElement('a', { class: 'button primary', href: `fragments/book?adventure=${adventure.node.slug}&activity=${adventure.node.activity.toLowerCase()}-${lang}` }, { innerText: 'Book Now' });
          cardElem.querySelector('.card-image').append(pic);
          cardElem.querySelector('.card-content > div:last-child').append(button);
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
