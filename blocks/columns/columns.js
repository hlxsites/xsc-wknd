export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        let position = picWrapper.textContent.trim();
        if (position) {
          position = position.replace('{', '');
          position = position.replace('}', '');
          const img = pic.querySelector('img');
          img.setAttribute('style', `object-position:${position}`);
        }
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-img-col');
        }
      }
    });
  });
}
