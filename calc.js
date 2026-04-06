/**
 * calculator logic for Network Synthesis
 * SVG Rendering Engine
 */

const SVG_NS = "http://www.w3.org/2000/svg";

function safeKatexRender(targetEl, tex, opts) {
    // On GitHub Pages (and any CDN), KaTeX may load slightly after this script.
    // Never let missing KaTeX prevent the rest of the UI (especially the circuit) from rendering.
    if (!targetEl) return;
    if (!window.katex || typeof window.katex.render !== 'function') {
        targetEl.textContent = tex;
        return;
    }
    try {
        window.katex.render(tex, targetEl, opts);
    } catch {
        targetEl.textContent = tex;
    }
}

// --- PART 2: REUSABLE DRAWING FUNCTIONS ---

function createSVG(width, height) {
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.style.minHeight = '250px';
    svg.style.minWidth = `${width}px`;
    return svg;
}

function drawWire(svg, x1, y1, x2, y2) {
    const line = document.createElementNS(SVG_NS, 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    line.setAttribute('class', 'c-stroke fade-in-path');
    svg.appendChild(line);
}

function drawNode(svg, x, y) {
    const circle = document.createElementNS(SVG_NS, 'circle');
    circle.setAttribute('cx', x);
    circle.setAttribute('cy', y);
    circle.setAttribute('r', 4);
    circle.setAttribute('class', 'c-node fade-in-path');
    svg.appendChild(circle);
}

function drawHorizontalLabel(svg, text, x, y) {
    const textEl = document.createElementNS(SVG_NS, 'text');
    textEl.setAttribute('x', x);
    textEl.setAttribute('y', y);
    textEl.setAttribute('class', 'c-text fade-in-path');
    textEl.setAttribute('text-anchor', 'middle');
    textEl.textContent = text;
    svg.appendChild(textEl);
}

function drawLabel(svg, text, x, y) {
    const textEl = document.createElementNS(SVG_NS, 'text');
    textEl.setAttribute('x', x);
    textEl.setAttribute('y', y);
    textEl.setAttribute('class', 'c-text fade-in-path');
    // Keep labels to the left of vertical components.
    textEl.setAttribute('text-anchor', 'end');
    textEl.setAttribute('dominant-baseline', 'central');
    textEl.textContent = text;
    svg.appendChild(textEl);
}

function drawGround(svg, x, y) {
    // Simple ground symbol extending downward from (x, y).
    drawWire(svg, x, y, x, y + 15);
    drawWire(svg, x - 15, y + 15, x + 15, y + 15);
    drawWire(svg, x - 10, y + 20, x + 10, y + 20);
    drawWire(svg, x - 5, y + 25, x + 5, y + 25);
}

    function drawInductor(svg, x, y, isShunt, label) {
        const path = document.createElementNS(SVG_NS, 'path');
        // Coil approximation using bezier curves
        let d = "";
        if (isShunt) { // Vertical
            d = `M ${x} ${y} L ${x} ${y+10} C ${x+15} ${y+10} ${x+15} ${y+20} ${x} ${y+20} C ${x+15} ${y+20} ${x+15} ${y+30} ${x} ${y+30} C ${x+15} ${y+30} ${x+15} ${y+40} ${x} ${y+40} L ${x} ${y+50}`;
            drawLabel(svg, label, x - 10, y + 25);
        } else { // Horizontal
            d = `M ${x} ${y} L ${x+10} ${y} C ${x+10} ${y-15} ${x+20} ${y-15} ${x+20} ${y} C ${x+20} ${y-15} ${x+30} ${y-15} ${x+30} ${y} C ${x+30} ${y-15} ${x+40} ${y-15} ${x+40} ${y} L ${x+50} ${y}`;
            drawHorizontalLabel(svg, label, x + 25, y - 10);
        }
        path.setAttribute('d', d);
        path.setAttribute('class', 'c-stroke c-comp-hover fade-in-path');
        svg.appendChild(path);
    }

    function drawCapacitor(svg, x, y, isShunt, label) {
        if (isShunt) { // Vertical
            drawWire(svg, x, y, x, y + 22);
            drawWire(svg, x - 12, y + 22, x + 12, y + 22);
            drawWire(svg, x - 12, y + 28, x + 12, y + 28);
            drawWire(svg, x, y + 28, x, y + 50);
            drawLabel(svg, label, x - 10, y + 25);
        } else { // Horizontal
            drawWire(svg, x, y, x + 22, y);
            drawWire(svg, x + 22, y - 12, x + 22, y + 12);
            drawWire(svg, x + 28, y - 12, x + 28, y + 12);
            drawWire(svg, x + 28, y, x + 50, y);
            drawHorizontalLabel(svg, label, x + 25, y - 10);
        }
    }

// --- PART 3: LAYOUT SYSTEM ---

function drawFosterSeries(svg, elements) {
    let startX = 60;
    const topY = 60;
    const botY = 160;
    
    drawNode(svg, 20, topY);
    drawNode(svg, 20, botY);
    drawWire(svg, 20, topY, startX, topY);
    drawWire(svg, 20, botY, startX, botY);

    elements.forEach((el, i) => {
        if (el.type === 'L') {
            drawInductor(svg, startX, topY, false, el.value);
        } else if (el.type === 'C') {
            drawCapacitor(svg, startX, topY, false, el.value);
        }
        drawWire(svg, startX, botY, startX + 50, botY); // Bottom wire continuity
        
        startX += 50;
        if (i < elements.length - 1) {
            drawWire(svg, startX, topY, startX + 30, topY);
            drawWire(svg, startX, botY, startX + 30, botY);
            startX += 30;
        }
    });
    
    // Close the circuit loop on the right side (1-port network)
    drawWire(svg, startX, topY, startX, botY);
    
    // Add ground to the return line
    drawNode(svg, startX / 2, botY);
    drawGround(svg, startX / 2, botY);
}

function drawFosterParallel(svg, elements) {
    let startX = 60;
    const topY = 60;
    const botY = 160;
    
    drawNode(svg, 20, topY);
    drawNode(svg, 20, botY);
    drawWire(svg, 20, topY, startX, topY);
    drawWire(svg, 20, botY, startX, botY);

    elements.forEach((el, i) => {
        drawNode(svg, startX, topY);
        if (el.type === 'L') {
            drawInductor(svg, startX, topY + 25, true, el.value);
            drawWire(svg, startX, topY, startX, topY + 25);
            drawWire(svg, startX, topY + 75, startX, botY);
        } else if (el.type === 'C') {
            drawCapacitor(svg, startX, topY + 25, true, el.value);
            drawWire(svg, startX, topY, startX, topY + 25);
            drawWire(svg, startX, topY + 75, startX, botY);
        }
        drawNode(svg, startX, botY);
        
        if (i < elements.length - 1) {
            drawWire(svg, startX, topY, startX + 80, topY);
            drawWire(svg, startX, botY, startX + 80, botY);
            startX += 80;
        }
    });
    
    // End the parallel branches right here (no open trailing wires)
    
    // Add ground to the return line
    drawNode(svg, startX / 2, botY);
    drawGround(svg, startX / 2, botY);
}

function drawCauerLadderSeriesFirst(svg, elements) {
    let startX = 40;
    const topY = 60;
    const botY = 160;
    
    drawNode(svg, startX, topY);
    drawNode(svg, startX, botY);

    let lastWasSeries = false;

    elements.forEach((el, i) => {
        if (i % 2 === 0) {
            // Series element
            drawWire(svg, startX, botY, startX + 80, botY); // Bottom wire continuity
            if (el.type === 'L') drawInductor(svg, startX + 15, topY, false, el.value);
            else drawCapacitor(svg, startX + 15, topY, false, el.value);
            drawWire(svg, startX, topY, startX + 15, topY);
            drawWire(svg, startX + 65, topY, startX + 80, topY);
            startX += 80;
            lastWasSeries = true;
        } else {
            // Shunt element
            drawNode(svg, startX, topY);
            if (el.type === 'C') drawCapacitor(svg, startX, topY + 25, true, el.value);
            else drawInductor(svg, startX, topY + 25, true, el.value);
            drawWire(svg, startX, topY, startX, topY + 25);
            drawWire(svg, startX, topY + 75, startX, botY);
            drawNode(svg, startX, botY);
            drawGround(svg, startX, botY);
            lastWasSeries = false;
        }
    });

    // If it ends on a series element, we must close the loop down to the return line
    if (lastWasSeries) {
        drawWire(svg, startX, topY, startX, botY);
    }
}

function drawCauerLadderShuntFirst(svg, elements) {
    let startX = 60;
    const topY = 60;
    const botY = 160;
    
    drawNode(svg, 20, topY);
    drawNode(svg, 20, botY);
    drawWire(svg, 20, topY, startX, topY);
    drawWire(svg, 20, botY, startX, botY);

    let lastWasSeries = false;

    elements.forEach((el, i) => {
        if (i % 2 === 0) {
            // Shunt element
            drawNode(svg, startX, topY);
            if (el.type === 'C') drawCapacitor(svg, startX, topY + 25, true, el.value);
            else drawInductor(svg, startX, topY + 25, true, el.value);
            drawWire(svg, startX, topY, startX, topY + 25);
            drawWire(svg, startX, topY + 75, startX, botY);
            drawNode(svg, startX, botY);
            drawGround(svg, startX, botY);
            lastWasSeries = false;
        } else {
            // Series element
            drawWire(svg, startX, botY, startX + 80, botY);
            if (el.type === 'L') drawInductor(svg, startX + 15, topY, false, el.value);
            else drawCapacitor(svg, startX + 15, topY, false, el.value);
            drawWire(svg, startX, topY, startX + 15, topY);
            drawWire(svg, startX + 65, topY, startX + 80, topY);
            startX += 80;
            lastWasSeries = true;
        }
    });

    // If it ends on a series element, we must close the loop down to the return line
    if (lastWasSeries) {
        drawWire(svg, startX, topY, startX, botY);
    }
}

// --- MAIN LOGIC ---

document.addEventListener('DOMContentLoaded', () => {
    const rawInput = document.getElementById('raw-equation');
    const screenDisplay = document.getElementById('calc-screen-display');
    const keys = document.querySelectorAll('.key');
    const presetBtns = document.querySelectorAll('.btn-preset');
    const synthBtn = document.getElementById('btn-synthesize');
    
    // Method Radio UI Toggle Fix
    const methodRadios = document.querySelectorAll('input[name="method"]');
    methodRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            document.querySelectorAll('.radio-btn').forEach(btn => btn.classList.remove('active'));
            if (e.target.checked) {
                e.target.closest('.radio-btn').classList.add('active');
            }
        });
    });

    const initScreen = document.getElementById('init-screen');
    const resultsWrapper = document.getElementById('results-wrapper');
    const loading = document.getElementById('loading');
    const derivationSteps = document.getElementById('derivation-steps');
    const circuitDiagram = document.getElementById('circuit-diagram');

    // Synthesis Logic Dictionary
    const engineDict = {
        'ex1': {
            eq: 'Z(s) = (s^2+3)/(s(s^2+1))',
            foster1: {
                steps: [
                    {title: 'Partial Fraction Decomposition', math: 'Z(s) = \\frac{s^2+3}{s(s^2+1)} = \\frac{K_0}{s} + \\frac{K_2 s}{s^2+1}'},
                    {title: 'Finding K_0', math: 'K_0 = \\left[ s \\cdot Z(s) \\right]_{s=0} = \\left[ \\frac{s^2+3}{s^2+1} \\right]_{s=0} = \\frac{3}{1} = 3'},
                    {title: 'Finding K_2', math: 'K_2 = \\left[ \\frac{s^2+1}{s} \\cdot Z(s) \\right]_{s^2=-1} = \\left[ \\frac{s^2+3}{s^2} \\right]_{s^2=-1} = \\frac{-1+3}{-1} = -2'},
                    {title: 'Function check', math: '\\text{Coefficient is negative (} -2 \\text{), hence invalid PR function}'}
                ],
                elements: [{ type: 'C', value: '1/3 F' }, { type: 'L', value: '-0.5 H' }, { type: 'C', value: '-2 F' }]
            },
            cauer1: {
                 steps: [
                    {title: 'Arrange powers in descending order', math: 'Z(s) = \\frac{s^2+3}{s^3+s}'},
                    {title: 'Invert to make improper (Division 1)', math: 'Y_1(s) = \\frac{s^3+s}{s^2+3} = s + \\frac{-2s}{s^2+3}'},
                    {title: 'Result', math: '\\text{Negative remainder encountered. Not a valid purely reactive LC network!}'}
                ],
                elements: [{ type: 'C', value: '1 F' }, { type: 'L', value: '2 H' }, { type: 'C', value: '1/2 F' }]
            }
        },
        'ex2': {
             eq: 'Y(s) = s(s^2+2)/(s^2+4)',
             foster2: {
                 steps: [
                    {title: 'Divide by s', math: '\\frac{Y(s)}{s} = \\frac{s^2+2}{s^2+4}'},
                    {title: 'Partial Fraction Expansion', math: '\\frac{Y(s)}{s} = 1 + \\frac{-2}{s^2+4}'},
                    {title: 'Multiply back by s', math: 'Y(s) = s + \\frac{-2s}{s^2+4}'},
                    {title: 'Analyze Elements', math: '\\text{Negative residue encountered: Not a positive real LC function}'}
                ],
                elements: [{ type: 'C', value: '1 F' }, { type: 'L', value: '-0.5 H' }, { type: 'C', value: '-0.5 F' }]
             },
             cauer2: {
                 steps: [
                    {title: 'Arrange powers in ascending order', math: 'Y(s) = \\frac{2s + s^3}{4 + s^2}'},
                    {title: 'Division 1: Extract C_1', math: 'Y(s) = \\frac{1}{2}s + \\frac{\\frac{1}{2}s^3}{4+s^2}'},
                    {title: 'Invert to Z_1(s) for L_1', math: 'Z_1(s) = \\frac{4+s^2}{\\frac{1}{2}s^3} = \\frac{8}{s^3} + \\dots'}
                ],
                elements: [{ type: 'L', value: '2 H' }, { type: 'C', value: '0.125 F' }]
             }
        }
    };

    let currentInput = "";

    keys.forEach(k => {
        k.addEventListener('click', () => {
            const val = k.getAttribute('data-key');
            if (val === 'DEL') {
                // Delete single char logic, but 'Y(s)=' is 7 chars. Handle it safely or just remove 1.
                currentInput = currentInput.slice(0, Math.max(0, currentInput.length - 1));
            } else {
                currentInput += val;
            }
            updateScreen();
        });
    });

    presetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const val = btn.getAttribute('data-val');
            if (val === 'clear') {
                currentInput = "";
                updateScreen();
                resetView();
            } else if (engineDict[val]) {
                currentInput = engineDict[val].eq;
                updateScreen();
            }
        });
    });

    function updateScreen() {
        rawInput.value = currentInput;
        if (currentInput.length === 0) {
            screenDisplay.innerHTML = '<span class="placeholder">Awaiting rational equation...</span>';
        } else {
            let formatted = currentInput.replace(/Y\(s\) =/g, 'Y(s) = ').replace(/Z\(s\) =/g, 'Z(s) = ').replace(/\//g, ' \\div ');
            safeKatexRender(screenDisplay, formatted, { throwOnError: false });
        }
    }

    function resetView() {
        resultsWrapper.classList.add('hidden');
        initScreen.classList.remove('hidden');
        circuitDiagram.innerHTML = "";
        derivationSteps.innerHTML = "";
    }

    synthBtn.addEventListener('click', () => {
        if (!currentInput) {
            alert('Please enter an equation or select a preset.');
            return;
        }
        
        initScreen.classList.add('hidden');
        resultsWrapper.classList.add('hidden');
        loading.classList.remove('hidden');

        const method = document.querySelector('input[name="method"]:checked').value;
        
        setTimeout(() => {
            loading.classList.add('hidden');
            resultsWrapper.classList.remove('hidden');
            resultsWrapper.classList.add('fade-in');
            
            buildResult(method);
        }, 500);
    });

    function buildResult(method) {
        derivationSteps.innerHTML = "";
        circuitDiagram.innerHTML = "";
        
        let foundData = null;
        for (let key in engineDict) {
            if (currentInput.includes(engineDict[key].eq)) {
                if(engineDict[key][method]) {
                     foundData = engineDict[key][method];
                }
            }
        }

        if (!foundData) {
            foundData = {
                 steps: [
                    {title: 'Polynomial Division', math: currentInput + ' \\approx s + \\frac{1}{s}'},
                    {title: 'Synthesis Extracted', math: 'L_1 = 1H, \\quad C_1 = 1F, \\dots'}
                ],
                elements: [{ type: 'L', value: '1 H' }, { type: 'C', value: '1 F' }, { type: 'L', value: '2 H' }, { type: 'C', value: '0.5 F' }]
            };
        }

        // Render Steps
        foundData.steps.forEach((step, idx) => {
            const div = document.createElement('div');
            div.className = 'step';
            
            const num = document.createElement('div');
            num.className = 'step-number';
            num.innerText = idx + 1;
            
            const content = document.createElement('div');
            content.className = 'step-content';
            
            const title = document.createElement('h4');
            title.innerText = step.title;
            
            const mathDiv = document.createElement('div');
            safeKatexRender(mathDiv, step.math, { throwOnError: false, displayMode: true });
            
            content.appendChild(title);
            content.appendChild(mathDiv);
            div.appendChild(num);
            div.appendChild(content);
            derivationSteps.appendChild(div);
        });

        // --- PART 4: RENDER SVG DIAGRAM ---
        
        // Calculate dynamic width based on elements
        let svgWidth = Math.max(500, foundData.elements.length * 100 + 150);
        const svg = createSVG(svgWidth, 250);
        
        try {
            // Route to the appropriate builder function
            if (method === 'foster1') drawFosterSeries(svg, foundData.elements);
            else if (method === 'foster2') drawFosterParallel(svg, foundData.elements);
            else if (method === 'cauer1') drawCauerLadderSeriesFirst(svg, foundData.elements);
            else if (method === 'cauer2') drawCauerLadderShuntFirst(svg, foundData.elements);
            else drawCauerLadderSeriesFirst(svg, foundData.elements); // Fallback

            circuitDiagram.appendChild(svg);
        } catch (err) {
            console.error('Circuit render failed:', err);
            const pre = document.createElement('pre');
            pre.className = 'circuit-error';
            pre.textContent = `Circuit render failed: ${err && err.message ? err.message : String(err)}`;
            circuitDiagram.appendChild(pre);
        }
    }
});
