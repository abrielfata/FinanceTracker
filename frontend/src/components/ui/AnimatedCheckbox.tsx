import React, { forwardRef } from 'react';

interface AnimatedCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  id?: string;
}

const AnimatedCheckbox = forwardRef<HTMLInputElement, AnimatedCheckboxProps>(
  ({ label, id, className = '', ...props }, ref) => {
    return (
      <label className={`animated-checkbox-container ${className}`} htmlFor={id}>
        <input type="checkbox" id={id} ref={ref} {...props} />
        <div className="animated-checkbox-box">
          <svg viewBox="0 0 24 24">
            <path d="M 4 12 L 9 17 L 20 6" />
          </svg>
        </div>
        {label && (
          <span className="text-body-sm font-medium text-on-surface select-none">
            {label}
          </span>
        )}
      </label>
    );
  }
);

AnimatedCheckbox.displayName = 'AnimatedCheckbox';

export default AnimatedCheckbox;
