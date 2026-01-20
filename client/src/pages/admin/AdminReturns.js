import React from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminReturnsContent from '../../components/admin/AdminReturnsContent';

const AdminReturns = () => {
  return (
    <AdminLayout>
      <div className="p-6">
        <AdminReturnsContent />
      </div>
    </AdminLayout>
  );
};

export default AdminReturns;
