import React from 'react';
import Layout from '../components/Layout';
import ChangePassword from '../components/ChangePassword';

export default function ChangePasswordPage() {
  return (
    <Layout title="Account Security">
      <div className="flex justify-center items-start pt-8">
        <ChangePassword />
      </div>
    </Layout>
  );
}
