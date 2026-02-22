"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { useCallback, useEffect, useRef } from "react";

type Props = {
  name: string;
  defaultValue?: string;
  placeholder?: string;
  minHeight?: string;
};

function MenuBar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;
  return (
    <div className="flex flex-wrap gap-1 border-b border-neutral-200 bg-neutral-50 p-2">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`rounded px-2 py-1 text-sm ${editor.isActive("bold") ? "bg-neutral-200" : "hover:bg-neutral-100"}`}
      >
        Bold
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`rounded px-2 py-1 text-sm ${editor.isActive("italic") ? "bg-neutral-200" : "hover:bg-neutral-100"}`}
      >
        Italic
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`rounded px-2 py-1 text-sm ${editor.isActive("heading", { level: 1 }) ? "bg-neutral-200" : "hover:bg-neutral-100"}`}
      >
        H1
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`rounded px-2 py-1 text-sm ${editor.isActive("heading", { level: 2 }) ? "bg-neutral-200" : "hover:bg-neutral-100"}`}
      >
        H2
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`rounded px-2 py-1 text-sm ${editor.isActive("bulletList") ? "bg-neutral-200" : "hover:bg-neutral-100"}`}
      >
        List
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`rounded px-2 py-1 text-sm ${editor.isActive("orderedList") ? "bg-neutral-200" : "hover:bg-neutral-100"}`}
      >
        Num list
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setLink({ href: "" }).run()}
        className={`rounded px-2 py-1 text-sm ${editor.isActive("link") ? "bg-neutral-200" : "hover:bg-neutral-100"}`}
      >
        Link
      </button>
    </div>
  );
}

export function BlogEditor({ name, defaultValue = "", placeholder, minHeight = "14rem" }: Props) {
  const hiddenRef = useRef<HTMLInputElement | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, HTMLAttributes: { target: "_blank", rel: "noopener" } }),
    ],
    content: defaultValue || "",
    editorProps: {
      attributes: {
        class: "prose prose-neutral max-w-none min-h-[12rem] px-3 py-2 text-sm focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      if (hiddenRef.current) hiddenRef.current.value = html;
    },
  });

  const setHiddenInput = useCallback(
    (el: HTMLInputElement | null) => {
      hiddenRef.current = el;
      if (el && editor) el.value = editor.getHTML();
    },
    [editor],
  );

  useEffect(() => {
    if (!editor) return;
    if (defaultValue) editor.commands.setContent(defaultValue, { emitUpdate: false });
    if (hiddenRef.current) hiddenRef.current.value = editor.getHTML();
  }, [editor]);

  return (
    <div className="overflow-hidden rounded-lg border border-neutral-300 bg-white">
      <input type="hidden" ref={setHiddenInput} name={name} defaultValue={defaultValue} />
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
