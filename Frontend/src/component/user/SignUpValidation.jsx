const Validation = (values) => {
    const errors = {};
    const today = new Date();
    const birthDate = new Date(values.dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    console.log('Birth Date:', birthDate);
    console.log('Calculated Age:', age);

    if (!values.fullName) {
        errors.fullName = 'Full Name is required';
    }

    if (!values.email) {
        errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(values.email)) {
        errors.email = 'Email is invalid';
    }

    if (!values.dob) {
        errors.dob = 'Date of Birth is required';
    } else if (age < 18) {
        errors.dob = 'You must be at least 18 years old to sign up';
    }

    if (!values.phoneNo) {
        errors.phoneNo = 'Phone Number is required';
    } else if (!/^\d{8}$/.test(values.phoneNo)) {  // Assuming an 8-digit phone number
        errors.phoneNo = 'Phone Number is invalid';
    }

    if (!values.password) {
        errors.password = 'Password is required';
    } else if (values.password.length < 8) {
        errors.password = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(values.password)) {
        errors.password = 'Password must contain at least one uppercase letter';
    } else if (!/[a-z]/.test(values.password)) {
        errors.password = 'Password must contain at least one lowercase letter';
    } else if (!/\d/.test(values.password)) {
        errors.password = 'Password must contain at least one number';
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(values.password)) {
        errors.password = 'Password must contain at least one special character';
    }

    if (!values.password2) {
        errors.password2 = 'Confirm Password is required';
    } else if (values.password2 !== values.password) {
        errors.password2 = 'Passwords do not match';
    }
    return errors;
};

export default Validation;
