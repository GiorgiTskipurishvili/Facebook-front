import * as Yup from "yup"


export const registerSchema = Yup.object().shape({
    FirstName:Yup.string().trim().required("First Name is required"),
    LastName:Yup.string().trim().required("Last Name is required"),
    BirthDate:Yup.date()
        .typeError("Birth Date is required")
        .max(new Date(), "Birth Date can't be in the future")
        .required("Birth Date is required"),
    Gender:Yup.string().oneOf(['Male', 'Female'], "Gender must be either 'Male' or 'Female'").required("Gender is required"),
    Email:Yup.string().email("Invalid email").required("Email is required"),
    // server-ზე მინიმუმი 6-ია, ამიტომ აქაც 6
    Password:Yup.string().min(6,"Password must be at least 6 characters").required("Password is required")
})
