// Page wrapper renderer
function renderPage(composite, instanceProps = {}) {
  const props = { ...composite.props, ...instanceProps };
  const head = `
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${props.title || 'WhatsFresh'}</title>
    <script src="https://unpkg.com/htmx.org@1.9.10"></script>
    ${props.head || ''}
  `;
  const body = props.children || props.body || '';
  return `<!DOCTYPE html><html><head>${head}</head><body>${body}</body></html>`;
}
export default renderPage;
