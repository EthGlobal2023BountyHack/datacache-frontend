import React, { useState } from 'react';
import classnames from 'classnames';

const Dropdown = ({ text, options = [], className = '', ...rest }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={classnames('relative', className, 'text-base')} {...rest}>
      <button
        onClick={handleToggleDropdown}
        className="flex items-center justify-between border w-full rounded-xl h-[40px] sm:h-[56px]"
      >
        <div className="flex items-center px-2 border-r w-[80%] h-full">
          <div className="rounded-full w-2 h-2 bg-lime ml-1 mr-2 shrink-0 "></div>
          <span className="truncate overflow-hidden whitespace-nowrap">{text}</span>
        </div>

        <div className="flex flex-grow justify-center">
          <svg className="w-2 h-7 sm:w-3" viewBox="0 0 10 7" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0.613565 2.61334L4.0669 6.06668C4.5869 6.58668 5.4269 6.58668 5.9469 6.06668L9.40023 2.61334C10.2402 1.77334 9.64023 0.333344 8.45356 0.333344H1.5469C0.360231 0.333344 -0.226435 1.77334 0.613565 2.61334Z"
              fill="white"
            />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 w-full border bg-primary-dark hover:text-black">
          {options.map((option, index) => (
            <button
              key={index}
              className="w-full text-left px-4 py-2 hover:bg-gray-100"
              onClick={() => {
                setIsOpen(false);
                option.callback && option.callback();
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
