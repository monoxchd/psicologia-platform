import React, { useState, useRef } from 'react';
import EditorJSComponent from '../components/EditorJS';

/**
 * Test page for EditorJS component
 * Route: /editor-test
 */
const EditorTestPage = () => {
  const [savedData, setSavedData] = useState(null);
  const [autoSaveData, setAutoSaveData] = useState(null);
  const editorRef = useRef(null);

  // Sample initial data to demonstrate loading existing content
  const sampleData = {
    time: 1702647343289,
    blocks: [
      {
        type: "header",
        data: {
          text: "Bem-vindo ao Editor de Artigos!",
          level: 2
        }
      },
      {
        type: "paragraph",
        data: {
          text: "Este é um editor de texto rico baseado em blocos. Você pode criar diferentes tipos de conteúdo:"
        }
      },
      {
        type: "list",
        data: {
          style: "unordered",
          items: [
            "Títulos e subtítulos",
            "Parágrafos de texto",
            "Listas ordenadas e não ordenadas",
            "Citações",
            "Blocos de código",
            "Imagens",
            "Vídeos incorporados (YouTube, Vimeo, etc.)"
          ]
        }
      },
      {
        type: "quote",
        data: {
          text: "A simplicidade é o último grau de sofisticação.",
          caption: "Leonardo da Vinci"
        }
      },
      {
        type: "paragraph",
        data: {
          text: "Experimente editar este conteúdo ou apague tudo e comece do zero!"
        }
      }
    ],
    version: "2.28.2"
  };

  const handleChange = (data) => {
    // This fires on every change - good for auto-save
    setAutoSaveData(data);
  };

  const handleSave = async () => {
    if (editorRef.current) {
      const data = await editorRef.current.save();
      setSavedData(data);
      console.log('Saved data:', data);
    }
  };

  const handleClear = async () => {
    if (editorRef.current) {
      await editorRef.current.clear();
      setSavedData(null);
      setAutoSaveData(null);
    }
  };

  const handleLoadSample = () => {
    // To load new data, we need to recreate the component
    // For now, just refresh the page - in production we'd handle this better
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            EditorJS Test Page
          </h1>
          <p className="text-gray-600">
            Teste o editor de conteúdo rico. Experimente adicionar títulos, listas, imagens, código e mais!
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left column - Editor */}
          <div>
            <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
              <h2 className="text-xl font-semibold mb-4">Editor</h2>

              {/* Editor Component */}
              <EditorJSComponent
                ref={editorRef}
                data={sampleData}
                onChange={handleChange}
                holder="editorjs-test"
                placeholder="Comece a escrever algo incrível..."
              />

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSave}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  💾 Salvar Manualmente
                </button>

                <button
                  onClick={handleClear}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  🗑️ Limpar
                </button>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">💡 Dicas:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Pressione <kbd className="bg-blue-200 px-1 rounded">Enter</kbd> para criar um novo bloco</li>
                <li>• Pressione <kbd className="bg-blue-200 px-1 rounded">Tab</kbd> para indentar listas</li>
                <li>• Use o botão <strong>+</strong> para adicionar diferentes tipos de blocos</li>
                <li>• Arraste os blocos para reordenar</li>
                <li>• Selecione texto para formatar (negrito, itálico, link)</li>
              </ul>
            </div>
          </div>

          {/* Right column - JSON Output */}
          <div>
            {/* Manual Save Output */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
              <h2 className="text-xl font-semibold mb-4">
                Dados Salvos (Manual)
              </h2>
              {savedData ? (
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                  {JSON.stringify(savedData, null, 2)}
                </pre>
              ) : (
                <p className="text-gray-500 italic">
                  Clique em "Salvar Manualmente" para ver os dados JSON
                </p>
              )}
            </div>

            {/* Auto-save Output */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">
                Auto-Save (onChange)
              </h2>
              {autoSaveData ? (
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Blocos:</strong> {autoSaveData.blocks?.length || 0}
                  </p>
                  <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm max-h-[400px]">
                    {JSON.stringify(autoSaveData, null, 2)}
                  </pre>
                </div>
              ) : (
                <p className="text-gray-500 italic">
                  O conteúdo será mostrado aqui conforme você edita
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Understanding EditorJS Data */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">
            📚 Entendendo o Formato de Dados do EditorJS
          </h2>

          <p className="text-gray-700 mb-4">
            O EditorJS salva o conteúdo como um array de <strong>blocos</strong>, onde cada bloco tem um <code className="bg-gray-200 px-1 rounded">type</code> e <code className="bg-gray-200 px-1 rounded">data</code>:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Exemplo de Bloco de Parágrafo:</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`{
  "type": "paragraph",
  "data": {
    "text": "Meu texto aqui"
  }
}`}
              </pre>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Exemplo de Bloco de Título:</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`{
  "type": "header",
  "data": {
    "text": "Meu Título",
    "level": 2
  }
}`}
              </pre>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Exemplo de Lista:</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`{
  "type": "list",
  "data": {
    "style": "unordered",
    "items": ["Item 1", "Item 2"]
  }
}`}
              </pre>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Exemplo de Imagem:</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`{
  "type": "image",
  "data": {
    "file": {
      "url": "https://..."
    },
    "caption": "Legenda"
  }
}`}
              </pre>
            </div>
          </div>

          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800">
              <strong>⚠️ Próximos Passos:</strong> Vamos modificar o backend para aceitar e armazenar este formato JSON, e criar um componente para renderizar estes blocos na página de visualização do artigo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorTestPage;
