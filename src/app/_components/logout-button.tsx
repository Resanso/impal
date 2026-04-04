'use client'

import { logout } from '~/app/login/actions'
import { Button } from '~/components/ui/button'

export function LogoutButton() {
  return (
    <Button 
      variant="outline" 
      onClick={async () => {
        await logout()
      }}
    >
      Log out
    </Button>
  )
}
