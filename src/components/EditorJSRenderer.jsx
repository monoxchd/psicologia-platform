import React from 'react';

/**
 * EditorJS Renderer Component
 *
 * Renders EditorJS JSON blocks as HTML
 *
 * @param {Object} props
 * @param {Object} props.data - EditorJS data object with blocks array
 * @param {String} props.className - Additional CSS classes
 */
const EditorJSRenderer = ({ data, className = '' }) => {
  if (!data || !data.blocks || !Array.isArray(data.blocks)) {
    return null;
  }

  const renderBlock = (block, index) => {
    const { type, data: blockData } = block;

    switch (type) {
      case 'header':
        return renderHeader(blockData, index);

      case 'paragraph':
        return renderParagraph(blockData, index);

      case 'list':
        return renderList(blockData, index);

      case 'quote':
        return renderQuote(blockData, index);

      case 'code':
        return renderCode(blockData, index);

      case 'image':
        return renderImage(blockData, index);

      case 'embed':
        return renderEmbed(blockData, index);

      default:
        console.warn(`Unknown block type: ${type}`);
        return null;
    }
  };

  const renderHeader = (data, index) => {
    const { text, level } = data;
    const Tag = `h${level}`;

    const levelClasses = {
      1: 'text-4xl font-bold mt-8 mb-4',
      2: 'text-3xl font-bold mt-6 mb-3',
      3: 'text-2xl font-semibold mt-5 mb-2',
      4: 'text-xl font-semibold mt-4 mb-2',
    };

    return (
      <Tag
        key={index}
        className={levelClasses[level] || levelClasses[2]}
        dangerouslySetInnerHTML={{ __html: text }}
      />
    );
  };

  const renderParagraph = (data, index) => {
    const { text } = data;

    return (
      <p
        key={index}
        className="mb-4 leading-relaxed text-gray-700"
        dangerouslySetInnerHTML={{ __html: text }}
      />
    );
  };

  const renderList = (data, index) => {
    const { style, items } = data;
    const Tag = style === 'ordered' ? 'ol' : 'ul';

    const listClasses = style === 'ordered'
      ? 'list-decimal list-inside mb-4 space-y-2 ml-4'
      : 'list-disc list-inside mb-4 space-y-2 ml-4';

    return (
      <Tag key={index} className={listClasses}>
        {items.map((item, itemIndex) => {
          // Handle nested items (EditorJS 2.x format)
          const content = typeof item === 'string' ? item : item.content;
          const nestedItems = typeof item === 'object' ? item.items : [];

          return (
            <li
              key={itemIndex}
              className="text-gray-700"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          );
        })}
      </Tag>
    );
  };

  const renderQuote = (data, index) => {
    const { text, caption } = data;

    return (
      <blockquote
        key={index}
        className="border-l-4 border-blue-500 pl-4 py-2 mb-4 italic bg-blue-50 rounded-r"
      >
        <p
          className="text-gray-800 mb-1"
          dangerouslySetInnerHTML={{ __html: text }}
        />
        {caption && (
          <cite className="text-sm text-gray-600 not-italic">
            — {caption}
          </cite>
        )}
      </blockquote>
    );
  };

  const renderCode = (data, index) => {
    const { code } = data;

    return (
      <pre
        key={index}
        className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto mb-4 text-sm"
      >
        <code>{code}</code>
      </pre>
    );
  };

  const renderImage = (data, index) => {
    const { file, caption, withBorder, stretched, withBackground } = data;

    if (!file || !file.url) {
      return null;
    }

    const imageClasses = [
      'mb-4 rounded-lg',
      withBorder ? 'border border-gray-300' : '',
      stretched ? 'w-full' : 'max-w-full mx-auto',
      withBackground ? 'bg-gray-100 p-4' : ''
    ].filter(Boolean).join(' ');

    return (
      <figure key={index} className="mb-6">
        <img
          src={file.url}
          alt={caption || 'Article image'}
          className={imageClasses}
        />
        {caption && (
          <figcaption className="text-center text-sm text-gray-600 mt-2 italic">
            {caption}
          </figcaption>
        )}
      </figure>
    );
  };

  const renderEmbed = (data, index) => {
    const { service, source, embed, width, height, caption } = data;

    if (!embed) {
      return null;
    }

    return (
      <figure key={index} className="mb-6">
        <div
          className="relative overflow-hidden rounded-lg"
          style={{ paddingBottom: '56.25%' }} // 16:9 aspect ratio
        >
          <iframe
            src={embed}
            className="absolute top-0 left-0 w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={caption || `${service} embed`}
          />
        </div>
        {caption && (
          <figcaption className="text-center text-sm text-gray-600 mt-2 italic">
            {caption}
          </figcaption>
        )}
      </figure>
    );
  };

  return (
    <div className={`editorjs-renderer prose prose-lg max-w-none ${className}`}>
      {data.blocks.map((block, index) => renderBlock(block, index))}
    </div>
  );
};

export default EditorJSRenderer;
