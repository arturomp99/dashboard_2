import React, {createRef} from 'react';
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import './../css/timeline.css'

export default class Dendrogram extends React.Component {

    constructor(props)
    {
        super(props);
        this.timelineRef = createRef();
        // Reading props
        this.data = props.data;
        
        // Tweakables
        this.animals = [];
    }

    render() {
        return (
        <svg ref={this.timelineRef}></svg>
        )
    }

    componentDidMount() {
        this.svg = d3.select(this.timelineRef.current)
            .attr('class', 'timelineContainer')
    }

    componentDidUpdate(prevProps) {
        if (this.props.data !== this.data) {
            this.data = this.props.data;
            this.data["detected animals"].forEach(e => {
                if(this.animals.indexOf(e.id)===-1) this.animals.push(e.id);
            });
            this.#update();
        }
    }

    #update() {
        // https://stackoverflow.com/questions/46649417/bbox-of-svg-is-zero
        let w = this.svg.node().getBoundingClientRect().width;
        let h = this.svg.node().getBoundingClientRect().height;
        // *********************** CREATE COLOR SCALE
        let colorScale = d3
            .scaleLinear()
            .domain([0, this.animals.length])
            .range(["#00B9FA", "#F95002"])
            .interpolate(d3.interpolateHcl);

        // *********************** CREATE AXES
        // Horizontal axis: temporal
            /*  Data processing
            *   Javascript date format
            *   YYY-MM-DD
            *   YYY-MM-DDTHH:MM:SSZZ
            */ 
        let timeScale = d3.scaleTime()
            .domain([d3.min(this.data["detected animals"], (d)=> new Date(d.start_time)),
                d3.max(this.data["detected animals"], (d)=> new Date(d.finish_time))])
            .range([0,w]);
        let xAxis = d3
            .axisBottom(timeScale)
            .ticks(d3.timeMinute.every(10)) // create a tick each minute
            .tickSize(10)   // The ticksize could be a function of the dimensions of the chart (https://www.geeksforgeeks.org/d3-js-axis-ticksize-function/)
            .tickFormat(d3.timeFormat('%H:%M:%S'));  // (https://d3-wiki.readthedocs.io/zh_CN/master/Time-Formatting/)
        let horAxis = this.svg
            .append('g')
            .attr('class','axis')
            .call(xAxis);

        // Vertical one: categorical
        // Data processing (https://observablehq.com/@d3/d3-scaleband)
        let graphHeight = h - horAxis.node().getBBox().height;
        let animalsScale = d3
            .scaleBand()
            .domain(this.animals)
            .range([0, graphHeight]);   // Le quitamos la altura del eje horizontal, ya que este es desplayado hacia arriba
        let yAxis = d3
            .axisLeft(animalsScale)
            .tickSize(10);
        let vertAxis = this.svg
            .append('g')
            .attr('class', 'axis')
            .call(yAxis);
        // Correct the width of the horizontal sccale
        let graphWidth = w - vertAxis.node().getBBox().width;
        timeScale.range([0, graphWidth]);
        horAxis.call(xAxis);

        // Translate the axes. TODO, Could this be optimized?
        horAxis
            .attr('transform',`translate(${vertAxis.node().getBBox().width},${ graphHeight})`);
        vertAxis
            .attr('transform', `translate(${vertAxis.node().getBBox().width},0)`); 
        // Correct the width of the horizontal sccale
        timeScale.range([0, graphWidth]);
        horAxis.call(xAxis);

        // Translate the axes. TODO, Could this be optimized?
        horAxis
            .attr('transform',`translate(${vertAxis.node().getBBox().width},${ graphHeight})`);
        vertAxis
            .attr('transform', `translate(${vertAxis.node().getBBox().width},0)`);

        // Num ID for each animal
        let animalsIDs = d3.scaleBand().domain(this.animals).range([0, this.animals.length])

        // ************************ CREATE RECTANGLES
        let rectWidth = graphHeight / this.animals.length;   // The width of the rectangles is equally distributed along the whole height
        const rectMargin = 0;  // Separation between rectangles
        this.svg
            .append('g')
            .selectAll('rect')
            .data(this.data["detected animals"])
            .join('rect')
                .attr("x", d=>vertAxis.node().getBBox().width + timeScale(new Date(d.start_time)))
                .attr("y", d=>animalsScale(d.id) + rectMargin/2)
                .attr("rx", rectWidth/20)   // The edges rounding is a function of the height of the rectangles
                .attr("width", d=>timeScale(new Date(d.finish_time)) - timeScale(new Date(d.start_time)))
                .attr("height", rectWidth - rectMargin)
                .style("fill", d=>colorScale(animalsIDs(d.id)))
                .style("stroke", "none");
    }
}