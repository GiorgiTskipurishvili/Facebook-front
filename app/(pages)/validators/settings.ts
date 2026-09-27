import * as Yup from "yup"


export const profileSchema = Yup.object().shape({
    FirstName:Yup.string().trim().required("სახელი აუცილებელია"),
    LastName:Yup.string().trim().required("გვარი აუცილებელია"),
    BirthDate:Yup.string().required("დაბადების თარიღი აუცილებელია"),
    Gender:Yup.string().oneOf(["Male", "Female"], "აირჩიეთ სქესი").required("აირჩიეთ სქესი"),
    Bio:Yup.string().max(200, "მაქსიმუმ 200 სიმბოლო").default("")
})

export const passwordSchema = Yup.object().shape({
    currentPassword:Yup.string().required("შეიყვანეთ მიმდინარე პაროლი"),
    newPassword:Yup.string().min(6, "პაროლი უნდა შეიცავდეს მინიმუმ 6 სიმბოლოს").required("შეიყვანეთ ახალი პაროლი"),
    confirmPassword:Yup.string()
        .oneOf([Yup.ref("newPassword")], "პაროლები არ ემთხვევა")
        .required("გაიმეორეთ ახალი პაროლი")
})
