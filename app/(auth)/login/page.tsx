
import { Metadata } from 'next'
import LoginPage from '@/features/auth/pages/LoginPage'

export const metadata: Metadata = {
  title: 'Login',
  description: 'Login',
}

const page = () => {
  return (
   <LoginPage />
  )
}

export default page