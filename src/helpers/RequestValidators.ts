import { SignupRequest, LoginRequest } from "./Types";

const SignupRequestValidator = (body: SignupRequest): [boolean, string] => {
    if (!body.first_name) return [false, "first name"];
    if (!body.last_name) return [false, "last name"];
    if (!body.password) return [false, "password"];
    if(!body.uid) return [false, "uid"]
    if (!body.university_email) return [false, "email"];
    return [true, "success"];
};

const LoginRequestValidator = (body: LoginRequest): [boolean, string] => {
    if (!body.university_email) return [false, 'university email'];
    if (!body.password) return [false, 'password'];
    return [true, 'success']
}

export { SignupRequestValidator, LoginRequestValidator }