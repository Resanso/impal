'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '~/lib/supabase/server'

interface FnbItem {
  id: number
  nama: string
  harga: number
  stok: number
  kategori: 'Makanan' | 'Minuman'
}

export async function getFnbItems(): Promise<FnbItem[]> {
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
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { data, error } = await supabase
    .from('menu_fnb')
    .insert([{ nama, harga, stok, kategori }])
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath('/fnb')
  return (data as FnbItem) ?? ({} as FnbItem)
}

export async function updateFnbItem(
  id: number,
  updates: { nama?: string; harga?: number; stok?: number; kategori?: 'Makanan' | 'Minuman' }
): Promise<FnbItem> {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { data, error } = await supabase
    .from('menu_fnb')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath('/fnb')
  return (data as FnbItem) ?? ({} as FnbItem)
}

export async function deleteFnbItem(id: number): Promise<{ success: boolean }> {
  const supabase = await createClient()
  const { error } = await supabase.from('menu_fnb').delete().eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/fnb')
  return { success: true }
}
