'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '~/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { success: false, message: error.message }
  }

  const role = data.user?.user_metadata?.role || 'user'

  revalidatePath('/', 'layout')
  
  if (role === 'admin') {
    redirect('/admin/fnb')
  } else {
    redirect('/')
  }
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const role = formData.get('role') as string || 'user'

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role,
      },
    },
  })

  if (error) {
    return { success: false, message: error.message }
  }

  revalidatePath('/', 'layout')
  
  if (role === 'admin') {
    redirect('/admin/fnb')
  } else {
    redirect('/')
  }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  
  revalidatePath('/', 'layout')
  redirect('/login')
}
