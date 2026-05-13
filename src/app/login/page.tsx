'use client'

import { useTransition, useState } from 'react'
import Link from 'next/link'
import { login } from './actions'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '~/components/ui/card'
import { Label } from '~/components/ui/label'
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'

function validateLogin(email: string, password: string): string | null {
  if (!email.trim()) return 'Email tidak boleh kosong'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Format email tidak valid'
  if (!password) return 'Password tidak boleh kosong'
  if (password.length < 6) return 'Password minimal 6 karakter'
  return null
}

export default function LoginPage() {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const email    = formData.get('email') as string
    const password = formData.get('password') as string

    const validationError = validateLogin(email, password)
    if (validationError) { setError(validationError); return }

    setError(null)
    startTransition(async () => {
      const result = await login(formData) as { success?: boolean; message?: string } | undefined
      if (result?.success === false) {
        setError(result.message ?? 'Email atau password salah')
      }
    })
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Masuk ke 8BPOS</CardTitle>
          <CardDescription>Masukkan email dan password kamu</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
            <div className="grid gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="contoh@email.com"
                autoComplete="email"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Min. 6 karakter"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? 'Memproses...' : 'Masuk'}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <p className="w-full text-center text-sm text-muted-foreground">
            Belum punya akun?{' '}
            <Link href="/signup" className="underline underline-offset-4 hover:text-primary">
              Daftar
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
