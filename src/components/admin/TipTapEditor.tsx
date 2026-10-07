'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

const BUTTONS = [
  { key: 'h2', label: 'H2', title: 'Subtítulo' },
  { key: 'bold', label: 'B', title: 'Negrito' },
  { key: 'italic', label: 'I', title: 'Itálico' },
  { key: 'bullet', label: '• Lista', title: 'Lista' },
  { key: 'ordered', label: '1. Lista', title: 'Lista numerada' },
  { key: 'quote', label: '“ ”', title: 'Citação' },
  { key: 'link', label: 'Link', title: 'Inserir link' },
  { key: 'clear', label: 'Limpar', title: 'Limpar formatação' },
] as const;

export function TipTapEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: { openOnClick: false, autolink: true },
      }),
    ],
    content: value,
    onUpdate: ({ editor: e }) => onChange(e.getHTML()),
    editorProps: {
      attributes: {
        'aria-label': 'Corpo da matéria',
      },
    },
  });

  function run(action: (chain: ReturnType<NonNullable<typeof editor>['chain']>) => ReturnType<NonNullable<typeof editor>['chain']>) {
    if (!editor) return;
    action(editor.chain().focus()).run();
  }

  function onClick(key: (typeof BUTTONS)[number]['key']) {
    if (!editor) return;
    switch (key) {
      case 'h2':
        run((c) => c.toggleHeading({ level: 2 }));
        break;
      case 'bold':
        run((c) => c.toggleBold());
        break;
      case 'italic':
        run((c) => c.toggleItalic());
        break;
      case 'bullet':
        run((c) => c.toggleBulletList());
        break;
      case 'ordered':
        run((c) => c.toggleOrderedList());
        break;
      case 'quote':
        run((c) => c.toggleBlockquote());
        break;
      case 'link': {
        const prev = editor.getAttributes('link').href as string | undefined;
        const url = window.prompt('URL do link:', prev ?? 'https://');
        if (url === null) return;
        if (url === '' || url === 'https://') {
          run((c) => c.unsetMark('link'));
        } else {
          run((c) => c.setLink({ href: url }));
        }
        break;
      }
      case 'clear':
        run((c) => c.unsetAllMarks().clearNodes());
        break;
    }
  }

  if (!editor) {
    return (
      <div className="min-h-96 border border-rule-2 bg-paper" aria-hidden />
    );
  }

  return (
    <div className="border border-rule-2 bg-paper">
      <div className="flex flex-wrap gap-1 border-b border-rule bg-paper-2 p-2">
        {BUTTONS.map((btn) => (
          <button
            key={btn.key}
            type="button"
            title={btn.title}
            onClick={() => onClick(btn.key)}
            className={`min-w-9 px-2.5 py-1.5 text-sm font-semibold transition-colors ${
              (btn.key === 'bold' && editor.isActive('bold')) ||
              (btn.key === 'italic' && editor.isActive('italic')) ||
              (btn.key === 'h2' && editor.isActive('heading', { level: 2 })) ||
              (btn.key === 'bullet' && editor.isActive('bulletList')) ||
              (btn.key === 'ordered' && editor.isActive('orderedList')) ||
              (btn.key === 'quote' && editor.isActive('blockquote')) ||
              (btn.key === 'link' && editor.isActive('link'))
                ? 'bg-ink text-paper'
                : 'text-ink-2 hover:bg-paper-3 hover:text-ink'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
