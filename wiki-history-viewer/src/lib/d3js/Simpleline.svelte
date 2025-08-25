<script lang="js">
    // @ts-nocheck
    import { onMount } from "svelte";
    import * as d3 from "d3";

    import { parserStore } from "$lib/stores/parser";
    import { dataSettingsStore } from "$lib/stores/datasettings";
    import { revisionsStore, hasRevisionsStore } from "$lib/stores/revisions";
    import { isMobileStore } from "$lib/stores/mobile";

    import * as utils from "$lib/d3js/utils";
    import { queryConfig } from "$lib/config";

    let { ...props } = $props();

    // Visualisation variables
    const id = props.id;
    const idHandler = new utils.IdHandler(id);
    let width = utils.getDependentWidth();
    let height = 500;
    const margins = { right: 20, top: 40, left: 80, bottom: 40 };
    const t = queryConfig.decay;

    // Internal helper variables
    let revs = [];

    // Variables used inside the svg
    let x = d3.scaleUtc();
    let y = d3.scaleLinear();
    let svg = undefined;
    let titleEl = undefined;

    const transformInputData = () => {
        // Transform input data for internal usage
        if (!$hasRevisionsStore) return;
        let revs = $revisionsStore.revisions.slice();

        if ($isMobileStore && revs.length > 60) {
            revs = revs.slice(0, 60);
        }

        if (!$dataSettingsStore.allowMinors) {
            revs = revs.filter((r) => !r.minor);
        }
        if (!$dataSettingsStore.allowUnknownEditors) {
            revs = revs.filter((r) => !r.user.name.startsWith("~"));
        }
        revs.sort((a, b) => a.timestamp - b.timestamp);
        return revs;
    };

    // Line generator
    let area = d3
        .area()
        .curve(d3.curveLinear)
        .defined((d) => !isNaN(d))
        .x((_, i) => x(revs[i].timestamp))
        .y0(0)
        // Article size
        .y1((d) => y(d) - y(0));

    let line = area.lineY1();

    onMount(() => {
        revs = transformInputData();

        width = utils.getDependentWidth();

        svg = d3
            .select(`div#${id}`)
            .append("svg")
            .attr("id", id)
            .attr("class", "m-auto")
            .attr("width", width)
            .attr("viewBox", [0, 0, width, height]);

        svg.transition(t)
            .ease(d3.easeExpInOut)
            .attr("width", width)
            .attr("style", "max-width: 100%; height: auto; overflow: visible;");

        svg.append("g")
            .attr("id", idHandler.register("g", "gx"))
            .attr("transform", `translate(0,${height - margins.bottom})`);

        svg.append("g")
            .attr("id", idHandler.register("g", "gy"))
            .attr("transform", `translate(${margins.left},0)`);

        var ylabel = svg
            .append("text")
            .attr("x", 0)
            .attr("y", 0)
            .attr("font-size", 10)
            .attr("text-anchor", "end");

        ylabel
            .append("tspan")
            .attr("x", margins.left)
            .attr("y", margins.top - 8)
            .text("Article size");

        ylabel
            .append("tspan")
            .attr("x", margins.left)
            .attr("dy", "-1.2em")
            .text("(bytes) ↑");

        var container = svg
            .append("g")
            .attr("id", idHandler.register("g", "container"))
            .attr("transform", `translate(0,${height - margins.bottom})`);

        container
            .append("path")
            .attr("id", idHandler.register("path", "area"))
            .attr("fill", "#ddd");
        container
            .append("path")
            .attr("id", idHandler.register("path", "line"))
            .attr("fill", "none")
            .attr("stroke", "black");

        // The group g#id-g-points is handled in $effect
        svg.append("g")
            .attr("id", idHandler.register("g", "points"))
            .attr("transform", `translate(0,${height - margins.bottom})`);

        // xlabel
        svg.append("g")
            .append("text")
            .attr("id", idHandler.register("text", "xlabel"))
            .attr("x", width - margins.right)
            .attr("y", height - margins.bottom + 35)
            .attr("fill", "black")
            .attr("text-anchor", "end")
            .text("Past →");

        update();
    });

    const update = () => {
        revs = transformInputData();
        width = utils.getDependentWidth();

        x.range([width - margins.right, margins.left]).domain(
            d3.extent(revs, (d) => d.timestamp),
        );
        y.range([height - margins.bottom, margins.top]).domain([
            0,
            d3.max(revs, (d) => d.size),
        ]);

        svg = d3
            .select(`svg#${id}`)
            .attr("class", "m-auto")
            .attr("width", width)
            .attr("viewBox", [0, 0, width, height]);

        svg.transition(t)
            .ease(d3.easeExpInOut)
            .attr("width", width)
            .attr("style", "max-width: 100%; height: auto; overflow: visible;");

        d3.select(`h3#${id}`).html(
            `Article size of '${$parserStore.title.replaceAll("_", " ")}' in the '${$parserStore.lang}' Wikipedia`,
        );

        d3.select(idHandler.selector("g", "gx")).call(
            d3.axisBottom(x).tickSizeOuter(0),
        );

        d3.select(idHandler.selector("g", "gy")).call(d3.axisLeft(y));

        var container = d3.select(idHandler.selector("g", "container"));

        d3.select(idHandler.selector("path", "area")).attr(
            "d",
            area(revs.map((d) => d.size)),
        );

        d3.select(idHandler.selector("path", "line")).attr(
            "d",
            line(revs.map((d) => d.size)),
        );

        var container = d3
            .select(idHandler.selector("g", "points"))
            .selectAll(idHandler.selector("circle", "revision"))
            .data(revs)
            .join(
                (enter) => {
                    enter
                        .append("circle")
                        .attr("id", idHandler.register("circle", "revision"))
                        .attr("cx", (d) => x(d.timestamp))
                        .attr("cy", (d) => y(d.size) - y(0))
                        .attr("r", 4)
                        .attr("fill", "#615fff");
                },
                (update) => {
                    update
                        .attr("cx", (d) => x(d.timestamp))
                        .attr("cy", (d) => y(d.size) - y(0))
                        .transition(t)
                        .ease(d3.easeExpInOut)
                        .attr("fill", "#615fff")
                        .attr("r", 4);
                },
                (exit) => {
                    exit.remove();
                },
            );

        svg.select(idHandler.selector("text", "xlabel"))
            .attr("x", width - margins.right)
            .attr("y", height - margins.bottom + 35);

        svg.selectAll("text").attr("font-size", 12);
    };

    // @ts-ignore
    $effect(() => {
        if ($hasRevisionsStore) {
            update();
        }
    });
</script>

<!-- Title container -->
<div class="pb-8">
    <div class="m-auto max-w-4xl py-4 px-4 sm:px-6 lg:px-8">
        <!-- svelte-ignore a11y_missing_content -->
        <h3 {id} class="text-xl md:text-2xl font-semibold text-gray-900"></h3>
    </div>
    <!-- Container where the visualisation is rendered in. -->
    <div {id} class="pt-2"></div>
</div>
