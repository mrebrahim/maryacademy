import { createClient } from '@/lib/supabase/server'
import type { Tables } from '@/lib/supabase/database.types'

/**
 * Community reads.
 *
 * Every query here leans on RLS rather than filtering in TypeScript: a
 * member simply cannot select a group they do not qualify for, or a post
 * that is still pending and not theirs. Adding a `.eq('status','approved')`
 * on top would hide the bug if a policy were ever wrong, so it is left off
 * deliberately — except where an admin view genuinely wants pending rows.
 */

export type CommunityGroup = Pick<
  Tables<'community_groups'>,
  'id' | 'slug' | 'name_ar' | 'description_ar' | 'audience' | 'is_general' | 'is_active'
>

export type CommunityPost = Pick<
  Tables<'community_posts'>,
  'id' | 'kind' | 'title_ar' | 'body_ar' | 'link_url' | 'status' | 'created_at' | 'group_id'
> & { author: { full_name: string | null } | null }

export const AUDIENCE_LABELS_AR: Record<Tables<'community_groups'>['audience'], string> = {
  enrolled: 'للمشتركين في الدورات',
  not_enrolled: 'لغير المشتركين',
  everyone: 'مفتوح للجميع',
}

export const KIND_LABELS_AR: Record<Tables<'community_posts'>['kind'], string> = {
  question: 'سؤال',
  discussion: 'نقاش',
  resource: 'مصدر مفيد',
}

export async function getVisibleGroups(): Promise<CommunityGroup[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('community_groups')
    .select('id, slug, name_ar, description_ar, audience, is_general, is_active')
    .eq('is_active', true)
    .order('sort_order')

  if (error) {
    console.error('[getVisibleGroups]', error)
    return []
  }
  return data ?? []
}

export async function getGroupBySlug(slug: string): Promise<CommunityGroup | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('community_groups')
    .select('id, slug, name_ar, description_ar, audience, is_general, is_active')
    .eq('slug', slug)
    .maybeSingle()

  return data ?? null
}

export async function getGroupPosts(groupId: string): Promise<CommunityPost[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('community_posts')
    .select(
      'id, kind, title_ar, body_ar, link_url, status, created_at, group_id, author:profiles!community_posts_author_id_fkey(full_name)',
    )
    .eq('group_id', groupId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[getGroupPosts]', error)
    return []
  }

  return (data ?? []).map((row) => ({
    ...row,
    author: Array.isArray(row.author) ? (row.author[0] ?? null) : row.author,
  })) as CommunityPost[]
}

/** The moderation queue. Admin-only by RLS, not by anything checked here. */
export async function getPendingPosts(): Promise<(CommunityPost & { group_name: string })[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('community_posts')
    .select(
      'id, kind, title_ar, body_ar, link_url, status, created_at, group_id, author:profiles!community_posts_author_id_fkey(full_name), group:community_groups(name_ar)',
    )
    .eq('status', 'pending')
    .order('created_at')

  if (error) {
    console.error('[getPendingPosts]', error)
    return []
  }

  return (data ?? []).map((row) => {
    const group = Array.isArray(row.group) ? row.group[0] : row.group
    return {
      ...row,
      author: Array.isArray(row.author) ? (row.author[0] ?? null) : row.author,
      group_name: group?.name_ar ?? '—',
    }
  }) as (CommunityPost & { group_name: string })[]
}
