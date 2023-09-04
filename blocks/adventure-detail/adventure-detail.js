export const adventureElements = [];

export default function decorate(block) {
  [...block.children].forEach((row) => {
    const regex = '/<(.|\n)*?>/';
    const content = row.querySelector('div > div').innerHTML.trim();
    if (!content.match(regex)) adventureElements.push(`<p>${content}</p>`);
    else adventureElements.push(content);
  });

  block.parentElement.remove();
}
