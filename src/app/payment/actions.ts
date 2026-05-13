'use server'

import { createClient } from '~/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

function adminSupabase() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

interface PaymentBookingDetail {
  id: number
  durasi: number
  waktu_mulai: string
  waktu_selesai: string
  status_pembayaran: string
  total_tagihan: number
  meja: { id: number; tarif: number } | null
  pemesanan_detail: Array<{
    id: number
    kuantitas: number
    sub_total: number
    menu_fnb: { nama: string } | null
  }>
}

interface PaymentRow {
  mayar_link: string | null
  status: string
}

interface InvoiceBookingRow {
  id: number
  total_tagihan: number
  meja_id: number
  durasi: number
  status_pembayaran: string
}

export async function getPaymentPageData(pemesananID: number) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Tidak terautentikasi' }

  const { data: booking, error } = await supabase
    .from('pemesanan')
    .select(`
      id, durasi, waktu_mulai, waktu_selesai, status_pembayaran, total_tagihan,
      meja:meja_id ( id, tarif ),
      pemesanan_detail (
        id, kuantitas, sub_total,
        menu_fnb:menu_fnb_id ( nama )
      )
    `)
    .eq('id', pemesananID)
    .eq('user_id', user.id)
    .single()

  if (error || !booking) return { data: null, error: 'Booking tidak ditemukan' }

  const { data: rawPayment } = await supabase
    .from('payment')
    .select('mayar_link, status')
    .eq('pemesanan_id', pemesananID)
    .maybeSingle()

  return {
    data: {
      booking: booking as unknown as PaymentBookingDetail,
      existingPayment: rawPayment as unknown as PaymentRow | null,
      userEmail: user.email ?? '',
    },
    error: null,
  }
}

export async function createMayarInvoice(
  pemesananID: number,
  namaPemesan: string,
  mobile: string
): Promise<{ link: string | null; error: string | null }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { link: null, error: 'Tidak terautentikasi' }

  const { data: rawBooking, error: bookingError } = await supabase
    .from('pemesanan')
    .select('id, total_tagihan, meja_id, durasi, status_pembayaran')
    .eq('id', pemesananID)
    .eq('user_id', user.id)
    .single()

  if (bookingError || !rawBooking) return { link: null, error: 'Booking tidak ditemukan' }
  const booking = rawBooking as unknown as InvoiceBookingRow
  if (booking.status_pembayaran === 'Lunas') return { link: null, error: 'Booking sudah lunas' }

  // Cek jika sudah ada invoice aktif
  const { data: rawExisting } = await supabase
    .from('payment')
    .select('mayar_link')
    .eq('pemesanan_id', pemesananID)
    .eq('status', 'pending')
    .maybeSingle()

  const existing = rawExisting as unknown as { mayar_link: string | null } | null
  if (existing?.mayar_link) return { link: existing.mayar_link, error: null }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const expiredAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

  const mayarRes = await fetch(`${process.env.MAYAR_API_URL}/invoice/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.MAYAR_API_KEY}`,
    },
    body: JSON.stringify({
      name: namaPemesan,
      email: user.email,
      mobile,
      description: `Booking Biliar 8BPOS #${pemesananID}`,
      expiredAt,
      redirectUrl: `${appUrl}/payment/${pemesananID}/success`,
      items: [
        {
          description: `Sewa Meja #${booking.meja_id} selama ${booking.durasi} menit`,
          quantity: 1,
          rate: booking.total_tagihan,
        },
      ],
      extraData: {
        pemesananId: String(pemesananID),
      },
    }),
  })

  if (!mayarRes.ok) {
    const errText = await mayarRes.text()
    return { link: null, error: `Mayar API error: ${errText}` }
  }

  const mayarData = (await mayarRes.json()) as {
    data?: { id?: string; link?: string }
  }

  const link = mayarData.data?.link ?? null
  if (!link) return { link: null, error: 'Tidak ada link dari Mayar' }

  await supabase.from('payment').upsert(
    {
      pemesanan_id: pemesananID,
      mayar_invoice_id: mayarData.data?.id ?? null,
      mayar_link: link,
      amount: booking.total_tagihan,
      status: 'pending',
    },
    { onConflict: 'pemesanan_id' }
  )

  return { link, error: null }
}

export async function getPaymentStatus(pemesananID: number) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('payment')
    .select('status, paid_at')
    .eq('pemesanan_id', pemesananID)
    .maybeSingle()
  return data
}

// Dipanggil dari success page: cek status ke Mayar API, update DB jika sudah dibayar
export async function verifyAndUpdatePayment(
  pemesananID: number
): Promise<'paid' | 'unpaid' | 'no_invoice'> {
  const supabase = await createClient()

  const { data: payment } = await supabase
    .from('payment')
    .select('mayar_invoice_id, status')
    .eq('pemesanan_id', pemesananID)
    .maybeSingle()

  if (!payment?.mayar_invoice_id) return 'no_invoice'
  if (payment.status === 'paid') return 'paid'

  const mayarRes = await fetch(
    `${process.env.MAYAR_API_URL}/invoice/${payment.mayar_invoice_id}`,
    {
      headers: { Authorization: `Bearer ${process.env.MAYAR_API_KEY}` },
      cache: 'no-store',
    }
  )

  if (!mayarRes.ok) return 'unpaid'

  const mayarData = (await mayarRes.json()) as { data?: { status?: string } }
  const mayarStatus = mayarData.data?.status

  if (mayarStatus === 'paid') {
    const admin = adminSupabase()
    await Promise.all([
      admin
        .from('payment')
        .update({ status: 'paid', paid_at: new Date().toISOString() })
        .eq('pemesanan_id', pemesananID),
      admin
        .from('pemesanan')
        .update({ status_pembayaran: 'Lunas' })
        .eq('id', pemesananID),
    ])
    return 'paid'
  }

  return 'unpaid'
}
