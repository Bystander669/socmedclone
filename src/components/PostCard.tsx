"use client";

import Image from "next/image";
import { useState } from "react";
import type { PostWithAuthor, CommentWithAuthor } from "@/types/database";
import { toggleLike, updatePost, deletePost } from "@/app/actions/posts";
import {
  createComment,
  updateComment,
  deleteComment,
} from "@/app/actions/comments";
import { formatDistanceToNow } from "date-fns";
import { formatPostContentToHtml } from "@/lib/format-content";

interface PostCardProps {
  post: PostWithAuthor;
  comments: CommentWithAuthor[];
  currentUserId: string | undefined;
}

export function PostCard({ post, comments, currentUserId }: PostCardProps) {
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [commentOpen, setCommentOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState("");
  const isOwner = currentUserId === post.user_id;

  async function handleUpdatePost(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData();
    formData.set("content", editContent);
    await updatePost(post.id, formData);
    setEditing(false);
  }

  async function handleDeletePost() {
    if (confirm("Delete this post?")) await deletePost(post.id);
  }

  async function handleToggleLike() {
    await toggleLike(post.id);
  }

  async function handleAddComment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData();
    formData.set("content", commentText);
    await createComment(post.id, formData);
    setCommentText("");
    setCommentOpen(false);
  }

  async function handleUpdateComment(commentId: string) {
    const formData = new FormData();
    formData.set("content", editCommentText);
    await updateComment(commentId, formData);
    setEditingCommentId(null);
  }

  async function handleDeleteComment(commentId: string) {
    if (confirm("Delete this comment?")) await deleteComment(commentId);
  }

  const displayName =
    post.profiles?.username ?? "Anonymous";
  const timeAgo = formatDistanceToNow(new Date(post.created_at), {
    addSuffix: true,
  });

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex gap-3">
        <div className="shrink-0">
          {post.profiles?.avatar_url ? (
            <Image
              src={post.profiles.avatar_url}
              alt=""
              width={44}
              height={44}
              className="rounded-full ring-2 ring-slate-100"
            />
          ) : (
            <div className="h-11 w-11 rounded-full bg-slate-200" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">
              {displayName}
            </span>
            <span className="text-sm text-slate-500">
              {timeAgo}
            </span>
            {isOwner && (
              <div className="ml-auto flex gap-1">
                {!editing ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setEditing(true)}
                      className="text-sm text-slate-500 hover:text-slate-700"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={handleDeletePost}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </>
                ) : null}
              </div>
            )}
          </div>

          {editing ? (
            <form onSubmit={handleUpdatePost} className="mt-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                required
                maxLength={280}
                rows={3}
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
              <div className="mt-2 flex gap-2">
                <button
                  type="submit"
                  className="rounded-xl bg-sky-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-sky-600"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setEditContent(post.content);
                  }}
                  className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <p
              className="mt-1 whitespace-pre-wrap text-slate-700 [&_strong]:font-semibold [&_em]:italic"
              dangerouslySetInnerHTML={{
                __html: formatPostContentToHtml(post.content),
              }}
            />
          )}

          <div className="mt-3 flex items-center gap-6">
            <button
              type="button"
              onClick={handleToggleLike}
              disabled={!currentUserId}
              className={`flex items-center gap-1.5 text-sm ${
                post.user_has_liked
                  ? "text-red-500"
                  : "text-slate-500 hover:text-slate-700"
              }`}
              title={currentUserId ? "Like" : "Sign in to like"}
            >
              <svg
                className="h-5 w-5"
                fill={post.user_has_liked ? "currentColor" : "none"}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <span>{post.likes_count ?? 0}</span>
            </button>
            <button
              type="button"
              onClick={() => setCommentOpen(!commentOpen)}
              disabled={!currentUserId}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 disabled:opacity-50"
              title={currentUserId ? "Comment" : "Sign in to comment"}
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <span>{comments.length}</span>
            </button>
          </div>

          {commentOpen && (
            <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
              {comments.map((c) => (
                <div
                  key={c.id}
                  className="flex gap-2 rounded-xl bg-slate-50 p-3"
                >
                  {c.profiles?.avatar_url ? (
                    <Image
                      src={c.profiles.avatar_url}
                      alt=""
                      width={28}
                      height={28}
                      className="shrink-0 rounded-full"
                    />
                  ) : (
                    <div className="h-7 w-7 shrink-0 rounded-full bg-slate-200" />
                  )}
                  <div className="min-w-0 flex-1">
                    <span className="text-sm font-medium text-slate-800">
                      {c.profiles?.username ?? "Anonymous"}
                    </span>
                    <span className="ml-2 text-xs text-slate-500">
                      {formatDistanceToNow(new Date(c.created_at), {
                        addSuffix: true,
                      })}
                    </span>
                    {editingCommentId === c.id ? (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleUpdateComment(c.id);
                        }}
                        className="mt-1"
                      >
                        <textarea
                          value={editCommentText}
                          onChange={(e) => setEditCommentText(e.target.value)}
                          required
                          rows={2}
                          className="w-full resize-none rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm text-slate-800 focus:border-sky-300 focus:outline-none"
                        />
                        <div className="mt-1 flex gap-2">
                          <button
                            type="submit"
                            className="text-xs font-medium text-sky-600 hover:text-sky-700"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingCommentId(null)}
                            className="text-xs text-slate-500"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <p className="mt-0.5 text-sm text-slate-700">
                        {c.content}
                      </p>
                    )}
                    {currentUserId === c.user_id &&
                      editingCommentId !== c.id && (
                        <div className="mt-1 flex gap-2 text-xs">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCommentId(c.id);
                              setEditCommentText(c.content);
                            }}
                            className="text-slate-500 hover:text-slate-700"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteComment(c.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                  </div>
                </div>
              ))}
              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  required
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600"
                >
                  Reply
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
