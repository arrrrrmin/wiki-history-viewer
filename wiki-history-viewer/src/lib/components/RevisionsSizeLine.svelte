<script lang="js">
    // @ts-nocheck

    import { onMount } from "svelte";
    import * as d3 from "d3";

    import * as utils from "./utils";

    let { id: string, revisions = $bindable(), ...props } = $props();

    const id = props.id;
    const width = props.width;
    const height = props.height;
    const margins = { right: 50, top: 20, left: 20, bottom: 20 };

    let svg = undefined;
    let g = undefined;
    let gmain = undefined;
    let gx = undefined;
    let gy = undefined;
    let path = undefined;
    let xScale = d3
        .scaleUtc()
        .range([0, width - (margins.left + margins.right)]);
    let yScale = d3
        .scaleLinear()
        .range([height - (margins.top + margins.bottom), 0]);

    $inspect(revisions);
    console.log(props);

    const line = d3
        .line()
        .x((d) => xScale(d.timestamp))
        .y((d) => yScale(d.delta));

    // Run once when mounted
    onMount(() => {
        svg = d3
            .select(`div#${id}`)
            .append("svg")
            .attr("width", width)
            .attr("height", height);
        gmain = svg
            .append("g")
            .attr("transform", `translate(${margins.left},${margins.top})`);
        gx = svg
            .append("g")
            .attr("id", "gx")
            .attr(
                "transform",
                `translate(0,${height - margins.top - margins.bottom})`,
            );
        gy = svg
            .append("g")
            .attr("id", "gy")
            .attr("transform", `translate(${margins.left},0)`);
        path = gmain.append("path").attr("id", "gmain-path");
    });

    const update = () => {
        let minDate = d3.min(revisions, (d) => new Date(d.timestamp));
        let maxDate = d3.max(revisions, (d) => new Date(d.timestamp));
        let minDelta = d3.min(revisions, (d) => new Date(d.delta));
        let maxDelta = d3.max(revisions, (d) => new Date(d.delta));
        xScale.domain([
            minDate ? minDate : new Date(),
            maxDate ? maxDate : new Date(),
        ]);
        d3.select("g#gx").call(
            d3
                .axisBottom(xScale)
                .ticks(width / 80)
                .tickSizeOuter(0),
        );

        yScale.domain([minDelta ? minDelta : 0, maxDelta ? maxDelta : 0]);
        d3.select("g#gy").call(d3.axisLeft(yScale).ticks(height / 40));

        // Append a path for the line.
        d3.select("path#gmain-path")
            .data(revisions)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5)
            .attr("d", line(revisions));
    };

    // Re-run whenever revisions changes
    // @ts-ignore
    $effect(() => {
        if (revisions) {
            update();
        }
    });
</script>

<div {id}></div>
