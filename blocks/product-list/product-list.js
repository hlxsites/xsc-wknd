import { fetchJson, addElement } from '../../scripts/scripts.js';
import { createOptimizedPicture } from '../../scripts/lib-franklin.js';

export default async function decorate(block) {
  const a = block.querySelector('a');
  const products = await fetchJson(a.href);

  a.parentElement.parentElement.remove();
  const container = addElement('div', { class: 'container' });
  products.data.forEach((productCard) => {
    const card = addElement('div', { class: 'card' });
    const model = addElement('h6', { class: 'model' }, { textContent: productCard.name });
    const price = addElement('p', { class: 'price' }, { textContent: Number(productCard.price).toLocaleString('en') });
    const imageComp = addElement('div', { class: 'image-cmp' });
    const image = createOptimizedPicture(productCard.images);
    imageComp.append(image);
    const colors = addElement('div', { class: 'color-swatch' });
    productCard.colors.split(',').forEach((color) => {
      colors.append(addElement('span', { class: 'color-dot', style: `background-color: #${color.trim()}` }));
    });
    const productLink = addElement('a', { href: `./motorcycles/${productCard.name.toLowerCase().replaceAll(' ', '-')}` });
    productLink.append(imageComp);
    productLink.append(model);
    productLink.append(price);
    productLink.append(colors);

    card.append(productLink);

    container.append(card);
  });

  block.append(container);
}
