import init, { calculate } from './pkg/wasmcalc.js';

document.addEventListener('DOMContentLoaded', async function () {
    await init();

    const screen = document.querySelector('.calculator-screen');
    const buttons = document.querySelectorAll('.btn');
    
    let currentInput = '';
    let operator = '';
    let previousInput = '';
    let formula = ''; // 💡 Tracks the full mathematical string to display (e.g., "6*6")

    buttons.forEach(button => {
        button.addEventListener('click', function () {
            const value = this.value;

            // 1. Handle Clear Button
            if (value === 'C') {
                currentInput = '';
                operator = '';
                previousInput = '';
                formula = '';
                screen.value = '0';
                return;
            }

            // 2. Handle Equals Button
            if (value === '=') {
                if (currentInput && previousInput && operator) {
                    try {
                        const p = parseFloat(previousInput);
                        const c = parseFloat(currentInput);
                        
                        let rustOp = '';
                        if (operator === '+') rustOp = 'add';
                        else if (operator === '-') rustOp = 'subtract';
                        else if (operator === '*') rustOp = 'multiply';
                        else if (operator === '/') rustOp = 'divide';

                        // Calculate using your Rust backend
                        const rustRawOutput = calculate(rustOp, p, c);

                        // Show the exact return phrase requested
                        screen.value = `rust in wasm returned: ${rustRawOutput}`;
                        
                        // Reset memory tracking states for the next calculation
                        currentInput = rustRawOutput.toString();
                        operator = '';
                        previousInput = '';
                        formula = currentInput; // Reset formula to the answer
                    } catch (err) {
                        screen.value = err;
                        currentInput = '';
                        formula = '';
                    }
                }
                return;
            }

            // 3. Handle Math Operators (+, -, *, /)
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
                    
                    // Convert standard characters to nice visual symbols for the user screen
                    let visualOp = value;
                    if (value === '*') visualOp = '×';
                    if (value === '/') visualOp = '÷';
                    
                    formula += ` ${visualOp} `;
                    screen.value = formula;
                }
                return;
            }

            // 4. Handle Numbers and Decimal Dot Input
            currentInput += value;
            formula += value;
            screen.value = formula; // 💡 Updates the display with the live ongoing formula sequence
        });
    });
});
