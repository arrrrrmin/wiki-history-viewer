<script lang="js">
    // @ts-nocheck
    import { onMount } from "svelte";
    import * as d3 from "d3";

    import { parserStore } from "$lib/stores/parser";
    import { revisionsStore, hasRevisionsStore } from "$lib/stores/revisions";
    import { dataSettingsStore } from "$lib/stores/datasettings";
    import { isMobileStore } from "$lib/stores/mobile";

    import * as utils from "$lib/components/utils";
    import { queryConfig } from "$lib/config";

    let { dataOptions = $bindable(), ...props } = $props();

    // Visualisation variables
    const id = props.id;
    const idHandler = new utils.IdHandler(id);
    let width = utils.getDependentWidth();
    let height = 600;
    const margins = { right: 20, top: 40, left: 80, bottom: 40 };
    const t = queryConfig.decay;

    // Internal helper variables
    let revs = [];
    let series = [];

    // Variables used inside the svg
    let x = d3.scaleUtc();
    let y = d3.scaleBand();
    let svg = undefined;
    let users = undefined;

    const getHeight = (series) => {
        if (!series) return 0;
        return series.length * 20;
    };

    const transformInputData = () => {
        // Transform input data for internal usage
        if (!$hasRevisionsStore) return;
        let revs = $revisionsStore.revisions.slice();

        if (!$dataSettingsStore.allowMinors) {
            revs = revs.filter((r) => !r.minor);
        }
        if (!$dataSettingsStore.allowUnknownEditors) {
            revs = revs.filter((r) => !r.user.name.startsWith("~"));
        }
        revs.sort((a, b) => a.timestamp - b.timestamp);
        return revs;
    };

    const getDataAsSeries = () => {
        let series = d3
            .groups(revs, (d) => d.user.name)
            .map(([name, children]) => ({
                name: name,
                children: children,
            }));
        return series;
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
        revs = transformInputData();
        series = getDataAsSeries();

        width = utils.getDependentWidth();
        height = getHeight(series);

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

        svg.transition(t)
            .ease(d3.easeExpInOut)
            .attr("width", width)
            .attr("viewBox", [0, 0, width, height]);

        svg.append("g")
            .attr("id", idHandler.register("g", "gxtop"))
            .attr("transform", `translate(0,${margins.top - 1})`);

        svg.append("g")
            .attr("id", idHandler.register("g", "gxbottom"))
            .attr("transform", `translate(0,${height - margins.bottom})`);

        svg.append("g")
            .attr("id", idHandler.register("g", "gy"))
            .attr("transform", `translate(${margins.left},0)`)
            .call(d3.axisLeft(y).tickSize(0).tickPadding(4))
            .call((g) => g.select(".domain").remove());

        svg.append("g").attr("id", idHandler.register("g", "container"));

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
        series = getDataAsSeries();

        width = utils.getDependentWidth();
        height = getHeight(series);

        x.range([width - margins.right, margins.left]).domain(
            d3.extent(revs.map((r) => r.timestamp)),
        );
        y.range([margins.top, height - margins.bottom]).domain(
            series.map((r) => r.name),
        );

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
            `Users activity on '${$parserStore.title.replaceAll("_", " ")}' in the '${$parserStore.lang}' Wikipedia`,
        );

        d3.select(idHandler.selector("g", "gxtop")).call(
            d3.axisTop(x).tickSizeOuter(0),
        );

        d3.select(idHandler.selector("g", "gxbottom"))
            .attr("transform", `translate(0,${height - margins.bottom})`)
            .call(d3.axisBottom(x).tickSizeOuter(0));

        d3.select(idHandler.selector("g", "gy"))
            .call(d3.axisLeft(y).tickSize(0).tickPadding(4))
            .call((g) => g.select(".domain").remove())
            .call((g) => {
                g.selectAll("text").text((d) =>
                    d.length <= 9 ? d : `${d.slice(0, 9)}...`,
                );
            });

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
                        .attr("cx", (d) => x(d.timestamp))
                        .transition(t)
                        .ease(d3.easeExpInOut)
                        .attr("r", 4)
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
                        .attr("cx", (d) => x(d.timestamp))
                        .transition(t)
                        .ease(d3.easeExpInOut)
                        .attr("r", 4)
                        .attr("cy", y.bandwidth() / 2);
                },
                (exit) => exit.remove(),
            );

        svg.select(idHandler.selector("text", "xlabel"))
            .attr("x", width - margins.right)
            .attr("y", height - margins.bottom + 35);

        svg.selectAll("text").attr("font-size", 12);
    };

    // @ts-ignore
    $effect(() => {
        if ($hasRevisionsStore && $isMobileStore !== undefined) {
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
