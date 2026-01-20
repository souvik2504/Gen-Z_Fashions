import React from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminSettingsContent from '../../components/admin/AdminSettingsContent';

const AdminSettings = () => {
  return (
    <AdminLayout>
      <div className="p-6">
        <AdminSettingsContent />
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
