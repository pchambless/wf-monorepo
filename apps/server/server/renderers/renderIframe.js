import logger from '../utils/logger.js';

function renderIframe(composite, instanceProps = {}, actions = {}) {
  logger.debug(`[renderIframe] Rendering Iframe: ${instanceProps.id || composite.name}`);

  const props = { ...composite.props, ...instanceProps };
  const id = props.id || 'iframe-container';
  const src = props.src || '';
  const title = props.title || 'Iframe';
  const height = props.height || '500px';
  const width = props.width || '100%';

  if (!src) {
    return `
      <div id="${id}" style="padding: 16px; color: #999;">
        <p>No iframe source URL provided</p>
      </div>
    `;
  }

  return `
    <iframe
      id="${id}"
      src="${src}"
      title="${title}"
      style="
        width: ${width};
        height: ${height};
        border: 1px solid #e0e0e0;
        border-radius: 6px;
      "
    />
  `;
}

export default renderIframe;
