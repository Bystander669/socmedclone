"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createComment(postId: string, formData: FormData) {
  const content = (formData.get("content") as string)?.trim();
  if (!content) return { error: "Comment is required" };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("comments").insert({
    post_id: postId,
    user_id: user.id,
    content,
  });
  if (error) return { error: error.message };
  revalidatePath("/");
  return { error: null };
}

export async function updateComment(commentId: string, formData: FormData) {
  const content = (formData.get("content") as string)?.trim();
  if (!content) return { error: "Comment is required" };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("comments")
    .update({ content, updated_at: new Date().toISOString() })
    .eq("id", commentId)
    .eq("user_id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/");
  return { error: null };
}

export async function deleteComment(commentId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId)
    .eq("user_id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/");
  return { error: null };
}
