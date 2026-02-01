"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { createPost } from "@/app/actions/posts";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-xl bg-sky-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-600 disabled:opacity-60"
    >
      {pending ? "Posting…" : "Post"}
    </button>
  );
}

function ToolbarButton({
  onClick,
  children,
  title,
}: {
  onClick: () => void;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-slate-800"
    >
      {children}
    </button>
  );
}

export function ComposeForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  function insertAtCursor(before: string, after: string) {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const text = ta.value;
    const selected = text.slice(start, end);
    const newText = text.slice(0, start) + before + selected + after + text.slice(end);
    ta.value = newText;
    ta.focus();
    ta.setSelectionRange(start + before.length, end + before.length);
  }

  async function handleSubmit(formData: FormData) {
    setError(null);
    const res = await createPost(formData);
    if (res.error) {
      setError(res.error);
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="mb-3 flex items-center gap-1 border-b border-slate-100 pb-3">
        <span className="text-xs font-medium text-slate-500">Format</span>
        <ToolbarButton
          title="Bold (**text**)"
          onClick={() => insertAtCursor("**", "**")}
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z" />
          </svg>
        </ToolbarButton>
        <ToolbarButton
          title="Italic (*text*)"
          onClick={() => insertAtCursor("*", "*")}
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z" />
          </svg>
        </ToolbarButton>
      </div>
      <label htmlFor="content" className="sr-only">
        What&apos;s happening?
      </label>
      <textarea
        ref={textareaRef}
        id="content"
        name="content"
        required
        maxLength={280}
        rows={8}
        placeholder="What's happening? Use **bold** and *italic* for formatting."
        className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-slate-800 placeholder-slate-400 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
        onChange={() => setError(null)}
      />
      <div className="mt-4 flex items-center justify-between">
        <Link
          href="/"
          className="text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          Cancel
        </Link>
        {error && (
          <p className="text-sm text-red-500" role="alert">
            {error}
          </p>
        )}
        <div className="ml-auto">
          <SubmitButton />
        </div>
      </div>
    </form>
  );
}
