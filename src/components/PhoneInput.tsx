'use client';
import React, { useState, useEffect } from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { css } from '@emotion/css';

interface MobileNumberInputProps {
  onChange?: (value: string) => void;
}

const MobileNumberInput: React.FC<MobileNumberInputProps> = ({ onChange }) => {
  const [phone, setPhone] = useState('');

  const handleChange = (value: string) => {
    setPhone(value);
    
    // Pass the value to the parent component if onChange prop exists
    if (onChange) {
      onChange(value);
    }
  };

  // Define the CSS styles using Emotion
  const dropdownStyles = css`
    .country-list {
      .country {
        &:hover {
          background-color: transparent !important;
        }
        
        &.highlight {
          background-color: transparent !important;
        }
        
        /* Targeting the flag container */
        .react-tel-input .flag:hover, 
        .react-tel-input .flag:focus, 
        .react-tel-input .flag:active {
          background-color: transparent !important;
        }
      }
    }
  `;

  return (
    <div className={dropdownStyles}>
      <PhoneInput
        country={'in'}
        value={phone}
        onChange={handleChange}
        inputClass="
          !w-full !rounded-xs !border !px-6 !py-6 !text-base 
          !bg-[#f8f8f8] !text-body-color !border-stroke
          !outline-hidden !transition-all !duration-300
          focus:!border-primary 
          dark:!bg-[#2C303B] dark:!text-body-color-dark
          dark:!shadow-two dark:!border-transparent
          dark:focus:!border-primary dark:focus:!shadow-none
          !pl-14
        "
        buttonClass="dark:!bg-[#2C303B] !bg-[#f8f8f8] !hover:bg-[#2C303B] !border-none"
        dropdownClass="!bg-[#f8f8f8] dark:!bg-[#2C303B]"
      />
    </div>
  );
};

export default MobileNumberInput;