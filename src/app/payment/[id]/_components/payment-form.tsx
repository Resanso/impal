'use client'

import { useState, useTransition } from 'react'
import { Loader2, CreditCard } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { createMayarInvoice } from '../actions'

interface PaymentFormProps {
  pemesananID: number
  defaultEmail: string
  existingLink: string | null
}

export function PaymentForm({ pemesananID, defaultEmail, existingLink }: PaymentFormProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [nama, setNama] = useState('')
  const [mobile, setMobile] = useState('')

  // Jika sudah ada invoice aktif, langsung tampilkan tombol lanjut
  if (existingLink) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">Invoice pembayaran sudah dibuat.</p>
        <a href={existingLink} target="_blank" rel="noopener noreferrer">
          <Button className="w-full" size="lg">
            <CreditCard className="mr-2 size-4" />
            Lanjut ke Halaman Pembayaran
          </Button>
        </a>
      </div>
    )
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    startTransition(async () => {
      const result = await createMayarInvoice(pemesananID, nama, mobile)
      if (result.error) {
        setError(result.error)
        return
      }
      // Redirect ke Mayar payment page
      if (result.link) window.location.href = result.link
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-2">
        <Label htmlFor="nama">Nama Lengkap</Label>
        <Input
          id="nama"
          placeholder="Nama sesuai identitas"
          value={nama}
          onChange={e => setNama(e.target.value)}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="mobile">No. WhatsApp</Label>
        <Input
          id="mobile"
          type="tel"
          placeholder="08123456789"
          value={mobile}
          onChange={e => setMobile(e.target.value)}
          required
        />
        <p className="text-xs text-muted-foreground">Konfirmasi pembayaran akan dikirim ke nomor ini</p>
      </div>
      <div className="grid gap-1 text-xs text-muted-foreground">
        <p>Email tagihan: <span className="font-medium text-foreground">{defaultEmail}</span></p>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Button type="submit" disabled={isPending} size="lg" className="mt-2">
        {isPending ? (
          <><Loader2 className="mr-2 size-4 animate-spin" /> Membuat Invoice...</>
        ) : (
          <><CreditCard className="mr-2 size-4" /> Bayar via Mayar</>
        )}
      </Button>
    </form>
  )
}
