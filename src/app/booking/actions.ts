'use server'

// 1. Import Supabase-nya kita buka (uncomment)
import { createClient } from '~/lib/supabase/server'
import type { Meja } from '~/types/models'

export async function cariMeja(_waktu: Date, _tanggal: string): Promise<Meja[] | null> {
  return null
}

export async function createBooking(
  userID: string, 
  mejaID: number, 
  durasi: number,
  makanan: { id: string; kuantitas: number }[],
  minuman: { id: string; kuantitas: number }[]
) {
  try {
    // 2. Inisialisasi koneksi ke Supabase
    const supabase = await createClient();

    // 3. Simpan data booking utama ke tabel (Asumsi nama tabel: 'pemesanan')
    const { data: bookingData, error: bookingError } = await supabase
      .from('pemesanan')
      .insert({ 
        user_id: userID, 
        meja_id: mejaID, 
        durasi: durasi 
      })
      .select() // Wajib pakai .select() untuk mendapatkan ID booking yang baru dibuat
      .single();

    if (bookingError) throw new Error(bookingError.message);

    // 4. Simpan data makanan dan minuman (kalau ada yang dipesan)
    const semuaItem = [...makanan, ...minuman];
    
    if (semuaItem.length > 0) {
      // Kita siapkan format datanya. (Asumsi nama tabel detail: 'pemesanan_detail')
      const detailPesanan = semuaItem.map(item => ({
        pemesanan_id: bookingData.id, // Ambil ID dari booking yang sukses di langkah 3
        item_id: item.id,
        kuantitas: item.kuantitas
      }));

      // Insert banyak data sekaligus (Bulk Insert)
      const { error: detailError } = await supabase
        .from('pemesanan_detail')
        .insert(detailPesanan);

      if (detailError) throw new Error(detailError.message);
    }

    return { 
        success: true, 
        message: "Data booking dan pesanan menu berhasil disimpan ke database!" 
    };

  } catch (error) {
    console.error("❌ Gagal query ke Supabase:", error);
    return { 
        success: false, 
        message: "Gagal menyimpan ke database, cek log terminal." 
    };
  }
}