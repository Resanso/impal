'use client'

import { useTransition, useState } from 'react'
import Link from 'next/link'
import { login } from './actions'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '~/components/ui/card'
import { Label } from '~/components/ui/label'
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'

export default function LoginPage() {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  
  const handleSubmit = (action: typeof login) => (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await action(formData) as { error?: string; success?: boolean; message?: string } | undefined
      if (result?.error || (result?.success === false && result?.message)) {
        setError(result?.error ?? result?.message ?? 'An error occurred')
      }
    })
  }

  return (
    <div className="flex h-screen w-full items-center justify-center px-4">
      <Card className="max-w-sm w-full mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Authentication</CardTitle>
          <CardDescription>
            Enter your email below to login or create a new account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <form id="auth-form" className="flex flex-col gap-4" onSubmit={handleSubmit(login)}>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required />
              </div>
              {error && (
                <div className="text-sm text-red-500 font-medium">{error}</div>
              )}
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? 'Processing...' : 'Login'}
              </Button>
            </form>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <div className="text-center text-sm text-muted-foreground w-full">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="underline underline-offset-4 hover:text-primary">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
