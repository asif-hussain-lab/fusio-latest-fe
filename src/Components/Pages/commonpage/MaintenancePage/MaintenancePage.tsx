import React from 'react';
import './MaintenancePage.scss';

const MaintenancePage: React.FC = () => {
  return (
    <div className="maintenance-page">
      <div className="maintenance-content">
        <h1>Site Under Maintenance</h1>
        <p>We are currently performing scheduled maintenance to improve our services.</p>
        <p>Please check back later. We apologize for any inconvenience.</p>
      </div>
    </div>
  );
};

export default MaintenancePage;
