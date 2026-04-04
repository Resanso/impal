'use server'

// import { createClient } from '~/lib/supabase/server'
import type { Meja } from '~/types/models'

export async function cariMeja(_waktu: Date, _tanggal: string): Promise<Meja[] | null> {
  // TODO: Implementasi query meja kosong menggunakan Supabase
  // const supabase = await createClient()
  // const { data } = await supabase.from('meja').select('*').eq('status', 'Tersedia')
  return null
}

export async function createBooking(_userID: string, _mejaID: number, _durasi: number) {
  // TODO: Implementasi pembuatan draf booking baru
  // const supabase = await createClient()
  // await supabase.from('pemesanan').insert({ ... })
}
