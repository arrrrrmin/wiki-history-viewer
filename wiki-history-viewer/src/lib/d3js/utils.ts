import { isMobileStore } from "$lib/stores/mobile";
import * as d3 from "d3";
import type { RevisionTooltipInfo } from "./types.helpers";
import { parserStore } from "$lib/stores/parser";

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

export const getDependentWidth = () => {
    let isMobile = false;
    isMobileStore.subscribe(state => { isMobile = state });
    if (isMobile) {
        return 700;
    }
    return 1200;
}

export const setAxisText = (g: any, size: string | number | boolean | readonly (string | number)[] | d3.ValueFn<d3.BaseType, unknown, string | number | boolean | readonly (string | number)[] | null> | null) => {
    return g.selectAll("text").attr("font-size", size);
};

export const getDiffUrl = (revTooltipInfo?: RevisionTooltipInfo): string | undefined => {
    if (!revTooltipInfo) return;
    let title = revTooltipInfo.title;
    let lang = revTooltipInfo.lang;
    let currId = revTooltipInfo.currId;
    let prevId = revTooltipInfo.prevId;
    return `https://${lang}.wikipedia.org/w/index.php?title=${encodeURI(title)}&diff=${prevId}&oldid=${currId}&variant=en`
}
