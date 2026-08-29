import init, { calculate } from './pkg/wasmcalc.js';

document.addEventListener('DOMContentLoaded', async function () {
    await init();

    const screen = document.querySelector('.calculator-screen');
    const buttons = document.querySelectorAll('.btn');
    
    let currentInput = '';
    let operator = '';
    let previousInput = '';
    let formula = ''; 

    buttons.forEach(button => {
        button.addEventListener('click', function () {
            const value = this.value;

            if (value === 'C') {
                currentInput = ''; operator = ''; previousInput = ''; formula = '';
                screen.value = '0';
                return;
            }

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

                        const rustRawOutput = calculate(rustOp, p, c);

                        // 1. Send the custom string exclusively to your browser developer console log
                        console.log(`rust in wasm returned: ${rustRawOutput}`);

                        // 2. Keep the calculator screen displaying just the pure number result
                        screen.value = rustRawOutput.toString();
                        
                        currentInput = rustRawOutput.toString();
                        operator = ''; previousInput = ''; formula = currentInput;
                    } catch (err) {
                        screen.value = err;
                        console.error("Rust execution failed:", err);
                        currentInput = ''; formula = '';
                    }
                }
                return;
            }

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
                    
                    let visualOp = value;
                    if (value === '*') visualOp = '×';
                    if (value === '/') visualOp = '÷';
                    
                    formula += ` ${visualOp} `;
                    screen.value = formula;
                }
                return;
            }

            currentInput += value;
            formula += value;
            screen.value = formula; 
        });
    });
});
