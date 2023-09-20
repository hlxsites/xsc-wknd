/*
 * Fragment Block
 * Include content from one Helix page in another.
 * https://www.hlx.live/developer/block-collection/fragment
 */

import {
  decorateMain,
  addElement
} from '../../scripts/scripts.js';

import {
  loadBlocks,
} from '../../scripts/lib-franklin.js';

/**
 * Loads a fragment.
 * @param {string} path The path to the fragment
 * @returns {HTMLElement} The root element of the fragment
 */
async function loadFragment(path) {
  if (path && path.startsWith('/')) {
    const resp = await fetch(`${path}.plain.html`);
    if (resp.ok) {
      const div = document.createElement('div');
      const frag = await resp.text()
      div.innerHTML = frag;
      decorateMain(div, false);
      await loadBlocks(div);
      return div;
    }
  }
  return null;
}

export default async function decorate(block) {
  const link = block.querySelector('a');
  const path = link ? link.getAttribute('href') : block.textContent.trim();
  const fragment = await loadFragment(path);
  if (fragment) {
    const fragmentSection = fragment.querySelector(':scope .section');
    if (fragmentSection) {
      block.closest('.section').classList.add(...fragmentSection.classList);
      block.closest('.fragment-wrapper').replaceWith(...fragmentSection.childNodes);
    }
    [...block.classList].forEach((cls) => {
      if (cls === 'modal') {
        const modal = document.querySelector('.modal');
        const close = addElement('a', { class: 'close', href: '#' });
        close.addEventListener('click', ((e) => {
          e.preventDefault();
          modal.classList.remove('visible');
        }));
        const div = document.createElement('div');
        [...modal.children].forEach((item) => {
          div.append(item);
        });
        div.append(close);
        modal.append(div);
      }
    });
  }
}

// [...block.classList].forEach((cls) => {
//   if (cls === 'modal') {
//     const close = addElement('a', { class: 'close', href: '#' });
//     close.addEventListener('click', ((e) => {
//       e.preventDefault();
//       block.parentElement.classList.remove('visible');
//     }));
//     block.querySelector('div').append(close);
//   }
// });