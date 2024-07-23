/**
 * Utility functions for common validations.
 */
const validators = {

  validateTextLength: function(text, minLength = 1, maxLength) {
    if (typeof text !== 'string') {
      throw new Error('Input must be a string');
    }

    const length = text.trim().length;
    return length >= minLength && length <= maxLength;
  },

  validateAsInt: function(value) {
    // Check if the value is a number and has no decimal places
    return typeof value === 'number' && isFinite(value) && Math.floor(value) === value;
  }
};

export default validators;
