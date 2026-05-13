import { createClient } from '~/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { logout } from '~/app/login/actions'
import { User, Mail, Shield } from 'lucide-react'

export default async function ProfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Profil</h1>
        <p className="text-muted-foreground">Informasi akun kamu</p>
      </div>

      <div className="flex flex-col gap-4">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-3 py-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-3xl font-bold uppercase text-primary-foreground">
            {user?.email?.[0]}
          </div>
          <p className="font-semibold">{user?.email}</p>
        </div>

        {/* Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="size-4" /> Informasi Akun
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <div className="flex items-center gap-3">
              <Mail className="size-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="font-medium">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="size-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">User ID</p>
                <p className="font-mono text-xs">{user?.id}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logout */}
        <form action={logout}>
          <Button variant="destructive" className="w-full">
            Logout
          </Button>
        </form>
      </div>
    </div>
  )
}
