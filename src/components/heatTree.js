import React, {createRef} from 'react';
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import './../css/HeatTree.css'

export default class HeatTree extends React.Component {

    constructor(props)
    {
        super(props);
        this.heatTreeRef = createRef();
    }

    render() {
        return (
            <svg ref={this.heatTreeRef} className={"heatTreeContainer"}></svg>
        )
    }

    componentDidMount() {
        this.svg = d3.select(this.heatTreeRef.current)
                .append('g')    // Solución para evitar que se panee a en el primer zoomEvent. Zoom se aplica en este <g>. En el siguiente se aplican los márgenes
                .attr('class','zoom');
                        // Add zoom
        this.zoom = d3.zoom().scaleExtent([0.2, 10])
            .on('zoom', (e)=>this.svg.attr('transform', e.transform));
            d3.select(this.heatTreeRef.current).call(this.zoom);
        if (this.props.data.documentElement !== null) {
             this.#add(this.props.data.documentElement);
        }
    }

    componentDidUpdate(prevProps) {
        if (this.props.data !== prevProps.data) {
            this.#add(this.props.data.documentElement);
        }
    }

    #add(svg) { 
        this.svg.node().append(svg);
        // Add viewbox so that it adjustes to the space that it has
        d3.select(this.heatTreeRef.current)
            .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox", `0 0 ${this.svg.node().getBBox().width} ${this.svg.node().getBBox().height}`)
    }
}