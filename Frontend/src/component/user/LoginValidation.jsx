export default function Validation(values) {
    let errors = {};
    

    if (!values.email) {
        errors.email = "Email is required for Log in";
    }

    return errors;
}
