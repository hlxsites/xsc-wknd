import { fetchJson, addElement } from '../../scripts/scripts.js';
import { createOptimizedPicture, getMetadata } from '../../scripts/lib-franklin.js';

export default async function decorate(block) {
  const a = block.querySelector('a');
  const products = await fetchJson(a.href);

  a.parentElement.parentElement.remove();
  const product = getMetadata('og:title');
 
  const productDetail = addElement('div', { class: 'product-detail' });
  products.data.forEach((productCard) => {
    if (productCard.name === product) {
      const productTitle = addElement('h3', { class: 'product-title' }, { textContent: productCard.name });
      const productModel = addElement('h6', { class: 'product-model' }, { textContent: productCard.model });
      const productImage = createOptimizedPicture(productCard.images);

      productDetail.append(productTitle);
      productDetail.append(productModel);
      productDetail.append(productImage);
    }
  });
  

  block.append(productDetail);
}
