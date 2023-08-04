export default async function decorate(block) {
  const details = document.createElement('div');
  details.classList.add('adventure-details');

  const tabs = {
    overview: 'Overview',
    itinerary: 'Itinerary',
    'what-to-bring': 'What to Bring',
  };

  let first = true;
  // const tabElem = document.createElement('div');
  // tabElem.classList.add('tab-group');
  // details.append(tabElem);

  Object.keys(tabs).forEach((s) => {
    const input = document.createElement('input');
    input.setAttribute('type', 'radio');
    input.setAttribute('id', `tab-${s}`);
    input.setAttribute('name', 'tabGroup1');
    input.classList.add('tab');
    if (first) {
      input.checked = true;
      first = false;
    }
    details.append(input);
    const lbl = document.createElement('label');
    lbl.setAttribute('for', `tab-${s}`);
    lbl.textContent = tabs[s];
    details.append(lbl);
  });

  Object.keys(tabs).forEach((s) => {
    const blk = block.querySelector(`.section.${s}`);
    blk.removeAttribute('style');
    blk.setAttribute('id', s);
    details.append(blk);
  });
  block.append(details);
}
