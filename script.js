document.addEventListener('DOMContentLoaded', function () {
    const screen = document.querySelector('.calculator-screen');
    const buttons = document.querySelectorAll('.btn');
    let currentInput = '';
    let operator = '';
    let previousInput = '';

    buttons.forEach(button => {
        button.addEventListener('click', function () {
            const value = this.value;

            if (value === 'C') {
                currentInput = '';
                operator = '';
                previousInput = '';
                screen.value = '';
                return;
            }

            if (value === '=') {
                if (currentInput && previousInput && operator) {
                    currentInput = eval(`${previousInput}${operator}${currentInput}`);
                    operator = '';
                    previousInput = '';
                    screen.value = currentInput;
                }
                return;
            }

            if (['+', '-', '*', '/'].includes(value)) {
                if (currentInput) {
                    if (previousInput) {
                        previousInput = eval(`${previousInput}${operator}${currentInput}`);
                    } else {
                        previousInput = currentInput;
                    }
                    operator = value;
                    currentInput = '';
                }
                return;
            }

            currentInput += value;
            screen.value = currentInput;
        });
    });
});