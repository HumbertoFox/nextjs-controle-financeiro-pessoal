import HomeMainComponent from '@/_components/home-main';
import { Button } from '@/_components/ui/button';
import { getSession } from '@/_lib/session';
import Link from 'next/link';

export default async function HomePage() {
  const session = await getSession();
  return (
    <div className="flex flex-col min-h-screen items-center bg-zinc-50 font-sans dark:bg-black">
      <header className="flex justify-end gap-2 w-full max-w-3xl px-1 py-2.5 bg-white dark:bg-black">
        {session ? (
          <Button
            asChild
            variant="outline"
            size="sm"
          >
            <Link href="/dashboard">Painel</Link>
          </Button>
        ) : (
          <>
            <Button
              asChild
              variant="outline"
              size="sm"
            >
              <Link href="/login">Conecte-se</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="sm"
            >
              <Link href="/register">Registre-se</Link>
            </Button>
          </>
        )}
      </header>
      <HomeMainComponent />
    </div>
  );
}