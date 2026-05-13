'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Clock, MapPin, UtensilsCrossed, CheckCircle, Loader2 } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { cariMeja, getMenuFnB, createBooking } from '../actions'
import type { Meja, MenuFnB } from '~/types/models'

// ─── Helpers ────────────────────────────────────────────────────────────────

const idr = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)

function addMinutes(time: string, mins: number) {
  const [h, m] = time.split(':').map(Number)
  const total = (h ?? 0) * 60 + (m ?? 0) + mins
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

function hitungBiaya(tarif: number, durasi: number, cart: CartItem[]) {
  const biayaSewa = (durasi / 60) * tarif
  const totalFnb = cart.reduce((s, i) => s + i.qty * i.menu.harga, 0)
  return { biayaSewa, totalFnb, totalBiaya: biayaSewa + totalFnb }
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface CartItem { menu: MenuFnB; qty: number }
type Step = 'jadwal' | 'meja' | 'fnb' | 'ringkasan'

const DURASI_OPTIONS = [30, 60, 90, 120, 180]

// ─── Sub-components ──────────────────────────────────────────────────────────

function StepIndicator({ step }: { step: Step }) {
  const steps: Step[] = ['jadwal', 'meja', 'fnb', 'ringkasan']
  const labels = ['Jadwal', 'Meja', 'Menu', 'Konfirmasi']
  const current = steps.indexOf(step)
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
            i < current ? 'bg-primary text-primary-foreground' :
            i === current ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' :
            'bg-muted text-muted-foreground'
          }`}>
            {i < current ? <CheckCircle className="size-4" /> : i + 1}
          </div>
          <span className={`text-xs hidden sm:block ${i === current ? 'font-semibold' : 'text-muted-foreground'}`}>
            {labels[i]}
          </span>
          {i < steps.length - 1 && <div className="h-px w-8 bg-border" />}
        </div>
      ))}
    </div>
  )
}

function MejaCard({ meja, selected, onClick }: { meja: Meja; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-xl border-2 p-4 text-left transition-all ${
        selected
          ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
          : 'border-border hover:border-primary/50 hover:bg-muted/50'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="size-4 text-primary" />
          <span className="font-semibold">Meja #{meja.mejaID}</span>
        </div>
        {selected && <CheckCircle className="size-5 text-primary" />}
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{idr(meja.tarif)} / jam</p>
    </button>
  )
}

function QtyControl({ qty, onInc, onDec }: { qty: number; onInc: () => void; onDec: () => void }) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={onDec}
        disabled={qty === 0}
        className="flex h-7 w-7 items-center justify-center rounded-md border text-sm font-bold disabled:opacity-30 hover:bg-muted"
      >−</button>
      <span className="w-6 text-center text-sm font-medium">{qty}</span>
      <button
        onClick={onInc}
        className="flex h-7 w-7 items-center justify-center rounded-md border text-sm font-bold hover:bg-muted"
      >+</button>
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function BookingForm({ userID }: { userID: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  // Step state
  const [step, setStep] = useState<Step>('jadwal')

  // Step 1 — Jadwal
  const today = new Date().toISOString().split('T')[0]!
  const [tanggal, setTanggal] = useState(today)
  const [waktu, setWaktu] = useState('10:00')
  const [durasi, setDurasi] = useState(60)

  // Step 2 — Meja
  const [mejaDiTemukan, setMejaDiTemukan] = useState<Meja[]>([])
  const [selectedMeja, setSelectedMeja] = useState<Meja | null>(null)

  // Step 3 — F&B
  const [menuList, setMenuList] = useState<MenuFnB[]>([])
  const [cart, setCart] = useState<CartItem[]>([])

  // ── Handlers ────────────────────────────────────────────────────────────

  function handleCariMeja() {
    setError(null)
    startTransition(async () => {
      const result = await cariMeja(tanggal, waktu, durasi)
      if (result.error) { setError(result.error); return }
      setMejaDiTemukan(result.data ?? [])
      setSelectedMeja(null)
      setStep('meja')
    })
  }

  function handlePilihMeja(meja: Meja) {
    setSelectedMeja(meja)
    setError(null)
    startTransition(async () => {
      const result = await getMenuFnB()
      if (result.error) { setError(result.error); return }
      setMenuList(result.data ?? [])
      setCart([])
      setStep('fnb')
    })
  }

  function setQty(menu: MenuFnB, qty: number) {
    setCart(prev => {
      const exists = prev.find(i => i.menu.menuID === menu.menuID)
      if (qty <= 0) return prev.filter(i => i.menu.menuID !== menu.menuID)
      if (exists) return prev.map(i => i.menu.menuID === menu.menuID ? { ...i, qty } : i)
      return [...prev, { menu, qty }]
    })
  }

  function getQty(menuID: number) {
    return cart.find(i => i.menu.menuID === menuID)?.qty ?? 0
  }

  function handleKonfirmasi() {
    if (!selectedMeja) return
    setError(null)

    const waktuMulaiISO = new Date(`${tanggal}T${waktu}:00`).toISOString()
    const items = cart.map(i => ({
      menuID: i.menu.menuID,
      qty: i.qty,
      hargaSatuan: i.menu.harga,
    }))

    startTransition(async () => {
      const result = await createBooking(
        userID,
        selectedMeja.mejaID,
        selectedMeja.tarif,
        waktuMulaiISO,
        durasi,
        items
      )
      if (!result.success) { setError(result.error ?? 'Gagal membuat booking'); return }
      router.push(`/booking/${result.pemesananID}`)
    })
  }

  // ── Render ──────────────────────────────────────────────────────────────

  const biaya = selectedMeja ? hitungBiaya(selectedMeja.tarif, durasi, cart) : null

  return (
    <div>
      <StepIndicator step={step} />

      {error && (
        <div className="mb-4 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* STEP 1: Pilih Jadwal */}
      {step === 'jadwal' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="size-5" /> Pilih Jadwal
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="tanggal">Tanggal</Label>
              <Input
                id="tanggal"
                type="date"
                min={today}
                value={tanggal}
                onChange={e => setTanggal(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="waktu">Waktu Mulai</Label>
              <Input
                id="waktu"
                type="time"
                value={waktu}
                onChange={e => setWaktu(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Durasi</Label>
              <div className="flex flex-wrap gap-2">
                {DURASI_OPTIONS.map(d => (
                  <button
                    key={d}
                    onClick={() => setDurasi(d)}
                    className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                      durasi === d
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border hover:bg-muted'
                    }`}
                  >
                    {d < 60 ? `${d} menit` : `${d / 60} jam`}
                  </button>
                ))}
              </div>
            </div>
            <Button onClick={handleCariMeja} disabled={isPending} className="mt-2">
              {isPending ? <><Loader2 className="mr-2 size-4 animate-spin" /> Mencari...</> : 'Cari Meja Tersedia'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* STEP 2: Pilih Meja */}
      {step === 'meja' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="size-5" /> Pilih Meja
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {tanggal} pukul {waktu} — {waktu} s/d {addMinutes(waktu, durasi)} ({durasi} menit)
            </p>
          </CardHeader>
          <CardContent>
            {mejaDiTemukan.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                Tidak ada meja tersedia untuk jadwal ini.
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {mejaDiTemukan.map(meja => (
                  <MejaCard
                    key={meja.mejaID}
                    meja={meja}
                    selected={selectedMeja?.mejaID === meja.mejaID}
                    onClick={() => handlePilihMeja(meja)}
                  />
                ))}
              </div>
            )}
            <Button variant="outline" onClick={() => setStep('jadwal')} className="mt-4">
              <ChevronLeft className="mr-1 size-4" /> Ubah Jadwal
            </Button>
          </CardContent>
        </Card>
      )}

      {/* STEP 3: Pilih Menu F&B */}
      {step === 'fnb' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UtensilsCrossed className="size-5" /> Menu Makanan & Minuman
            </CardTitle>
            <p className="text-sm text-muted-foreground">Opsional — lewati jika tidak ingin memesan</p>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            {(['Makanan', 'Minuman'] as const).map(kategori => {
              const items = menuList.filter(m => m.kategori === kategori)
              if (items.length === 0) return null
              return (
                <div key={kategori}>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{kategori}</h3>
                  <div className="flex flex-col gap-2">
                    {items.map(menu => (
                      <div key={menu.menuID} className="flex items-center justify-between rounded-lg border px-3 py-2">
                        <div>
                          <p className="text-sm font-medium">{menu.nama}</p>
                          <p className="text-xs text-muted-foreground">{idr(menu.harga)}</p>
                        </div>
                        <QtyControl
                          qty={getQty(menu.menuID)}
                          onInc={() => setQty(menu, getQty(menu.menuID) + 1)}
                          onDec={() => setQty(menu, getQty(menu.menuID) - 1)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setStep('meja')}>
                <ChevronLeft className="mr-1 size-4" /> Ganti Meja
              </Button>
              <Button onClick={() => setStep('ringkasan')} className="flex-1">
                Lihat Ringkasan →
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 4: Ringkasan & Konfirmasi */}
      {step === 'ringkasan' && selectedMeja && biaya && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="size-5" /> Ringkasan Booking
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {/* Detail booking */}
            <div className="rounded-lg bg-muted/50 p-4 text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Meja</span>
                <span className="font-medium">Meja #{selectedMeja.mejaID}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tanggal</span>
                <span className="font-medium">{new Date(`${tanggal}T00:00`).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Waktu</span>
                <span className="font-medium">{waktu} – {addMinutes(waktu, durasi)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Durasi</span>
                <span className="font-medium">{durasi} menit</span>
              </div>
            </div>

            {/* F&B items */}
            {cart.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-semibold">Pesanan F&B</p>
                <div className="flex flex-col gap-1">
                  {cart.map(item => (
                    <div key={item.menu.menuID} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{item.menu.nama} ×{item.qty}</span>
                      <span>{idr(item.qty * item.menu.harga)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Biaya breakdown */}
            <div className="border-t pt-3 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Biaya Sewa ({durasi / 60} jam × {idr(selectedMeja.tarif)})</span>
                <span>{idr(biaya.biayaSewa)}</span>
              </div>
              {biaya.totalFnb > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total F&B</span>
                  <span>{idr(biaya.totalFnb)}</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-2 font-semibold text-base">
                <span>Total Tagihan</span>
                <span className="text-primary">{idr(biaya.totalBiaya)}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setStep('fnb')}>
                <ChevronLeft className="mr-1 size-4" /> Edit Menu
              </Button>
              <Button onClick={handleKonfirmasi} disabled={isPending} className="flex-1">
                {isPending ? <><Loader2 className="mr-2 size-4 animate-spin" /> Memproses...</> : 'Konfirmasi Booking'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
