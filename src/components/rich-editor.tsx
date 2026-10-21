"use client";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
export function RichEditor({
  value,
  onChange,
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    immediatelyRender: false,
    editable: !disabled,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "prose",
        role: "textbox",
        "aria-label": "Descripción enriquecida",
        "aria-multiline": "true",
      },
    },
  });
  if (!editor) return <p>Cargando editor…</p>;
  return (
    <div>
      <div className="editor-toolbar">
        <button
          type="button"
          disabled={disabled}
          aria-pressed={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          Negrita
        </button>
        <button
          type="button"
          disabled={disabled}
          aria-pressed={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          Cursiva
        </button>
        <button
          type="button"
          disabled={disabled}
          aria-pressed={editor.isActive("heading", { level: 2 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          Subtítulo
        </button>
        <button
          type="button"
          disabled={disabled}
          aria-pressed={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          Lista
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => editor.chain().focus().undo().run()}
        >
          Deshacer
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
