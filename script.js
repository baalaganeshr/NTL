// KaTeX-based Network Synthesis Steps Dictionary
const synthesisData = {
    ex1: {
        functionEquation: "Z(s) = \\frac{s^2 + 3}{s(s^2 + 1)}",
        methods: {
            foster1: {
                steps: [
                    { title: "Identify Network Function", desc: "Foster Form I requires an impedance function $Z(s)$. Since the input is $Z(s)$, we proceed without inversion." },
                    { title: "Define Partial Fraction Format", equation: "Z(s) = \\frac{K_0}{s} + \\frac{K_1 s}{s^2 + 1}" },
                    { title: "Evaluate Residue K₀", desc: "Multiply Z(s) by $s$ and evaluate at $s \\to 0$:", equation: "K_0 = \\lim_{s \\to 0} \\left[ s \\cdot \\frac{s^2 + 3}{s(s^2 + 1)} \\right] = 3" },
                    { title: "Evaluate Residue K₁", desc: "Multiply by $(s^2+1)$, divide by $s$, and evaluate at $s^2 = -1$:", equation: "K_1 = \\left. \\frac{s^2 + 3}{s^2} \\right|_{s^2=-1} = 2" },
                    { title: "Final Expanded Function", equation: "Z(s) = \\frac{3}{s} + \\frac{2s}{s^2 + 1}" },
                    { title: "Topology Realization", desc: "The first term is a series capacitor ($C = \\frac{1}{3} F$). The second term is a parallel LC tank ($C = \\frac{1}{2} F$, $L = 2 H$) connected in series with the first." }
                ],
                circuit: `
      C1 (1/3 F)
  IN o---||---+
              |
             +-+-+  LC Tank
             |   |
      L1(2H) $   = C2(1/2 F)
             $   =
             |   |
             +-+-+
              |
 OUT o--------+`
            },
            cauer1: {
                steps: [
                    { title: "Degree Ordering", desc: "For Cauer Form I (Low-pass ladder), polynomials are ordered in **descending** powers of $s$." },
                    { title: "Continued Fraction Expansion", desc: "Divide numerator by denominator sequentially:", equation: "Z(s) = \\frac{1}{s} + \\frac{1}{\\frac{s}{2} + \\frac{1}{\\frac{2}{s}}}" },
                    { title: "Ladder Network Mapping", desc: "The quotients represent ladder elements in the order: Series Z, Shunt Y, Series Z.\n\nQuotient 1: $Z_1 = \\frac{1}{s} \\implies C_{series} = 1 F$\nQuotient 2: $Y_2 = \\frac{s}{2} \\implies C_{shunt} = 0.5 F$\nQuotient 3: $Z_3 = \\frac{2}{s} \\implies C_{series} = 0.5 F$" }
                ],
                circuit: `
      (Cauer I : Series Z, Shunt Y Ladder)
      
       C1(1F)      C3(0.5F)
 IN o---||---+-------||-------o OUT
             |              
             = C2(0.5F)     
             |              
GND o--------+----------------o GND`
            },
            foster2: {
                 steps: [
                    { title: "Convert to Admittance", desc: "Foster Form II requires $Y(s)$. We invert $Z(s)$." , equation: "Y(s) = \\frac{s(s^2 + 1)}{s^2 + 3}"},
                    { title: "Setup Partial Fractions on Y(s)/s", equation: "\\frac{Y(s)}{s} = \\frac{s^2 + 1}{s^2 + 3} = 1 - \\frac{2}{s^2 + 3}" },
                    { title: "Final Matrix", equation: "Y(s) = s + \\frac{-2s}{s^2 + 3}" },
                    { title: "Realization Note", desc: "This specific function yields a negative residue, meaning standard pure uncoupled LC realization in Foster II topology is theoretical without an ideal transformer scaling. Topologically, it creates parallel branches." }
                ],
                circuit: `
               L1
  IN o--+--+---$$$---+--o OUT
        |  |         |
      C1=  = C2      +
       1F  |         |
        |  |         |
 GND o--+--+---------+--o GND`
            },
            cauer2: {
                 steps: [
                    { title: "Degree Ordering", desc: "For Cauer Form II (High-pass ladder), polynomials are ordered in **ascending** powers of $s$." },
                    { title: "Inverse Continued Fraction", desc: "Execute synthetic division on ascending terms to extract poles at the origin." },
                    { title: "Ladder Assembly", desc: "The resulting ladder alternates Series Capacitors and Shunt Inductors." }
                ],
                circuit: `
      (Cauer II : High Pass Topology)
      
       C1          C2
 IN o--||----+-----||-----o OUT
             |             
             $ L1          
             $             
 GND o-------+------------o GND`
            }
        }
    },
    ex2: {
        functionEquation: "Y(s) = \\frac{s(s^2 + 2)}{s^2 + 4}",
        methods: {
            foster1: {
                steps: [
                     { title: "Function Conversion", desc: "Foster I requires $Z(s)$. Inverting the given equation:", equation: "Z(s) = \\frac{s^2 + 4}{s(s^2 + 2)}" },
                     { title: "Partial Fraction", equation: "Z(s) = \\frac{K_0}{s} + \\frac{K_1 s}{s^2 + 2}" },
                     { title: "Residue Evaluation", equation: "Z(s) = \\frac{2}{s} + \\frac{-1 s}{s^2 + 2}" },
                     { title: "Conclusion", desc: "This produces a series LC form." }
                ],
                circuit: `
             +- L1 -+
  IN o---||--+      +---o OUT
        C1   |      |
             +- C2 -+`
            },
            foster2: {
                 steps: [
                    { title: "Function Match", desc: "Input is $Y(s)$, which matches Foster II requirements." },
                    { title: "Divide by 's'", equation: "\\frac{Y(s)}{s} = \\frac{s^2 + 2}{s^2 + 4} = 1 - \\frac{2}{s^2 + 4}" },
                    { title: "Final Sum", equation: "Y(s) = s + \\frac{-2s}{s^2 + 4}" }
                ],
                 circuit: `
  IN o--+--||(C)---+--o OUT
        |          |
        +--L1//C2--+`
            },
            cauer1: {
                steps: [{title:"Continued Fraction descending", desc:"Extracts L values followed by C values (Low pass)."}],
                circuit: `
 IN o---L1---+---L2---o OUT
             |
             = C1
             |
 GND o-------+--------o GND`
            },
            cauer2: {
                steps: [{title:"Continued Fraction ascending", desc:"Extracts series C and shunt L values."}],
                circuit: `
 IN o---C1---+---C2---o OUT
             |
             $ L1
             |
 GND o-------+--------o GND`
            }
        }
    }
};

const dom = {
    btn: document.getElementById('btn-synthesize'),
    loader: document.getElementById('loading'),
    outputWrap: document.getElementById('output-content'),
    mathGiven: document.getElementById('math-given'),
    stepContainer: document.getElementById('derivation-steps'),
    circuitMap: document.getElementById('circuit-diagram')
};

// UI Logic: Handle custom radio button styling toggles
function initRadioToggles() {
    const radioCards = document.querySelectorAll('.radio-card');
    radioCards.forEach(card => {
        card.addEventListener('click', () => {
            radioCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
        });
    });

    const radioBtns = document.querySelectorAll('.radio-btn');
    radioBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            radioBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

// Render TeX block beautifully using KaTeX
function injectKatex(element, texString) {
    katex.render(texString, element, {
        throwOnError: false,
        displayMode: true,
        output: "html"
    });
}

// Convert inline $math$ to span katex
function parseInlineMath(text) {
    if (!text) return "";
    return text.replace(/\$([^\$]+)\$/g, (match, expression) => {
        return katex.renderToString(expression, { throwOnError: false, displayMode: false });
    });
}

// Core Execution
function runSynthesis() {
    // 1. Trigger realistic loading overlay UX
    dom.outputWrap.classList.add('fade-out');
    dom.loader.classList.remove('hidden');

    const exInput = document.querySelector('input[name="example"]:checked');
    const methodInput = document.querySelector('input[name="method"]:checked');
    
    // In case user somehow unselects, fallback
    const exId = exInput ? exInput.value : 'ex1';
    const methodId = methodInput ? methodInput.value : 'foster1';

    const data = synthesisData[exId];
    const logicData = data.methods[methodId];

    setTimeout(() => {
        // 2. Setup Given Math
        injectKatex(dom.mathGiven, data.functionEquation);

        // 3. Render Steps
        dom.stepContainer.innerHTML = '';
        logicData.steps.forEach((step, i) => {
            const stepElem = document.createElement('div');
            stepElem.className = 'step-item';
            
            // Allow stepped staggered animation
            stepElem.style.animationDelay = `${i * 0.15}s`;

            let innerHtml = `
                <div class="step-marker"></div>
                <div class="step-content">
                    <h4>Step ${i + 1}: ${step.title}</h4>
                    <p>${parseInlineMath(step.desc)}</p>
                </div>
            `;
            stepElem.innerHTML = innerHtml;

            // Render equations specifically in a custom block
            if (step.equation) {
                const mathWrapper = document.createElement('div');
                mathWrapper.className = 'katex-container';
                stepElem.querySelector('.step-content').appendChild(mathWrapper);
                injectKatex(mathWrapper, step.equation);
            }

            dom.stepContainer.appendChild(stepElem);
        });

        // 4. Render ASCII Blueprint
        // Force reflow/restart animation on text assignment
        const newDiagram = dom.circuitMap.cloneNode(true);
        newDiagram.textContent = logicData.circuit;
        dom.circuitMap.parentNode.replaceChild(newDiagram, dom.circuitMap);
        dom.circuitMap = document.getElementById('circuit-diagram');

        // 5. Hide loader, bring back output
        dom.loader.classList.add('hidden');
        dom.outputWrap.classList.remove('fade-out');
        dom.outputWrap.classList.add('fade-in');

        // Optional smooth scroll depending on layout position
        if (window.innerWidth < 900) {
            document.querySelector('.workspace-output').scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

    }, 800); // Wait 800ms to feel structural
}

// Bind Button
dom.btn.addEventListener('click', runSynthesis);

// Autoload default on open
window.addEventListener('DOMContentLoaded', () => {
    initRadioToggles();
    runSynthesis();
});
