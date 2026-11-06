import Request from "@/config/apiConfig";

const Login=async(payload)=>Request({
    url:"auth/login",
    method:"POST",
    data:payload
})
const Register=async(payload)=>Request({
    url:"auth/register",
    method:"POST",
    data:payload
})

const AuthService={
    Login,
    Register
}

export default AuthService;