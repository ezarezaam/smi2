import React from 'react';
import EmployeeManagement from '../components/Employee/EmployeeManagement';

const EmployeePage: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Employee Management</h1>
      <EmployeeManagement />
    </div>
  );
};

export default EmployeePage;
