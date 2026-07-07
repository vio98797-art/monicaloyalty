// ==========================================
// Monica Energy Admin Authentication
// Version 1.0
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("loginForm");

    const username = document.getElementById("username");

    const password = document.getElementById("password");

    const remember = document.getElementById("remember");

    const message = document.getElementById("loginMessage");

    const togglePassword = document.getElementById("togglePassword");

    //-------------------------------------------------

    // Load Remember Me

    const savedUser = localStorage.getItem("admin_username");

    if(savedUser){

        username.value = savedUser;

        remember.checked = true;

    }

    //-------------------------------------------------

    // Show / Hide Password

    togglePassword.addEventListener("click",()=>{

        if(password.type==="password"){

            password.type="text";

            togglePassword.innerHTML='<i class="fa-solid fa-eye-slash"></i>';

        }else{

            password.type="password";

            togglePassword.innerHTML='<i class="fa-solid fa-eye"></i>';

        }

    });

    //-------------------------------------------------

    form.addEventListener("submit",(e)=>{

        e.preventDefault();

        message.style.color="#ff5b6e";

        message.innerHTML="";

        const user=username.value.trim();

        const pass=password.value.trim();

        if(user===""){

            message.innerHTML="Please enter username.";

            username.focus();

            return;

        }

        if(pass===""){

            message.innerHTML="Please enter password.";

            password.focus();

            return;

        }

        //-------------------------------------------------
        // Temporary Login
        // Replace with real authentication later
        //-------------------------------------------------

        if(user==="admin" && pass==="admin123"){

            if(remember.checked){

                localStorage.setItem("admin_username",user);

            }else{

                localStorage.removeItem("admin_username");

            }

            localStorage.setItem("admin_logged_in","true");

            message.style.color="#16C784";

            message.innerHTML="Login Successful...";

            setTimeout(()=>{

                window.location.href="dashboard.html";

            },1200);

        }else{

            message.innerHTML="Invalid username or password.";

        }

    });

});