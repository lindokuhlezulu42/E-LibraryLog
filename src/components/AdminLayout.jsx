// src/components/AdminLayout.jsx
import React from 'react';
import AdminSidebar from './AdminSidebar';

function AdminLayout({ children }) {
  return (
    <div style={{ display: 'flex' }}>
      {/* Pass isOpen={true} to show sidebar text */}
      <AdminSidebar isOpen={true} />
      
      <main style={{ flex: 1, padding: '20px' }}>
        {children}
      </main>
    </div>
  );
}

export default AdminLayout;
