import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Quote from '@editorjs/quote';
import Code from '@editorjs/code';
import InlineCode from '@editorjs/inline-code';
import Embed from '@editorjs/embed';
import Image from '@editorjs/image';
import LinkTool from '@editorjs/link';

/**
 * EditorJS Component Wrapper
 *
 * @param {Object} props
 * @param {Object} props.data - Initial EditorJS data (JSON format)
 * @param {Function} props.onChange - Callback when content changes
 * @param {String} props.holder - ID for the editor container (default: 'editorjs')
 * @param {String} props.placeholder - Placeholder text
 * @param {Boolean} props.readOnly - Read-only mode
 */
const EditorJSComponent = forwardRef(({
  data = null,
  onChange = () => {},
  holder = 'editorjs',
  placeholder = 'Comece a escrever seu artigo...',
  readOnly = false
}, ref) => {
  const editorInstanceRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Don't initialize if already exists
    if (editorInstanceRef.current) {
      return;
    }

    // Add a small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      try {
        // Check if holder element exists
        const holderElement = document.getElementById(holder);
        if (!holderElement) {
          console.error(`EditorJS holder element with id "${holder}" not found`);
          setError(`Elemento holder "${holder}" não encontrado`);
          return;
        }

        console.log('Initializing EditorJS...');

        // Initialize EditorJS
        const editor = new EditorJS({
          holder: holder,

          tools: {
            header: {
              class: Header,
              config: {
                placeholder: 'Digite um título',
                levels: [2, 3, 4],
                defaultLevel: 2
              },
              inlineToolbar: true
            },

            list: {
              class: List,
              inlineToolbar: true,
              config: {
                defaultStyle: 'unordered'
              }
            },

            quote: {
              class: Quote,
              inlineToolbar: true,
              config: {
                quotePlaceholder: 'Digite uma citação',
                captionPlaceholder: 'Autor da citação'
              }
            },

            code: {
              class: Code,
              config: {
                placeholder: 'Digite seu código aqui'
              }
            },

            inlineCode: {
              class: InlineCode,
              shortcut: 'CMD+SHIFT+M'
            },

            embed: {
              class: Embed,
              config: {
                services: {
                  youtube: true,
                  vimeo: true,
                  twitter: true,
                  instagram: true
                }
              }
            },

            image: {
              class: Image,
              config: {
                uploader: {
                  /**
                   * Upload image by URL
                   */
                  uploadByUrl(url) {
                    return Promise.resolve({
                      success: 1,
                      file: {
                        url: url,
                      }
                    });
                  },

                  /**
                   * Upload image by file
                   * For now, we'll use a basic approach
                   * Later we can enhance this to upload to a server
                   */
                  uploadByFile(file) {
                    return new Promise((resolve, reject) => {
                      const reader = new FileReader();

                      reader.onload = (e) => {
                        resolve({
                          success: 1,
                          file: {
                            url: e.target.result, // base64 data URL
                            // In production, you'd want to upload to server and get URL
                          }
                        });
                      };

                      reader.onerror = (error) => {
                        reject(error);
                      };

                      reader.readAsDataURL(file);
                    });
                  }
                }
              }
            },

            linkTool: {
              class: LinkTool,
              config: {
                endpoint: '', // We can add a backend endpoint later for link previews
              }
            }
          },

          data: data,

          placeholder: placeholder,

          readOnly: readOnly,

          /**
           * onChange callback
           */
          onChange: async (api, event) => {
            try {
              // Get the saved data
              const savedData = await api.saver.save();
              onChange(savedData);
            } catch (err) {
              console.error('Error in onChange:', err);
            }
          },

          /**
           * onReady callback
           */
          onReady: () => {
            setIsReady(true);
            console.log('EditorJS is ready to work!');
          }
        });

        editorInstanceRef.current = editor;

      } catch (err) {
        console.error('Error initializing EditorJS:', err);
        setError(`Erro ao inicializar editor: ${err.message}`);
      }
    }, 100); // Small delay to ensure DOM is ready

    // Cleanup on unmount
    return () => {
      clearTimeout(timeoutId);
      if (editorInstanceRef.current && editorInstanceRef.current.destroy) {
        editorInstanceRef.current.destroy();
        editorInstanceRef.current = null;
      }
    };
  }, []); // Empty dependency array - only run once

  /**
   * Method to save data manually
   * Can be called from parent component via ref
   */
  const save = async () => {
    if (editorInstanceRef.current) {
      try {
        const outputData = await editorInstanceRef.current.save();
        return outputData;
      } catch (err) {
        console.error('Error saving:', err);
        return null;
      }
    }
    return null;
  };

  /**
   * Method to clear editor
   */
  const clear = async () => {
    if (editorInstanceRef.current) {
      try {
        await editorInstanceRef.current.clear();
      } catch (err) {
        console.error('Error clearing:', err);
      }
    }
  };

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    save,
    clear
  }));

  return (
    <div className="editorjs-wrapper">
      <div id={holder} className="prose max-w-none border border-gray-300 rounded-lg p-4 min-h-[400px] focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200" />

      {!isReady && !error && (
        <div className="text-center text-gray-500 mt-4">
          Carregando editor...
        </div>
      )}

      {error && (
        <div className="text-center text-red-500 mt-4 p-4 bg-red-50 rounded">
          <strong>Erro:</strong> {error}
        </div>
      )}
    </div>
  );
});

EditorJSComponent.displayName = 'EditorJSComponent';

export default EditorJSComponent;
