function printError(elemId, hintMsg) {
  document.getElementById(elemId).innerHTML = hintMsg;
}

function signupValidate() {
  console.log('validation started');
  const name = document.getElementById('name').value;
  const password = document.getElementById('password').value;
  const cpassword = document.getElementById('cPassword').value;
  const email = document.getElementById('email').value;
  const mobile = document.getElementById('mobile').value;
  let isValid = true; // Initialize a flag to track validation status

  if (name == '') {
    printError('nameErr', '!Please enter your name');
    isValid = false;
  } else {
    const regex = /^[a-zA-Z\s]+$/;
    if (regex.test(name) === false) {
      printError('nameErr', '!Please enter a valid name');
      isValid = false;
    } else {
      printError('nameErr', '');
    }
  }

  if (password == '') {
    printError('passErr', '!Please enter your password');
    isValid = false;
  } else {
    printError('passErr', '');
  }

  if (password !== '') {
    if(cpassword===''){
    printError('cPassErr', '!Please enter your password ');
    
  } else if(password!==cpassword) {
    printError('cPassErr', '!Password does not match');
    
  }}



  if (email == '') {
    printError('emailErr', '!Please enter your email address');
    isValid = false;
  } else {
    const regex = /^\S+@\S+\.\S+$/;
    if (regex.test(email) === false) {
      printError('emailErr', '!Please enter a valid email address');
      isValid = false;
    } else {
      printError('emailErr', '');
    }
  }
  if (mobile == '') {
    printError('mobileErr', '!Please enter your mobile number');
    isValid = false;
  } else {
    const regex = /^[1-9]\d{9}$/;
    if (regex.test(mobile) === false) {
      printError('mobileErr', '!Please enter a valid 10 digit mobile number');
      isValid = false;
    } else {
      printError('mobileErr', '');
    }
  }

  // Return false to prevent form submission if there are errors
  return isValid;
}
