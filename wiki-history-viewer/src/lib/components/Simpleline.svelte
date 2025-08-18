<script lang="js">
    // @ts-nocheck
    import { onMount } from "svelte";
    import * as d3 from "d3";

    import * as utils from "$lib/components/utils";
    import { queryConfig } from "$lib/config";

    import DataOptions from "./DataOptions.svelte";

    let {
        revisions = $bindable(),
        dataOptions = $bindable(),
        ...props
    } = $props();

    // Visualisation variables
    const id = props.id;
    const idHandler = new utils.IdHandler(id);
    const width = 1200;
    const height = 450;
    const margins = { right: 20, top: 20, left: 80, bottom: 40 };
    const t = queryConfig.decay;

    // Internal helper variables
    let revs = [];

    // Variables used inside the svg
    let x = d3.scaleUtc().range([width - margins.right, margins.left]);
    let y = d3
        .scaleLinear()
        .nice()
        .range([height - margins.bottom, margins.top]);
    let svg = undefined;
    let titleEl = undefined;

    // Todo move this to a utils file
    const transformInputData = ({
        allowMinors = true,
        allowUnknownEditors = true,
        filterMinValue = 0,
    }) => {
        // Transform input data for internal usage
        if (!revisions) return;
        revs = revisions.slice();

        revs = revs.filter((r) => r.delta);
        if (!allowMinors) {
            revs = revs.filter((r) => !r.minor);
        }
        if (!allowUnknownEditors) {
            revs = revs.filter((r) => !r.user.name.startsWith("~"));
        }
        revs = revs.map((d) => ({ ...d, delta: Math.abs(d.delta) }));
        revs = revs.sort((a, b) => a.timestamp - b.timestamp);
        console.log(revs);
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
        transformInputData(dataOptions);

        svg = d3
            .select(`div#${id}`)
            .append("svg")
            .attr("class", "m-auto")
            .attr("width", width)
            .attr("style", "max-width: 100%; height: auto; overflow: visible;");

        svg.transition(t)
            .ease(d3.easeExpInOut)
            .attr("height", height)
            .attr("viewBox", [0, 0, width, height]);

        d3.select(`h3#${id}`).html(
            `Article size of '${props.result.title.replaceAll("_", " ")}' in the ${props.result.lang}-Wikipedia`,
        );

        svg.append("g")
            .attr("id", idHandler.register("g", "gx"))
            .attr("transform", `translate(0,${height - margins.bottom})`)
            .call((g) => {
                g.append("g")
                    .append("text")
                    .attr("x", width - margins.right)
                    .attr("y", 30)
                    .attr("fill", "black")
                    .attr("text-anchor", "end")
                    .text("Past →");

                g.append("g")
                    .append("text")
                    .attr("x", margins.left)
                    .attr("y", 30)
                    .attr("fill", "black")
                    .attr("text-anchor", "start")
                    .text("↑ Latest Edit");
            });

        var gy = svg
            .append("g")
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
        //.call((g) => g.select(".domain").remove());

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

        update();
    });

    const update = () => {
        transformInputData(dataOptions);

        x.domain(d3.extent(revs, (d) => d.timestamp));
        y.domain([0, d3.max(revs, (d) => Math.abs(d.size))]);

        d3.select(idHandler.selector("g", "gx")).call(
            d3
                .axisBottom(x)
                .ticks(width / 80)
                .tickSizeOuter(0),
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
                        .attr("r", 2)
                        .attr("fill", "#615fff");
                },
                (update) => {
                    update
                        .attr("fill", "black")
                        .attr("r", 1)
                        .attr("cx", (d) => x(d.timestamp))
                        .attr("cy", (d) => y(d.size) - y(0))
                        .transition(t)
                        .ease(d3.easeExpInOut)
                        .attr("fill", "#615fff")
                        .attr("r", 2);
                },
                (exit) => {
                    exit.remove();
                },
            );
    };

    $effect(() => {
        if (revisions) {
            update();
        }
    });
</script>

<!-- Title container -->
<div class="pb-8">
    <div class="m-auto max-w-4xl py-4 px-4 sm:px-6 lg:px-8">
        <!-- svelte-ignore a11y_missing_content -->
        <h3 {id} class="text-2xl font-semibold text-gray-900"></h3>
    </div>
    <!-- Container where the visualisation is rendered in. -->
    <div {id} class="pt-2"></div>
</div>
