import { getMetadata } from '../../scripts/lib-franklin.js';

const ENDPOINT = '/graphql/execute.json/harley-davidson/';
const QUERY = 'top-bikes';
const AEM = getMetadata('urn:adobe:aem:editor:aemconnection');
const BACKUP = '/fragments/adventure-six.plain.html';

async function fetchTopBikes(limit) {
  const url = new URL(`${AEM}${ENDPOINT}${QUERY}`);

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
    const resp = await fetch(BACKUP);
    const parser = new DOMParser();
    const doc = parser.parseFromString(await resp.text(), 'text/html');
    const payload = await JSON.parse(doc.querySelector('pre > code').textContent);

    return payload;
  }
}

export default async function decorate(block) {
  const limit = block.querySelector('div');
  const gql = await fetchTopBikes();
  
  limit.remove();

  const ul = document.createElement('ul');

  gql.data.popularBikesList.items[0].bike.forEach((item) => {
    const li = document.createElement('li');
    const div = document.createElement('div');
    const a = document.createElement('a');
    a.href = `/en/`;

    div.classList.add('cards-card-body');

    const p = document.createElement('p');
    p.innerHTML = `<strong>${item.name}</strong`;

    const image = document.createElement('img');
    image.src = `${AEM}${item.asset.dm}`;

    const divImage = document.createElement('div');
    divImage.classList.add('cards-card-image');
    divImage.append(image);

    div.append(p);
    li.append(a);
    a.append(div);
    a.append(divImage);

    ul.append(li);
  });
  block.append(ul);
}
