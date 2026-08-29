// 1. Import your default WASM initializer and your named Rust calculate function
import init, { calculate } from './pkg/wasmcalc.js';

document.addEventListener('DOMContentLoaded', async function () {
    // 2. Initialize the Rust WebAssembly binary into browser memory
    await init();

    const screen = document.querySelector('.calculator-screen');
    const buttons = document.querySelectorAll('.btn');
    let currentInput = '';
    let operator = '';
    let previousInput = '';

    buttons.forEach(button => {
        button.addEventListener('click', function () {
            const value = this.value;

            // Handle Clear Button
            if (value === 'C') {
                currentInput = '';
                operator = '';
                previousInput = '';
                screen.value = '';
                return;
            }

            // Handle Equals Button
            if (value === '=') {
                if (currentInput && previousInput && operator) {
                    try {
                        const p = parseFloat(previousInput);
                        const c = parseFloat(currentInput);
                        
                        // Map operators to the strings your Rust code arms expect
                        let rustOp = '';
                        if (operator === '+') rustOp = 'add';
                        else if (operator === '-') rustOp = 'subtract';
                        else if (operator === '*') rustOp = 'multiply';
                        else if (operator === '/') rustOp = 'divide';

                        // 3. Fire the execution directly into your Rust library file
                        currentInput = calculate(rustOp, p, c).toString();
                        operator = '';
                        previousInput = '';
                        screen.value = currentInput;
                    } catch (err) {
                        screen.value = err; // Safely displays "Cannot divide by zero." straight from Rust
                        currentInput = '';
                    }
                }
                return;
            }

            // Handle Math Operator Buttons
            if (['+', '-', '*', '/'].includes(value)) {
                if (currentInput) {
                    if (previousInput) {
                        try {
                            const p = parseFloat(previousInput);
                            const c = parseFloat(currentInput);
                            
                            let rustOp = '';
                            if (operator === '+') rustOp = 'add';
                            else if (operator === '-') rustOp = 'subtract';
                            else if (operator === '*') rustOp = 'multiply';
                            else if (operator === '/') rustOp = 'divide';

                            previousInput = calculate(rustOp, p, c).toString();
                        } catch (err) {
                            screen.value = err;
                            return;
                        }
                    } else {
                        previousInput = currentInput;
                    }
                    operator = value;
                    currentInput = '';
                }
                return;
            }

            // Append numbers and decimals
            currentInput += value;
            screen.value = currentInput;
        });
    });
});
