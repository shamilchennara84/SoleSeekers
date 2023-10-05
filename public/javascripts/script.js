function printError(elemId, hintMsg) {
  document.getElementById(elemId).innerHTML = hintMsg;
}


// ==========================signup validation=============================================
function signupValidate() {
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
  if (cpassword === '') {
    printError('cPassErr', '!Confirm Password should not be blank');
    isValid = false;
  } else if (password !== '' && cpassword !== '' && password !== cpassword) {
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



// ===================validation for login with email and password===============================================
function loginValidate() {
  const email = document.getElementById('lEmail').value;
  const password = document.getElementById('lPassword').value;

  let isValid = true;

  if (email == '') {
    printError('lEmailErr', '!Please enter your email address');
    isValid = false;
  } else {
    const regex = /^\S+@\S+\.\S+$/;
    if (regex.test(email) === false) {
      printError('lEmailErr', '!Please enter a valid email address');
      isValid = false;
    } else {
      printError('lEmailErr', '');
    }
  }

  if (password == '') {
    printError('lPassErr', '!Please enter your password');
    isValid = false;
  } else {
    printError('lPassErr', '');
  }

  if (isValid) {
    return true;
  } else {
    // Validation failed, prevent the form submission
    return false;
  }
}


// ==============validate mobile number for otp login=========================================================

function validateMobile() {
  const mobile = document.getElementById('mobile').value;
   let isValid = true;
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

  if (isValid) {
    return true;
  } else {
    return false;
  }
}


// ==============validate email for otp login=========================================================

function validateEmail() {
  const email = document.getElementById('email').value;
   let isValid = true;
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

  if (isValid) {
    return true;
  } else {
    return false;
  }
}


// ==============validate password for otp login=========================================================

function passwordValidate() {
  const password = document.getElementById('valpassword').value;
  const cpassword = document.getElementById('valcPassword').value;
   let isValid = true;
  if (password == '') {
    printError('valPassErr', '!Please enter your password');
    isValid = false;
  } else {
    printError('valPassErr', '');
  }
  if (cpassword === '') {
    printError('valcPassErr', '!Confirm Password should not be blank');
    isValid = false;
  } else if (password !== '' && cpassword !== '' && password !== cpassword) {
    printError('valcPassErr', '!Password does not match');
    isValid = false;
  } else {
    printError('valcPassErr', '');
  }
  

  if (isValid) {
    return true;
  } else {
    return false;
  }
}

// ------------------


// admin product add
function validateProductForm() {
  const name = document.getElementById('name').value;
  const price = document.getElementById('price').value;
  const description = document.getElementById('description').value;
  const stock = document.getElementById('stock').value;
  const category = document.getElementById('cars').value;
  const bgColor = document.getElementById('bgColor').value;
  // const offer = document.getElementById('offer').value;
  const image1 = document.getElementById('formFile1').value;
  const image2 = document.getElementById('formFile2').value;
  let isValid = true; // Initialize a flag to track validation status

  if (name.trim() === '') {
    printError('nameErr', 'Please enter a product name');
    isValid = false;
  } else {
    printError('nameErr', '');
  }

  if (price.trim() === '' || isNaN(price) || price < 0) {
    printError('priceErr', 'Please enter a valid price');
    isValid = false;
  } else {
    printError('priceErr', '');
  }

  if (description.trim() === '') {
    printError('descErr', 'Please enter a product description');
    isValid = false;
  } else {
    printError('descErr', '');
  }

  if (stock.trim() === '' || isNaN(stock) || stock < 0) {
    printError('stockErr', 'Please enter a valid stock quantity');
    isValid = false;
  } else {
    printError('stockErr', '');
  }

  if (category === 'choose the category') {
    printError('categoryErr', 'Please select a category');
    isValid = false;
  } else {
    printError('categoryErr', '');
  }

  if (bgColor.trim() === '') {
    printError('bgColorErr', 'Please enter a background color');
    isValid = false;
  } else {
    printError('bgColorErr', '');
  }

  // if (offer.trim() === '' || isNaN(offer) || offer <= 0 || offer > 100) {
  //   printError('offerErr', 'Please enter a valid offer percentage (0-100)');
  //   isValid = false;
  // } else {
  //   printError('offerErr', '');
  // }

  if (image1.trim() === '') {
    printError('image1Err', 'Please select an image for the first file');
    isValid = false;
  } else {
    printError('image1Err', '');
  }

  if (image2.trim() === '') {
    printError('image2Err', 'Please select an image for the second file');
    isValid = false;
  } else {
    printError('image2Err', '');
  }

  if (isValid) {
    return true;
  } else {

  return false;
  }
  }



  // --------------------------------------------
 

  function validateProductEditForm() {
    const name = document.getElementById('name').value;
    const price = document.getElementById('price').value;
    const description = document.getElementById('description').value;
    const stock = document.getElementById('stock').value;
    const category = document.getElementById('cars').value;
    const bgColor = document.getElementById('bgColor').value;
  
    let isValid = true; // Initialize a flag to track validation status

    if (name.trim() === '') {
      printError('nameErr', 'Please enter a product name');
      isValid = false;
    } else {
      printError('nameErr', '');
    }

    if (price.trim() === '' || isNaN(price) || price < 0) {
      printError('priceErr', 'Please enter a valid price');
      isValid = false;
    } else {
      printError('priceErr', '');
    }

    if (description.trim() === '') {
      printError('descErr', 'Please enter a product description');
      isValid = false;
    } else {
      printError('descErr', '');
    }

    if (stock.trim() === '' || isNaN(stock) || stock < 0) {
      printError('stockErr', 'Please enter a valid stock quantity');
      isValid = false;
    } else {
      printError('stockErr', '');
    }

    if (category === 'choose the category') {
      printError('categoryErr', 'Please select a category');
      isValid = false;
    } else {
      printError('categoryErr', '');
    }

    if (bgColor.trim() === '') {
      printError('bgColorErr', 'Please enter a background color');
      isValid = false;
    } else {
      printError('bgColorErr', '');
    }


   

    if (isValid) {
      return true;
    } else {
      return false;
    }
  }
