import * as Yup from "yup"


export const loginSchema = Yup.object().shape({
    Email:Yup.string().email("Invalid email").required("Email is required"),
    // server-ზე მინიმუმი 6-ია, ამიტომ აქაც 6
    Password:Yup.string().min(6,"Password must be at least 6 characters").required("Password is required")
})
