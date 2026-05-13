// A. KELAS MODEL (ENTITIES)

export interface User {
  userID: string; // Supabase menggunakan UUID String
  username: string; // Atau email dsb
  // password tidak disimpan di sini karena dikelola penuh oleh Supabase Auth
}

export interface Meja {
  mejaID: number;
  status: 'Tersedia' | 'Terpakai' | 'Maintenance';
  tarif: number;
}

export interface ItemPenjualan {
  itemID: number;
  namaItem: string;
  harga: number;
  kuantitas: number;
}

export interface DetailBooking {
  bookingID: number;
  waktuMulai: Date;
  waktuSelesai: Date;
  durasi: number;
}

export interface MenuFnB {
  menuID: number;
  nama: string;
  harga: number;
  stok: number;
  kategori: 'Makanan' | 'Minuman';
}

export interface Pemesanan {
  pemesananID: number;
  statusPembayaran: string;
  totalTagihan: number;

  // Composition Relasi
  listItemPenjualan: ItemPenjualan[];
  detailBooking: DetailBooking;
}
