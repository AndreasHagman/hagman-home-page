import { cookies } from 'next/headers'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import PersonalHero from '@/components/personal/PersonalHero'
import HobbySection from '@/components/personal/HobbySection'
import PersonalImages from '@/components/personal/PersonalImages'

export const metadata = {
  title: 'About me — Andreas Hagman',
  description: 'The personal side of Andreas Hagman — hobbies, hikes, and my dog Caia.',
}

export default async function PersonalPage() {
  const cookieStore = await cookies()
  const isAdmin = cookieStore.get('admin_session')?.value === 'authenticated'

  return (
    <>
      <Navbar />
      <main>
        <PersonalHero />
        <HobbySection />
        <PersonalImages isAdmin={isAdmin} />
      </main>
      <Footer />
    </>
  )
}
