export class Validator {
  constructor(value, valueName) {
    this.value = value;
    this.valueName = valueName;
    this.errors = [];
  }

  notEmpty() {
    if (!this.value || this.value === '') {
      this.errors.push(`${this.valueName} value cannot be empty`);
    }

    return this;
  }

  min(min) {
    if (this.value < min) {
      this.errors.push(
        `${this.valueName} value must be greater than or equal to ${min}`,
      );
    }

    return this;
  }

  max(max) {
    if (this.value > max) {
      this.errors.push(
        `${this.valueName} value must be less than or equal to ${max}`,
      );
    }

    return this;
  }

  validate() {
    return {
      isValid: this.errors.length === 0,
      errors: this.errors,
    };
  }
}
