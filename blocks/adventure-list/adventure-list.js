import { getMetadata } from '../../scripts/aem.js';

const ENDPOINT = '/graphql/execute.json/aem-demo-assets/';
const QUERY = 'adventure-six;limit=';
const AEM = getMetadata('urn:adobe:aem:editor:aemconnection');
const BACKUP = '/fragments/adventure-six.plain.html';

async function fetchAdventures(limit) {
  const url = new URL(`${AEM}${ENDPOINT}${QUERY}${limit}`);

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
  const gql = await fetchAdventures(limit.textContent.replace(/[\n\r]+|[\s]{2,}/g, ' ').trim());
  limit.remove();

  const ul = document.createElement('ul');

  gql.data.adventureList.items.forEach((item) => {
    const li = document.createElement('li');
    const div = document.createElement('div');
    const a = document.createElement('a');
    a.href = `/adventures/${item.slug}`;

    div.classList.add('cards-card-body');

    const p = document.createElement('p');
    p.innerHTML = `<strong>${item.title}</strong`;

    const image = document.createElement('img');
    image.src = `${AEM}${item.primaryImage.dm}`;

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
