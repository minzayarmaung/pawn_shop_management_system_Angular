import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {
  
  /**
   * NRC Validator - Myanmar National Registration Card format
   * Format: XX/XXXXXX(X) where X is alphanumeric
   * Example: 12/LAMANA(N), 1/MAHANA(N)
   */
static nrcValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null; // Let required validator handle empty values
    }

    const value = control.value.toString().trim();

    // Regex explanation:
    // ^(1[0-4]|[1-9]|[၁-၉]|၁[၀-၄]) => Numbers 1–14 (supports Myanmar and English digits)
    // \/                            => Slash
    // ([A-Z]{3,6}|[\u1000-\u109F]{3}) => Township code (English 3–6 letters OR Myanmar 3 letters)
    // \((N|နိုင်)\)                 => Citizen type (English (N) or Myanmar (နိုင်))
    // ([0-9]{6}|[၀-၉]{6})$         => 6 digits in either English or Myanmar

    const nrcPattern = /^(1[0-4]|[1-9]|[၁-၉]|၁[၀-၄])\/([A-Z]{3,6}|[\u1000-\u109F]{3})\((N|နိုင်)\)([0-9]{6}|[၀-၉]{6})$/;

    if (!nrcPattern.test(value)) {
      return {
        nrcInvalid: {
          message: 'NRC Invalid: Format should be like 12/လမန(နိုင်)၁၂၃၄၅၆ or 12/LAKANA(N)123456',
          actualValue: control.value,
          expectedFormat: '1-14/XXXXXX(N or နိုင်)000000'
        }
      };
    }

    return null;
  };
}



  /**
   * Myanmar Phone Number Validator
   * Accepts formats:
   * - 09XXXXXXXX (11 digits starting with 09)
   * - +9599XXXXXXXX (starting with +959)
   * - 9599XXXXXXXX (starting with 959)
   */
  static phoneNumberValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null; // Let required validator handle empty values
      }

      const phoneValue = control.value.toString().replace(/\s+/g, ''); // Remove spaces
      
      // Myanmar phone number patterns
      const patterns = [
        /^09\d{9}$/, // 09XXXXXXXXX (11 digits)
        /^\+9599\d{8}$/, // +9599XXXXXXXX
        /^9599\d{8}$/ // 9599XXXXXXXX
      ];

      const isValid = patterns.some(pattern => pattern.test(phoneValue));

      if (!isValid) {
        return {
          phoneInvalid: {
            message: 'Phone Invalid: Format should be like 09123456789',
            actualValue: control.value,
            expectedFormats: ['09XXXXXXXXX', '+9599XXXXXXXX', '9599XXXXXXXX']
          }
        };
      }

      return null;
    };
  }

  /**
   * Helper method to get error message for NRC
   */
  static getNrcErrorMessage(errors: ValidationErrors | null): string {
    if (!errors) return '';
    
    if (errors['required']) {
      return 'NRC is required';
    }
    
    if (errors['nrcInvalid']) {
      return errors['nrcInvalid'].message;
    }
    
    return '';
  }

  /**
   * Helper method to get error message for Phone
   */
  static getPhoneErrorMessage(errors: ValidationErrors | null): string {
    if (!errors) return '';
    
    if (errors['required']) {
      return 'Phone Number is required';
    }
    
    if (errors['phoneInvalid']) {
      return errors['phoneInvalid'].message;
    }
    
    return '';
  }
}