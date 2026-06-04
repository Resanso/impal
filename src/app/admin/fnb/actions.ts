'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '~/lib/supabase/server'
import { createAdminClient } from '~/lib/supabase/admin'

export interface FnbItem {
  id: number
  nama: string
  harga: number
  stok: number
  kategori: 'Makanan' | 'Minuman'
}

async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.user_metadata?.role !== 'admin') {
    throw new Error('Akses ditolak. Anda bukan admin.')
  }
}

export async function getFnbItems(): Promise<FnbItem[]> {
  // Select is public, so standard client is fine
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('menu_fnb')
    .select('*')
    .order('kategori')

  if (error) throw new Error(error.message)
  return (data as FnbItem[]) ?? []
}

export async function createFnbItem(
  nama: string,
  harga: number,
  stok: number,
  kategori: 'Makanan' | 'Minuman'
): Promise<FnbItem> {
  await verifyAdmin()
  const adminSupabase = createAdminClient()
  
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { data, error } = await adminSupabase
    .from('menu_fnb')
    .insert([{ nama, harga, stok, kategori }])
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath('/admin/fnb')
  revalidatePath('/fnb')
  return (data as FnbItem) ?? ({} as FnbItem)
}

export async function updateFnbItem(
  id: number,
  updates: { nama?: string; harga?: number; stok?: number; kategori?: 'Makanan' | 'Minuman' }
): Promise<FnbItem> {
  await verifyAdmin()
  const adminSupabase = createAdminClient()
  
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { data, error } = await adminSupabase
    .from('menu_fnb')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath('/admin/fnb')
  revalidatePath('/fnb')
  return (data as FnbItem) ?? ({} as FnbItem)
}

export async function deleteFnbItem(id: number): Promise<{ success: boolean }> {
  await verifyAdmin()
  const adminSupabase = createAdminClient()
  
  const { error } = await adminSupabase.from('menu_fnb').delete().eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/fnb')
  revalidatePath('/fnb')
  return { success: true }
}
