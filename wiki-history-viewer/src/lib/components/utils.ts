type ElementKey = string;
type ElementType = string;

export class IdHandler {
    private chartId: string;
    private registry: Map<ElementType, Map<ElementKey, string>>;

    constructor(chartId: string) {
        this.chartId = chartId;
        this.registry = new Map();
    }

    /**  Register an element type/id and return the generated DOM id */
    register(elementType: string, elementId: string): string {
        if (!this.registry.has(elementType)) {
            this.registry.set(elementType, new Map());
        }

        const elementMap = this.registry.get(elementType)!;

        if (elementMap.has(elementId)) {
            // Already registered → return existing
            return elementMap.get(elementId)!;
        }

        const domId = `${this.chartId}-${elementType}-${elementId}`;
        elementMap.set(elementId, domId);
        return domId;
    }

    /** Find a previously registered id */
    find(elementType: string, elementId: string): string | undefined {
        return this.registry.get(elementType)?.get(elementId);
    }

    /** Utility: return a d3 selector-ready string 
     * This function auto-registeres in case type/id pair does not exist */
    selector(elementType: string, elementId: string): string {
        let id = this.find(elementType, elementId);
        if (!id) {
            id = this.register(elementType, elementId)
        }
        return `${elementType}#${id}`;
    }
}
