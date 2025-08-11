import React from 'react';
import './NotificationBell.css';

const NotificationBell = ({ count = 0 }) => {
  return (
    <div className="center">
      <div className="notification icon">
        <i className="fa fa-bell" />
        {count > 0 && (
          <div className="notification-number bounce">
            {count}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationBell;
