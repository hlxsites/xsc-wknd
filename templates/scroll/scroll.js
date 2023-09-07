import { addElement } from '../../scripts/scripts.js';
import { createOptimizedPicture, getMetadata } from '../../scripts/lib-franklin.js';

const defaultNodeMap = {
  'header': (node, children, style) => style[node.style]?.(node, children),
  'paragraph': (node, children) => `<p>${children}</p>`,
  'span': ({ format } , children) => `<span style=${format}>{children}</span>`,
  'unordered-list': (node, children) => `<ul>${children}</ul>`,
  'ordered-list': (node, children) => `<ol>${children}</ol>`,
  'list-item': (node, children) => `<li>${children}</li>`,
  'table': (node, children) => `<table>${children}</table>`,
  'table-body': (node, children) => `<tbody>${children}</tbody>`,
  'table-row': (node, children) => `<tr>${children}</tr>`,
  'table-data': (node, children) => `<td>${children}</td>`,
  'link': node => `<a href=${node.data.href} target=${node.data.target}>${node.value}</a>`,
  'text': (node, format) => defaultRenderText(node, format),
  'reference': (node) => defaultRenderImage(node),
};

/**
 * Map of JSON format variants to HTML equivalents
 */
const defaultTextFormat = {
  'bold': (value) => `<b>${value}</b>`,
  'italic': (value) => `<i>${value}</i>`,
  'underline': (value) => `<u>${value}</u>`,
  'strong': (value) => `<strong>${value}</strong>`,
  'emphasis': (value) => `<em>${value}</em>`,
};

/**
 * Renders an image based on a reference
 * @param {*} node 
 */
function defaultRenderImage(node) {
  const mimeType = node.data?.mimetype;
  if(mimeType && mimeType.startsWith('image')) {
      return `<img src=${node.data.path} alt={'reference'} />`
  }
  return null;
};

/**
 * Default renderer of Text nodeTypes
 * @param {*} node 
 * @returns 
 */
function defaultRenderText(node, format) {
  // iterate over variants array to append formatting
  if (node.format?.variants?.length > 0) {
      return node.format.variants.reduce((previousValue, currentValue) => {
          return format[currentValue]?.(previousValue) ?? null;
      }, node.value);
  }
  // if no formatting, simply return the value of the text
  return node.value;
}

/**
* Map of Header styles 
*/
const defaultHeaderStyle = {
  'h1': (node, children) => `<h1>${children}</h1>`,
  'h2': (node, children) => `<h2>${children}</h2>`,
  'h3': (node, children) => `<h3>${children}</h3>`
};

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

/**
 * Renders an individual node based on nodeType.
 * Makes a recursive call to render any children of the current node (node.content)
 * @param {*} node 
 * @param {*} options 
 * @returns 
 */
function renderNode(node, options) {
  const {nodeMap, textFormat, headerStyle} = options;

  // null check
  if(!node || !options) {
      return null;
  }

  const children = node.content ? renderNodeList(node.content, options) : null; 
  // special case for header, since it requires processing of header styles
  if(node.nodeType === 'header') {
      return nodeMap[node.nodeType]?.(node, children, headerStyle);
  }

  // special case for text, since it may require formatting (i.e bold, italic, underline)
  if(node.nodeType === 'text') {
      return nodeMap[node.nodeType]?.(node, textFormat);
  }

  // use a map to render the current node based on its nodeType
  // pass the children (if they exist)
  return nodeMap[node.nodeType]?.(node, children) ?? null;
}

/**
 * Iterates over an array of nodes and renders each node
 * @param {*} childNodes array of 
 * @returns 
 */
function renderNodeList(childNodes, options) {
  console.log(options);
  if(childNodes && options) {
      return childNodes.map((node, index) => {
          return renderNode(node, options), index;
      });
  }

  return null;
}

function mapJsonRichText(json, options={}) {
  // merge options override with default options for nodeMap, textFormat, and headerStyle
  return renderNodeList(json , {
      nodeMap: {
          ...defaultNodeMap,
          ...options.nodeMap,
      },
      textFormat: {
          ...defaultTextFormat,
          ...options.textFormat,
      },
      headerStyle: {
          ...defaultHeaderStyle,
          ...options.headerStyle
      }
  });
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
          const pic = createOptimizedPicture(`${getMetadata('urn:adobe:aem:editor:aemconnection')}${adventure.node.primaryImage.dm}`, adventure.node.slug, true, [{ media: '(min-width: 600px)', width: '2000' }], true);
          const pattern = `
          <div class='card-image'></div> 
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
            <div><a href='/' class='button primary'>Book Now</a></div>
          </div>`;

          const editorProps = {
            itemID: `urn:aemconnection:${adventure.node._path}/jcr:content/data/master`,
            itemType: 'reference',
            itemfilter: 'cf',
            class: 'card',
            id: adventure.node.slug
          };

          const cardElem = addElement('div', editorProps, { innerHTML: pattern });
          cardElem.querySelector('.card-image').append(pic);
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
