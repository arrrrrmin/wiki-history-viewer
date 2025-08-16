<script lang="js">
    // @ts-nocheck
    import { onMount } from "svelte";
    import * as d3 from "d3";

    import * as utils from "./utils";

    let { id: string, revisions = $bindable(), ...props } = $props();

    const id = props.id;
    const width = 1000;
    const height = 900;
    const margins = { right: 20, top: 20, left: 80, bottom: 40 };
    const overlap = 5;
    const t = 300;

    let timestamps = [];
    let deltas = [];
    let series = [];

    const getElements = (elementName) => {
        return revisions.map((r) => r[elementName]);
    };

    const getEditors = () => {
        return d3.groups((r) => r.user.name, revisions);
    };

    let x = undefined;
    let y = undefined;
    let z = undefined;
    let svg = undefined;
    let groups = undefined;

    const getTimestamps = () => {
        return Array.from(d3.group(revisions, (d) => +d.timestamp).keys()).sort(
            d3.ascending,
        );
    };

    const getSeries = () => {
        return d3
            .groups(revisions, (d) => d.user.name)
            .map(([name, values]) => {
                const value = new Map(
                    values.map((d) => [+d.timestamp, Math.abs(d.size)]),
                );
                return {
                    name,
                    values: timestamps.map((d) => value.get(d) | 0),
                };
            })
            .sort((a, b) => d3.sum(a.values) - d3.sum(b.values));
    };

    let area = d3
        .area()
        .curve(d3.curveBasis)
        .defined((d) => !isNaN(d))
        .x((d, i) => x(timestamps[i]))
        .y0(0)
        .y1((d) => z(d));

    let line = area.lineY1();

    onMount(() => {
        timestamps = getTimestamps();
        series = getSeries();

        // Create the scales.
        x = d3.scaleTime().range([width - margins.right, margins.left]);
        y = d3.scalePoint().range([margins.top, height - margins.bottom]);
        z = d3.scaleLinear().nice();

        x.domain(d3.extent(timestamps));
        y.domain(series.map((d) => d.name));
        z.domain([0, d3.max(series, (d) => d3.max(d.values))]).range([
            0,
            -overlap * y.step(),
        ]);

        // Create the SVG container.
        svg = d3
            .select(`div#${id}`)
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [0, 0, width, height])
            .attr("style", "max-width: 100%; height: auto; overflow: visible;");

        // Append the axes.
        var gx = svg
            .append("g")
            .attr("id", "gx")
            .attr("transform", `translate(0,${height - margins.bottom})`)
            .call(
                d3
                    .axisBottom(x)
                    .ticks(width / 80)
                    .tickSizeOuter(0),
            );

        svg.append("g")
            .attr("id", "gy")
            .attr("transform", `translate(${margins.left},0)`)
            .call(d3.axisLeft(y).tickSize(0).tickPadding(4))
            .call((g) => g.select(".domain").remove());

        groups = svg.append("g").attr("id", "groups");

        update();
    });

    const update = () => {
        timestamps = getTimestamps();
        series = getSeries();

        x.domain(d3.extent(timestamps));
        y.domain(series.map((d) => d.name));
        z.domain([0, d3.max(series, (d) => d3.max(d.values))]).range([
            0,
            -overlap * y.step(),
        ]);

        d3.select("g#gx")
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

        d3.select("g#gy")
            .call(d3.axisLeft(y).tickSize(0).tickPadding(4))
            .call((g) => g.select(".domain").remove());

        d3.select("g#groups")
            .selectAll("g#series-container")
            .data(series)
            .join(
                (enter) => {
                    var container = enter
                        .append("g")
                        .attr("id", "series-container")
                        .call((enter) =>
                            enter.attr(
                                "transform",
                                (d) => `translate(0,${y(d.name) + 1})`,
                            ),
                        );
                    container
                        .append("path")
                        .attr("id", "area")
                        .attr("fill", "#ddd")
                        .attr("d", (d) => area(d.values));
                    container
                        .append("path")
                        .attr("id", "line")
                        .attr("fill", "none")
                        .attr("stroke", "black")
                        .attr("d", (d) => line(d.values));
                },
                (update) => {
                    var container = update.call((update) =>
                        update
                            .transition(t)
                            .ease(d3.easeExpIn)
                            .attr(
                                "transform",
                                (d) => `translate(0,${y(d.name) + 1})`,
                            ),
                    );

                    container
                        .select("path#area")
                        .attr("d", (d) => area(Array(d.values.length).fill(0)))
                        // .call((update) => update.transition(t))
                        //.transition(t)
                        //.ease(d3.easeExpIn)
                        .attr("d", (d) => area(d.values));

                    container
                        .select("path#line")
                        .attr("d", (d) => area(Array(d.values.length).fill(0)))
                        // .call((update) => update.transition(t))
                        //.transition(t)
                        //.ease(d3.easeExpIn)
                        .attr("d", (d) => line(d.values));
                },
                (exit) => exit,
            );
    };

    // @ts-ignore
    $effect(() => {
        if (revisions) {
            update();
        }
    });
</script>

<div {id} style="margin-top: 100px;"></div>
