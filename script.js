import init, { calculate } from './pkg/wasmcalc.js';

document.addEventListener('DOMContentLoaded', async function () {
    // 1. Mount the compiled Rust package logic layer securely into local window space
    await init();

    const mainScreen = document.querySelector('.calculator-screen');
    const formulaBox = document.querySelector('.formula-box');
    const buttons = document.querySelectorAll('.btn');
    
    let currentInput = '';
    let operator = '';
    let previousInput = '';
    let formula = ''; 

    buttons.forEach(button => {
        button.addEventListener('click', function () {
            const value = this.value;

            // Handle AC Screen Reset
            if (value === 'C') {
                currentInput = ''; operator = ''; previousInput = ''; formula = '';
                mainScreen.value = '0';
                formulaBox.innerText = '0';
                return;
            }

            // Handle Computation Resolution
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

                        // 2. Dispatch operations down the pipeline to the native Rust engine library
                        const rustRawOutput = calculate(rustOp, p, c);

                        // 3. Print the custom log tracking sequence out to the developer console tools
                        console.log(`rust in wasm returned: ${rustRawOutput}`);

                        // 4. Update the visual layout boxes independently
                        formulaBox.innerText = `${formula} =`;
                        mainScreen.value = rustRawOutput.toString();
                        
                        // Set up variables for potential consecutive string operations
                        currentInput = rustRawOutput.toString();
                        operator = ''; previousInput = ''; formula = currentInput;
                    } catch (err) {
                        mainScreen.value = err;
                        console.error("Rust context calculation failed:", err);
                        currentInput = ''; formula = '';
                    }
                }
                return;
            }

            // Handle Mathematical Operators (+, -, *, /)
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
                            mainScreen.value = err;
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
                    formulaBox.innerText = formula;
                }
                return;
            }

            // Fallback: Handle Append Character inputs (Numbers & Dot values)
            if (value === '' && this.innerText !== '0') return; // Ignore unconfigured ± or % placeholder hits
            
            currentInput += value;
            formula += value;
            mainScreen.value = currentInput; 
            formulaBox.innerText = formula; 
        });
    });
});
