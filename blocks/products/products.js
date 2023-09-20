import { createOptimizedPicture } from '../../scripts/lib-franklin.js';
import { addElement } from '../../scripts/scripts.js';
async function loadFragment(path) {
  if (path && path.startsWith('/')) {
    const resp = await fetch(`${path}`);
    if (resp.ok) {
      return await resp.json();
    }
  }
  return null;
}

export default async function decorate(block) {
  const link = block.querySelector('a');
  const path = link ? link.getAttribute('href') : block.textContent.trim();
  const products = await loadFragment(`${path}?sheet=surfing`);
  const ul = addElement('ul', {class: 'product-list'});
  products.data.forEach((product) => {
    const li = document.createElement('li');
    const div = document.createElement('div');
    const picture = createOptimizedPicture(product.product_thumbnail_url);
    const span = addElement('span', {id: product.product_name}, { textContent: product.product_name});
    div.append(picture);
    div.append(span);
    li.append(div);
    ul.append(li);
  });
  link.replaceWith(ul);
}