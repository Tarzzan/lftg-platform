import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function RootPage() {
  const cookieStore = cookies();
  const token = cookieStore.get('lftg_token')?.value 
    || cookieStore.get('token')?.value
    || cookieStore.get('lftg_session')?.value;

  if (token) {
    redirect('/admin');
  } else {
    redirect('/public');
  }
}
