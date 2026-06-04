import { adminRepository } from '@/_lib/adminrepository';
import RegisterAdminClient from './form-register-admin-client';
import { Metadata } from 'next';
import { Suspense } from 'react';
import { LoadingRegister } from '@/_components/loadings/loading-register';
import { getCsrfToken } from '@/_lib/csrf';

export const generateMetadata = async (): Promise<Metadata> => {
  const isAdmin = await adminRepository.getIsAdmin();
  return { title: isAdmin ? 'Registrar Usuário Individual' : 'Registrar Administrador' };
}

export default async function RegisterPage() {
  const [isAdmin, csrfToken] = await Promise.all([
    adminRepository.getIsAdmin(),
    getCsrfToken()
  ]);
  const Title = isAdmin ? 'Registrar Usuário Individual' : 'Registrar Administrador';
  return (
    <Suspense fallback={<LoadingRegister />}>
      <RegisterAdminClient
        TitleIntl={Title}
        csrfToken={csrfToken}
      />
    </Suspense>
  );
}