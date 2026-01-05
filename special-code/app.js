// https://codepen.io/RobertAron/pen/gOLLXLo

const inputElements = [...document.querySelectorAll('input.code-input')];

inputElements.forEach((element, index) => {
  element.addEventListener('keydown', (e) => {
    // If the keycode is backspace & the current field is empty
    // focus the input before the current. Then the event happens
    // which will clear the "before" input box.
    if (e.keyCode === 8 && e.target.value === '') inputElements[Math.max(0, index - 1)].focus();
  })
  element.addEventListener('input', (e) => {
    // Take the first character of the input (Does not work with emojis)
    const [first, ...rest] = e.target.value;
    e.target.value = first ?? '' // First will be undefined when backspace was entered, so set the input to ""
    const lastInputBox = index === inputElements.length - 1;
    const didInsertContent = first !== undefined;
    if (didInsertContent && !lastInputBox) {
      // Continue to input the rest of the string
      inputElements[index + 1].focus();
      inputElements[index + 1].value = rest.join('');
      inputElements[index + 1].dispatchEvent(new Event('input'));
    }
  })
})

// Mini example on how to pull the data on submit of the form
function onSubmit(e) {
  e.preventDefault();
  const code = inputElements.map(({ value }) => value).join('').toUpperCase();
  if (code.length != 5) {
    window.history.back()
  } else {
    window.location.href = ['../pages/', String(code), '.html'].join('');
  }
}
