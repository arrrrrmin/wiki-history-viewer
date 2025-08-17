<script lang="js">
    // @ts-nocheck
    import { onMount } from "svelte";
    import * as d3 from "d3";

    import { IdHandler } from "$lib/components/utils";

    let {
        revisions = $bindable(),
        dataOptions = $bindable(),
        ...props
    } = $props();

    // Visualisation variables
    const id = props.id;
    const idHandler = new IdHandler(id);
    const width = 1000;
    const height = 900;
    const margins = { right: 20, top: 20, left: 80, bottom: 40 };
    const overlap = 8;
    const t = 300;

    // Internal helper variables
    let revs = [];
    let timestamps = [];
    let deltas = [];
    let series = [];

    // Variables used inside the svg
    let x = d3.scaleTime().range([width - margins.right, margins.left]);
    let y = d3.scalePoint().range([margins.top, height - margins.bottom]);
    let z = d3.scaleLinear().nice();
    let svg = undefined;
    let titleEl = undefined;
    let groups = undefined;

    // Todo move this to a utils file
    const transformInputData = ({
        allowMinors = true,
        allowUnknownEditors = true,
        filterMinValue = 0,
    }) => {
        // Transform input data for internal usage
        if (!revisions) return;
        revs = revisions.slice();

        revs = revs.filter((r) => r.size);
        if (!allowMinors) {
            revs = revs.filter((r) => !r.minor);
        }
        if (!allowUnknownEditors) {
            revs = revs.filter((r) => !r.user.name.startsWith("~"));
        }
    };

    const getTimestamps = () => {
        // Provide all unqiue timestamps sorted ascending
        return Array.from(d3.group(revs, (d) => +d.timestamp).keys()).sort(
            d3.ascending,
        );
    };

    const getSeries = () => {
        // Provide the series data such that every editor has a revisions value per timestamp
        return d3
            .groups(revs, (d) => d.user.name)
            .map(([name, values]) => {
                const value = new Map(
                    values.map((d) => [+d.timestamp, Math.abs(d.size)]),
                );
                return {
                    name,
                    values: timestamps.map((d) => value.get(d) | 0),
                };
            })
            .sort((a, b) => d3.sum(b.values) - d3.sum(a.values));
    };

    // Generators for area and line
    let area = d3
        .area()
        .curve(d3.curveBasis)
        .defined((d) => !isNaN(d))
        .x((d, i) => x(timestamps[i]))
        .y0(0)
        .y1((d) => z(d));

    let line = area.lineY1();

    // Initially called function that creates diagram basics
    onMount(() => {
        transformInputData(dataOptions);
        timestamps = getTimestamps();
        series = getSeries();

        x.domain(d3.extent(timestamps));
        y.domain(series.map((d) => d.name));
        z.domain([0, d3.max(series, (d) => d3.median(d.values))]).range([
            0,
            -40, // -overlap * y.step(),
        ]);

        svg = d3
            .select(`div#${id}`)
            .append("svg")
            .attr("class", "m-auto")
            .attr("width", width)
            //.attr("height", height)
            .attr("style", "max-width: 100%; height: auto; overflow: visible;");

        svg.transition(t)
            .ease(d3.easeExpInOut)
            .attr("height", height)
            .attr("viewBox", [0, 0, width, height]);

        d3.select(`h3#${id}`).html(
            `Edits regarding the article '${props.result.title.replaceAll("_", " ")}' in the ${props.result.lang}-Wikipedia`,
        );

        svg.append("g")
            .attr("id", idHandler.register("g", "gx"))
            .attr("transform", `translate(0,${height - margins.bottom})`)
            .call(
                d3
                    .axisBottom(x)
                    .ticks(width / 80)
                    .tickSizeOuter(0),
            );

        svg.append("g")
            .attr("id", idHandler.register("g", "gy"))
            .attr("transform", `translate(${margins.left},0)`)
            .call(d3.axisLeft(y).tickSize(0).tickPadding(4))
            .call((g) => g.select(".domain").remove());

        groups = svg.append("g").attr("id", idHandler.register("g", "groups"));

        update();
    });

    const update = () => {
        // Update function to fill the diagram with the actual data and handle transitions, updates and exits
        transformInputData(dataOptions);
        timestamps = getTimestamps();
        series = getSeries();

        x.domain(d3.extent(timestamps));
        y.domain(series.map((d) => d.name));
        z.domain([0, d3.max(series, (d) => d3.max(d.values))]).range([
            0,
            -40, // -overlap * y.step(),
        ]);

        d3.select(idHandler.selector("g", "gx"))
            .call(
                d3
                    .axisBottom(x)
                    .ticks(width / 80)
                    .tickSizeOuter(0),
            )
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

        d3.select(idHandler.selector("g", "gy"))
            .call(d3.axisLeft(y).tickSize(0).tickPadding(4))
            .call((g) => g.select(".domain").remove());

        d3.select(idHandler.selector("g", "groups"))
            .selectAll(idHandler.selector("g", "series-container"))
            .data(series)
            .join(
                (enter) => {
                    var container = enter
                        .append("g")
                        .attr("id", idHandler.register("g", "series-container"))
                        .attr(
                            "transform",
                            (d) => `translate(0,${y(d.name) + 1})`,
                        );
                    container
                        .append("path")
                        .attr("id", idHandler.register("path", "area"))
                        .attr("fill", "#ddd")
                        .attr("d", (d) => area(d.values));
                    container
                        .append("path")
                        .attr("id", idHandler.register("path", "line"))
                        .attr("fill", "none")
                        .attr("stroke", "black")
                        .attr("d", (d) => line(d.values));
                },
                (update) => {
                    var container = update
                        .transition(t)
                        .ease(d3.easeExpInOut)
                        .attr(
                            "transform",
                            (d) => `translate(0,${y(d.name) + 1})`,
                        );

                    container
                        .select(idHandler.selector("path", "area"))
                        .attr("d", (d) => area(Array(d.values.length).fill(0)))
                        .attr("d", (d) => area(d.values));

                    container
                        .select(idHandler.selector("path", "line"))
                        .attr("d", (d) => area(Array(d.values.length).fill(0)))
                        .attr("d", (d) => line(d.values));
                },
                (exit) => {
                    exit.remove();
                },
            );
    };

    // @ts-ignore
    $effect(() => {
        if (revisions) {
            update();
        }
    });
</script>

<!-- Title container -->
<div class="m-auto max-w-4xl py-4 px-4 sm:px-6 lg:px-8">
    <!-- svelte-ignore a11y_missing_content -->
    <h3 {id} class="text-xl font-semibold text-gray-900"></h3>
</div>
<!-- Container where the visualisation is rendered in. -->
<div {id} class="pt-2"></div>
