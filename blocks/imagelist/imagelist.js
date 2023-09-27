import { getMetadata } from '../../scripts/lib-franklin.js';
import { addElement } from '../../scripts/scripts.js';

/**
 * Loads a fragment.
 * @param {string} path The path to the fragment
 * @returns {Document} The document
 */
async function loadFragment(path) {
  if (path && path.startsWith('/')) {
    const resp = await fetch(path);
    if (resp.ok) {
      const parser = new DOMParser();
      return parser.parseFromString(await resp.text(), 'text/html');
    }
  }
  return null;
}

/**
 * @param {HTMLElement} block The header block element
 */
export default async function decorate(block) {
  const promises = [];

  const cards = addElement('div', { class: 'cards' });
  [...block.children].forEach((div) => {
    const link = div.querySelector('div>div>a');
    const path = link ? link.getAttribute('href') : block.textContent.trim();
    promises.push(loadFragment(path));
    div.remove();
  });

  Promise.all(promises).then((doc) => {
    const heroPicture = doc.querySelector('picture');
    const title = getMetadata('og:title', doc);

    const card = document.createElement('div');
    card.classList.add('card');

    const h4 = document.createElement('h4');
    h4.textContent = title;

    card.appendChild(heroPicture);
    card.appendChild(h4);

    const a = document.createElement('a');
    a.href = doc.querySelector('link').href;
    a.appendChild(card);

    cards.appendChild(a);
  });
  
  block.append(cards);

  const leftPaddle = addElement('button', { class: 'left-paddle paddle hidden' }, { innerText: '<' });
  const rightPaddle = addElement('button', { class: 'right-paddle paddle' }, { innerText: '>' });

  leftPaddle.addEventListener('click', ((e) => {
    const cds = e.target.parentElement;
    cds.scrollLeft -= 600;
    rightPaddle.classList.remove('hidden');
    rightPaddle.style.right = `${cards.scrollLeft + 12}px`;
    if (!((cds.scrollWidth - cds.clientWidth) > cds.scrollLeft)) e.target.classList.add('hidden');
    e.target.style.left = `${((cds.scrollLeft + 12))}px`;
  }));

  rightPaddle.addEventListener('click', ((e) => {
    const cds = e.target.parentElement;
    cds.scrollLeft += 600;
    leftPaddle.classList.remove('hidden');
    leftPaddle.style.left = `${cards.scrollLeft + 12}px`;
    if (!((cds.scrollWidth - cds.clientWidth) > cds.scrollLeft)) e.target.classList.add('hidden');
    e.target.style.right = `${((cds.scrollLeft - 12) * -1)}px`;
  }));
  block.prepend(leftPaddle);
  block.append(rightPaddle);
}
