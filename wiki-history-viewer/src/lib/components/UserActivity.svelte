<script lang="js">
    // @ts-nocheck
    import { onMount } from "svelte";
    import * as d3 from "d3";

    import { IdHandler } from "$lib/components/utils";
    import { queryConfig } from "$lib/config";

    let {
        revisions = $bindable(),
        dataOptions = $bindable(),
        ...props
    } = $props();

    // Visualisation variables
    const id = props.id;
    const idHandler = new IdHandler(id);
    const width = 1200;
    const height = 600;
    const margins = { right: 20, top: 20, left: 80, bottom: 40 };
    const overlap = 8;
    const t = queryConfig.decay;

    // Internal helper variables
    let revs = [];
    let series = [];

    // Variables used inside the svg
    let x = d3.scaleUtc().range([width - margins.right, margins.left]);
    let y = d3.scaleBand().range([margins.top, height - margins.bottom]);
    let svg = undefined;
    let users = undefined;

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
    };

    const getDataAsSeries = () => {
        return d3
            .groups(revs, (d) => d.user.name)
            .map(([name, children]) => ({
                name: name,
                children: children,
            }));
    };

    const getLineData = (seriesGroups) => {
        return seriesGroups.map((d) => [
            { name: d.children[0].user.name, x: width - margins.right },
            { name: d.children[0].user.name, x: margins.left },
        ]);
    };

    const line = d3
        .line()
        .x((d) => d.x)
        // Center horizontally inside the group
        .y((d) => y(d.name) + y.bandwidth() / 2 + 0.75);

    onMount(() => {
        transformInputData(dataOptions);
        series = getDataAsSeries();

        x.domain(d3.extent(revs.map((r) => r.timestamp)));
        y.domain(series.map((r) => r.name));

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
            `Edit activity by users on '${props.result.title.replaceAll("_", " ")}' in the '${props.result.lang}' Wikipedia`,
        );

        svg.append("g")
            .attr("id", idHandler.register("g", "gxtop"))
            .attr("transform", `translate(0,${margins.top - 1})`)
            .call((g) => {
                g.append("g")
                    .append("text")
                    .attr("x", width - margins.right)
                    .attr("y", -30)
                    .attr("fill", "black")
                    .attr("text-anchor", "end")
                    .text("Past →");

                g.append("g")
                    .append("text")
                    .attr("x", margins.left)
                    .attr("y", -30)
                    .attr("fill", "black")
                    .attr("text-anchor", "start")
                    .text("↓ Latest Edit");
            });

        svg.append("g")
            .attr("id", idHandler.register("g", "gxbottom"))
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

        svg.append("g")
            .attr("id", idHandler.register("g", "gy"))
            .attr("transform", `translate(${margins.left},0)`)
            .call(d3.axisLeft(y).tickSize(0).tickPadding(4))
            .call((g) => g.select(".domain").remove());

        svg.append("g").attr("id", idHandler.register("g", "container"));

        update();
    });

    const update = () => {
        transformInputData(dataOptions);
        series = getDataAsSeries();

        x.domain(d3.extent(revs.map((r) => r.timestamp)));
        y.domain(series.map((r) => r.name));

        d3.select(idHandler.selector("g", "gxtop")).call(
            d3
                .axisTop(x)
                .ticks(width / 80)
                .tickSizeOuter(0),
        );

        d3.select(idHandler.selector("g", "gxbottom")).call(
            d3
                .axisBottom(x)
                .ticks(width / 80)
                .tickSizeOuter(0),
        );

        d3.select(idHandler.selector("g", "gy"))
            .call(d3.axisLeft(y).tickSize(0).tickPadding(4))
            .call((g) => g.select(".domain").remove());

        d3.select(idHandler.selector("g", "container"))
            .selectAll(idHandler.selector("path", "activity"))
            .data(getLineData(series))
            .join(
                (enter) => {
                    enter
                        .append("path")
                        .attr("id", idHandler.register("path", "activity"))
                        .attr("stroke", "#ddd")
                        .transition(t)
                        .ease(d3.easeExpInOut)
                        .attr("d", (d) => line(d));
                },
                (update) => {
                    update
                        .transition(t)
                        .ease(d3.easeExpInOut)
                        .attr("d", (d) => line(d));
                },
                (exit) => exit.remove(),
            );

        d3.select(idHandler.selector("g", "container"))
            .selectAll(idHandler.selector("g", "series"))
            .data(series)
            .join(
                (enter) => {
                    var container = enter
                        .append("g")
                        .attr("id", idHandler.register("g", "series"))
                        .attr(
                            "transform",
                            (d) => `translate(0,${y(d.name) + 1})`,
                        );

                    container
                        .selectAll("circle")
                        .data((d) => d.children)
                        .join("circle")
                        .attr("fill", "#615fff")
                        .attr("r", 2.5)
                        .attr("cx", (d) => x(d.timestamp))
                        .transition(t)
                        .ease(d3.easeExpInOut)
                        .attr("cy", y.bandwidth() / 2);
                },
                (update) => {
                    var container = update
                        .transition(t)
                        .ease(d3.easeExpInOut)
                        .attr(
                            "transform",
                            (d) => `translate(0,${y(d.name) + 1})`,
                        );

                    update
                        .selectAll("circle")
                        .data((d) => d.children)
                        .join("circle")
                        .attr("fill", "#615fff")
                        .attr("r", 2.5)
                        .attr("cx", (d) => x(d.timestamp))
                        .transition(t)
                        .ease(d3.easeExpInOut)
                        .attr("cy", y.bandwidth() / 2);
                },
                (exit) => exit.remove(),
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
<div class="pb-8">
    <div class="m-auto max-w-4xl py-4 px-4 sm:px-6 lg:px-8">
        <!-- svelte-ignore a11y_missing_content -->
        <h3 {id} class="text-2xl font-semibold text-gray-900"></h3>
    </div>
    <!-- Container where the visualisation is rendered in. -->
    <div {id} class="pt-2"></div>
</div>
