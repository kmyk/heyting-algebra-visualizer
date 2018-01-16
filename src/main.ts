import Viz = require('viz.js');
import { Poset } from './poset.ts';

const run = () => {
    const code = document.getElementById('code') as HTMLInputElement;
    const canvas = document.getElementById('canvas');
    const description = document.getElementById('description');
    const pushDescription = (message: string) => {
        let li = document.createElement('li');
        li.textContent = message;
        description.appendChild(li);
    };
    while (description.firstChild) description.removeChild(description.firstChild);
    canvas.innerHTML = "";
    let poset: Poset;
    try {
        poset = Poset.parseDotSnippet(code.value);
    } catch (err) {
        if (err instanceof Error) {
            pushDescription(err.message);
        }
        throw err;
    }
    console.log(poset);
    console.log(Viz(poset.toDotLanguage()));
    canvas.innerHTML = Viz(poset.toDotLanguage());
    if (poset.points.length == 0) {
        pushDescription(`no elements`);
    } else {
        const greatestElement = poset.points[poset.getGreatestElement()];
        const leastElement = poset.points[poset.getLeastElement()];
        const supremums = poset.getSupremum().indexOf(null) == -1;
        const infimums = poset.getInfimum().indexOf(null) == -1;
        const pseudoComplements = poset.getPseudoComplement() && poset.getPseudoComplement().indexOf(null) == -1;
        pushDescription(`the greatest element: ${greatestElement}`);
        pushDescription(`the least element: ${leastElement}`);
        pushDescription(`all supremums exist: ${supremums}`);
        pushDescription(`all infimums exist: ${infimums}`);
        if (infimums) {
            pushDescription(`all pseudo-complements exist: ${pseudoComplements}`);
        }
        pushDescription(`is lattice: ${poset.isLattice()}`);
        if (poset.isLattice()) {
            pushDescription(`is Heyting algebra: ${poset.isHeytingAlgebra()}`);
        }
        if (poset.isHeytingAlgebra()) {
            pushDescription(`is Boolean algebra: ${poset.isBooleanAlgebra()}`);
        }
    }
};

window.addEventListener('DOMContentLoaded', () => {
    run();
    const button = document.getElementById('button');
    button.addEventListener('click', run);
});
