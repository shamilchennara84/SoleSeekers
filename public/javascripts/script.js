function printError(elemId, hintMsg) {
  document.getElementById(elemId).innerHTML = hintMsg;
}
console.log('started');

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
  console.log('name validation done');

  if (password == '') {
    printError('passErr', '!Please enter your password');
    isValid = false;
  } else {
    printError('passErr', '');
  }
  if(cpassword===""){
    printError('cPassErr', '!Confirm Password should not be blank');
    isValid = false;
  }
    else if (password !== '' && cpassword !== '' && password !== cpassword) {
    printError('cPassErr', '!Password does not match');
    isValid = false;
  } else {
    printError('cPassErr', '');
  }
  console.log('password validation done');

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
  console.log('email validation done');

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
  console.log('mobile validation done');

  // If all validation checks pass, allow the form submission
  if (isValid) {
    return true;
  } else {
    // Validation failed, prevent the form submission
    return false;
  }
}

const signupForm = document.getElementById('signupForm');

// Attach an event listener to the form's submit event
signupForm.addEventListener('submit', function (event) {
  console.log('event listener called');
  // Prevent the default form submission
  event.preventDefault();

  // Call the signupValidate function
  const isValid = signupValidate();

  // If validation fails, do not submit the form
  if (!isValid) {
    return false;
  }

  // If validation passes, you can manually submit the form
  // This will trigger the actual form submission to /register
  signupForm.submit();
});
