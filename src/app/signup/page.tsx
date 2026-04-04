'use client'

import { useTransition, useState } from 'react'
import Link from 'next/link'
import { signup } from '~/app/login/actions'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '~/components/ui/card'
import { Label } from '~/components/ui/label'
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'

export default function SignupPage() {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await signup(formData) as { error?: string; success?: boolean; message?: string } | undefined
      if (result?.error || (result?.success === false && result?.message)) {
        setError(result?.error ?? result?.message ?? 'An error occurred during sign up')
      }
    })
  }

  return (
    <div className="flex h-screen w-full items-center justify-center px-4">
      <Card className="max-w-sm w-full mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Create an Account</CardTitle>
          <CardDescription>
            Enter your details below to sign up
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <form id="signup-form" className="flex flex-col gap-4" onSubmit={handleSubmit}>
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
                <Input id="password" name="password" type="password" required minLength={6} />
              </div>
              {error && (
                <div className="text-sm text-red-500 font-medium">{error}</div>
              )}
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? 'Creating account...' : 'Sign up'}
              </Button>
            </form>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <div className="text-center text-sm text-muted-foreground w-full">
            Already have an account?{' '}
            <Link href="/login" className="underline underline-offset-4 hover:text-primary">
              Log in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
