import ForgotPasswordPage from '@/features/auth/pages/ForgotPasswordPage'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Forgot Password',
  description: 'Forgot Password',
}

const page = () => {
  return (
    <ForgotPasswordPage />
  )
}

export default page