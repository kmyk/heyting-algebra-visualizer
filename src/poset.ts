export class Poset {
    points: string[];
    relation: boolean[];
    constructor(aPoints: string[], aRelation: [number, number][]) {
        this.points = aPoints;
        const n = this.points.length;
        // construct the relation array
        this.relation = new Array(n * n);
        this.relation.fill(false);
        for (let i = 0; i < n; ++ i) {
            this.relation[i * n + i] = true;
        }
        for (let [ a, b ] of aRelation) {
            if (a < 0 || n <= a) throw new Error(`index out of bounds: ${a} for ${n}`);
            if (b < 0 || n <= b) throw new Error(`index out of bounds: ${b} for ${n}`);
            this.relation[a * n + b] = true;
        }
        for (let k = 0; k < n; ++ k) {  // Warshall-Floyd Algorithm
            for (let i = 0; i < n; ++ i) {
                for (let j = 0; j < n; ++ j) {
                    if (this.relation[i * n + k] && this.relation[k * n + j]) {
                        this.relation[i * n + j] = true;
                    }
                }
            }
        }
        // check whether this is a poset
        for (let i = 0; i < n; ++ i) {
            for (let j = 0; j < n; ++ j) {
                if (i != j && this.relation[i * n + j] && this.relation[j * n + i]) {
                    throw new Error(`poset must be antisymmetric`);
                }
            }
        }
    }
    static parseDotSnippet(snippet: string): Poset {
        const points: string[] = [];
        const relation: [number, number][] = [];
        for (let line of snippet.split('\n')) {
            if (line.trim().length == 0) continue;
            let words = line.trim().split(/ *-> */);
            for (let word of words) {
                if (points.indexOf(word) == -1) {
                    points.push(word);
                }
            }
            for (let i = 0; i < words.length - 1; ++ i) {
                const a = points.indexOf(words[i]);
                const b = points.indexOf(words[i + 1]);
                relation.push([ a, b ]);
            }
        }
        return new Poset(points, relation);
    }

    /**
     * @brief returns the minimum set of generators.
     * @note a poset can be generated as a reflexive transitive closure of a set of edges, generators
     */
    getGenerators(): [number, number][] {
        if (typeof this.memoGenerators != 'undefined') return this.memoGenerators;
        this.memoGenerators = [];
        const n = this.points.length;
        for (let i = 0; i < n; ++ i) {
            for (let j = 0; j < n; ++ j) {
                if (! this.relation[i * n + j]) continue;
                if (i == j) continue;
                let isGenerator = true;
                for (let k = 0; k < n; ++ k) {
                    if (k != i && k != j && this.relation[i * n + k] && this.relation[k * n + j]) {
                        isGenerator = false;
                        break;
                    }
                }
                if (isGenerator) {
                    this.memoGenerators.push([ i, j ]);
                }
            }
        }
        return this.memoGenerators;
    }
    private memoGenerators: [number, number][];

    /**
     * @brief generate a code fo dot language
     */
    toDotLanguage(): string {
        let code = "";
        code += "digraph G {\n";
        code += "    graph [ rankdir = BT, bgcolor = \"#00000000\" ]\n";
        code += "    node [ shape = circle, style = filled, fillcolor = \"#ffffffff\" ]\n";
        for (let i = 0; i < this.points.length; ++ i) {
            code += `    ${i} [ label = ${JSON.stringify(this.points[i])} ]`;
        }
        const generators = this.getGenerators();
        for (let [ i, j ] of generators) {
            code += `    ${i} -> ${j}\n`;
        }
        code += "}\n";
        return code;
    }

    getGreatestElement(): number {
        if (typeof this.memoGreatestElement != 'undefined') return this.memoGreatestElement;
        this.memoGreatestElement = null;
        const n = this.points.length;
        for (let i = 0; i < n; ++ i) {
            let isGreatestElement = true;
            for (let j = 0; j < n; ++ j) {
                if (j != i && ! this.relation[j * n + i]) {
                    isGreatestElement = false;
                    break;
                }
            }
            if (isGreatestElement) {
                this.memoGreatestElement = i;
                break;
            }
        }
        return this.memoGreatestElement;
    }
    private memoGreatestElement: number;

    getLeastElement(): number {
        if (typeof this.memoLeastElement != 'undefined') return this.memoLeastElement;
        this.memoLeastElement = null;
        const n = this.points.length;
        for (let i = 0; i < n; ++ i) {
            let isLeastElement = true;
            for (let j = 0; j < n; ++ j) {
                if (j != i && ! this.relation[i * n + j]) {
                    isLeastElement = false;
                    break;
                }
            }
            if (isLeastElement) {
                this.memoLeastElement = i;
                break;
            }
        }
        return this.memoLeastElement;
    }
    private memoLeastElement: number;

    getSupremum(): number[] {
        if (typeof this.memoSupremum != 'undefined') return this.memoSupremum;
        const n = this.points.length;
        this.memoSupremum = new Array(n * n);
        this.memoSupremum.fill(null);
        for (let i = 0; i < n; ++ i) {
            for (let j = 0; j < n; ++ j) {
                for (let k = 0; k < n; ++ k) {
                    let isSupremum = true;
                    for (let l = 0; l < n; ++ l) {
                        if ((this.relation[i * n + l] && this.relation[j * n + l]) != this.relation[k * n + l]) {
                            isSupremum = false;
                            break;
                        }
                    }
                    if (isSupremum) {
                        this.memoSupremum[i * n + j] = k;
                        break;
                    }
                }
            }
        }
        return this.memoSupremum;
    }
    private memoSupremum: number[];

    getInfimum(): number[] {
        if (typeof this.memoInfimum != 'undefined') return this.memoInfimum;
        const n = this.points.length;
        this.memoInfimum = new Array(n * n);
        this.memoInfimum.fill(null);
        for (let i = 0; i < n; ++ i) {
            for (let j = 0; j < n; ++ j) {
                for (let k = 0; k < n; ++ k) {
                    let isInfimum = true;
                    for (let l = 0; l < n; ++ l) {
                        if ((this.relation[l * n + i] && this.relation[l * n + j]) != this.relation[l * n + k]) {
                            isInfimum = false;
                            break;
                        }
                    }
                    if (isInfimum) {
                        this.memoInfimum[i * n + j] = k;
                        break;
                    }
                }
            }
        }
        return this.memoInfimum;
    }
    private memoInfimum: number[];

    getPseudoComplement(): number[] {
        if (typeof this.memoPseudoComplement != 'undefined') return this.memoPseudoComplement;
        const infimum = this.getInfimum();
        if (infimum.indexOf(null) != -1) return this.memoPseudoComplement = null;
        const n = this.points.length;
        this.memoPseudoComplement = new Array(n * n);
        this.memoPseudoComplement.fill(null);
        for (let i = 0; i < n; ++ i) {
            for (let j = 0; j < n; ++ j) {
                for (let k = 0; k < n; ++ k) {
                    let isPseudoComplement = true;
                    for (let l = 0; l < n; ++ l) {
                        if (this.relation[infimum[i * n + l] * n + j] != this.relation[l * n + k]) {
                            isPseudoComplement = false;
                            break;
                        }
                    }
                    if (isPseudoComplement) {
                        this.memoPseudoComplement[i * n + j] = k;
                        break;
                    }
                }
            }
        }
        return this.memoPseudoComplement;
    }
    private memoPseudoComplement: number[];

    isLattice(): boolean {
        return (this.getSupremum().indexOf(null) == -1) && (this.getInfimum().indexOf(null) == -1);
    }
    isHeytingAlgebra(): boolean {
        return this.isLattice() && (this.getLeastElement() != null) && (this.getPseudoComplement().indexOf(null) == -1);
    }
    isBooleanAlgebra(): boolean {
        if (typeof this.memoIsBooleanAlgebra != 'undefined') return this.memoIsBooleanAlgebra;
        if (! this.isHeytingAlgebra()) return this.memoIsBooleanAlgebra = false;
        const n = this.points.length;
        const leastElement = this.getLeastElement();
        const pseudoComplement = this.getPseudoComplement();
        const negate = (i: number) => {
            return pseudoComplement[i * n + leastElement];
        };
        for (let i = 0; i < n; ++ i) {
            if (negate(negate(i)) != i) return this.memoIsBooleanAlgebra = false;
        }
        return this.memoIsBooleanAlgebra = true;
    }
    private memoIsBooleanAlgebra: boolean;
}

