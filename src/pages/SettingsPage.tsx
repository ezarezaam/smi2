import React from 'react';
import { Outlet } from 'react-router-dom';

const SettingsPage: React.FC = () => {
  return (
    <div className="py-6 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <Outlet />
      </div>
    </div>
  );
};

export default SettingsPage;
