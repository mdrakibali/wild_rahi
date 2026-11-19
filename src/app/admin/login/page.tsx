'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePortfolio } from '@/context/PortfolioContext';
import { AdminLogin } from '@/components/admin/AdminLogin';

export default function AdminLoginPage() {
  const router = useRouter();
  const { adminUser, signInAdmin, databaseInfo, usingDefaultCredentials } = usePortfolio();

  useEffect(() => {
    if (adminUser) {
      router.push('/admin');
    }
  }, [adminUser, router]);

  const handleSignIn = async (email: string, pass: string) => {
    await signInAdmin(email, pass);
    router.push('/admin');
  };

  return (
    <AdminLogin
      onSignIn={handleSignIn}
      databaseInfo={databaseInfo}
      usingDefaultCredentials={usingDefaultCredentials}
    />
  );
}

