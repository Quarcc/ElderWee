export default function Validation(values) {
    let errors = {};
    const email_pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const password_pattern =/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;


    if (!values.email) {
        errors.email = "Email is required for Log in";
    } else if (!email_pattern.test(values.email)) {
        errors.email = "Invalid Email Format";
    }

    if (!values.password) {
        errors.password = "Password is required";
    } else if (!password_pattern.test(values.password)) {
        errors.password = "Password did not match the required format";
    }

    return errors;
}
