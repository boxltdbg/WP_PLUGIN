document.addEventListener("DOMContentLoaded", function () {
  var apiUrlInput = document.querySelector('input[name="boxnow_api_url"]');

  // Check if apiUrlInput exists
  if (apiUrlInput) {
    apiUrlInput.addEventListener("input", function () {
      var currentValue = apiUrlInput.value;
      var newValue = currentValue
        .replace(/^https?:\/\//i, "")
        .replace(/\/+$/, "");
      apiUrlInput.value = newValue;
    });
  } else {
    console.error('Елемент с име "boxnow_api_url" не е намерен!');
  }

  const emailOption = document.getElementById("send_voucher_email");
  const buttonOption = document.getElementById("display_voucher_button");
  const emailInputContainer = document.getElementById("email_input_container");

  function toggleEmailInput() {
    if (emailOption.checked) {
      emailInputContainer.style.display = "block";
    } else {
      emailInputContainer.style.display = "none";
    }
  }

  emailOption.addEventListener("change", toggleEmailInput);
  buttonOption.addEventListener("change", toggleEmailInput);
});
