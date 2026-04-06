# Interactive Network Synthesis

A complete, academic-quality, single-page web project for demonstrating step-by-step network synthesis using Foster and Cauer Forms. Built for a mini project on Network Theory.

## Project Structure
- `index.html`: Landing page (theory + links).
- `calculator.html`: Interactive calculator UI.
- `calc.js`: Calculator logic + SVG circuit renderer.
- `style.css`: Shared dark-themed modern academic CSS.
- `script.js`: (Legacy/optional) extra JS; not required for the calculator.

## How to Run Locally
1. Clone this repository or download the files.
2. Open `index.html` in any modern web browser (Chrome, Firefox, Edge, Safari).
   - No server, build step, or framework is required.

## How to Host on GitHub Pages
This project is a static site (HTML/CSS/JS), so GitHub Pages can host it directly.

1. Push this repo to GitHub.
2. Go to **Settings** → **Pages**.
3. Under **Build and deployment**:
   - **Source**: select **Deploy from a branch**
   - **Branch**: select `main` and `/ (root)`
4. Save.

Your site will be available at:

- `https://<your-username>.github.io/NTL/`

Tip: If you rename the repository, the URL changes accordingly.

## Viva Explanation
**What is this project?**
This project visually explains Network Synthesis—the reverse of network analysis, where we derive a physical LC circuit from a given impedance $Z(s)$ or admittance $Y(s)$ function.
**Which methods are used?**
- **Foster I:** Uses partial fraction expansion on Z(s) for a series configuration.
- **Foster II:** Uses partial fraction expansion on Y(s) for a parallel configuration.
- **Cauer I:** Uses continued fraction expansion on descending powers for a ladder network (low-pass filter style).
- **Cauer II:** Uses continued fraction expansion on ascending powers for a ladder network (high-pass filter style).
