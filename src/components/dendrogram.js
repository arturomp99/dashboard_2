import React, {createRef} from 'react';
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import "../css/dendrogram.css"   // Includes the stylesheet

export default class Dendrogram extends React.Component {

    constructor(props)
    {
        super(props);
        this.dendrogramRef = createRef();
        // Reading props
        this.data = props.data;
        this.btn = props.children;
        // TWEAKABLES
        this.duration = 750;
        this.r_1 = 12;
        this.r_2 = 10;
        this.marginLeft = 2*this.r_1;
        // GENERICS
        this.root = undefined;
        this.i = 0;
        this.treemap = d3.tree()
            .nodeSize([this.r_1, this.r_1])
            .separation((a,b)=>a.parent === b.parent ? 1.2 + (a.height + b.height)/2 : 1.2 + (a.height + b.height)/2 + this.r_1*0.1);
    }

    render() {
        return (
            <>
                <svg ref={this.dendrogramRef} style={{position: "absolute", top:"0px"}}></svg>
                {this.btn}
            </>
        )
    }

    componentDidMount() {
        let svg1 = d3   // Default dendrogram while the data are being read processed
            .select(this.dendrogramRef.current)
                .attr('class', 'dendrogramContainer')
            .append('g')    // Solución para evitar que se panee a en el primer zoomEvent. Zoom se aplica en este <g>. En el siguiente se aplican los márgenes
                .attr('class','zoom');
        this.svg = svg1
            .append('g')
                .attr('class', 'zoomContainer');  // We translate it so that it is centered in the view
        // Add zoom
        this.zoom = d3.zoom().scaleExtent([0.2, 10])
            .on('zoom', (e)=>svg1.attr('transform', e.transform));
        d3.select(this.dendrogramRef.current).call(this.zoom);

        if(this.props.data.length !== 0) {
            this.root = d3.hierarchy(this.props.data);
            this.root.x0 = 0;
            this.root.y0 = 0;
            this.root.children.forEach(e=>this.#collapse(e));
            this.#update(this.root);  
        }
    }

    componentDidUpdate(prevProps) {
        if(this.props.data !== prevProps.data) { // Check if the data has been read
            this.root = d3.hierarchy(this.props.data);
            this.root.x0 = 0;
            this.root.y0 = 0;
            this.root.children.forEach(e=>this.#collapse(e));
            this.#update(this.root);   
        }
    }

    #update(source) {
        let treeData = this.treemap(this.root);  // Assigns the x and y positions for the nodes
            let nodes = treeData.descendants(),
                links = treeData.descendants().slice(1);    // Compute the new tree layout
            nodes.forEach((d)=>{d.y = d.depth * 140});   // Normalize for fixed depth

        // ****************** Nodes section ***************************
        // Update the nodes...
        var node = this.svg
                .selectAll('g.node')
                .data(nodes, (d) => d.id || (d.id = ++this.i)) // here, if d.id exists and is truthy, just return d.id; if not, then assign d.id to ++i
        
                // Enter any new nodes at the parent's previous position
        var nodeEnter = node
                .enter()
                .append('g')
                .attr('class', 'node')
                .attr('transform', `translate(${source.y0},${source.x0})`)
                .on('click', (event, d) => {    // https://stackoverflow.com/questions/48811612/es6-how-to-call-a-class-function-from-a-callback-function
                    if (d.children) {
                        d._children = d.children;
                        d.children = null;
                    } else {
                        d.children = d._children;
                        d._children = null;
                    }
                    this.#update(d);        // We use an arrow function in order not to change the meaning of this
                });
            
        // Add circle as node
        nodeEnter
            .append('circle')
            .attr('class', 'node')
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('r', 1e-6)
            .style('fill', (d)=>d._children ? 'green' : 'white');

        // Add labels for the nodes
        nodeEnter
            .append('text')
            .attr("x", (d)=> d._children || d.children ? -this.r_1*1.2 : this.r_1*1.2)
            .attr("y", (d)=> d._children || d.children ? -this.r_1*0.2 : this.r_1*0.2)
            .attr("text-anchor", (d)=> d._children || d.children ? "end" : "start") // Different anchor for leaf nodes
            .text((d)=> d.name || d.data.name || d.data[0] || d.data.scientificName) // || d.data.data.id);    // d.data.data.id es para los paises
        // TODO, Get the bbox of each label
        // nodeEnter.selectAll('text').each((d)=>{
        //     d.bbox = this.getBBox();
        //     console.log(d.bbox);
        // });
            // .insert('rect','text') // TODO, Display a semitransparent rect behind labels https://observablehq.com/@pbrockmann/d3_colored_background_to_a_text
            // .attr('x', d=>d.getBBox().x)     //https://www.geeksforgeeks.org/d3-js-selection-insert-function/
            // .style('fill','red');

        // UPDATE
        var nodeUpdate = nodeEnter.merge(node);

        // Transition to the proper position for the node
        nodeUpdate
            .transition()
            .duration(this.duration)
            .attr("transform", d=>`translate(${d.y}, ${d.x})`);

        // Transition for the circles
        nodeUpdate
            .selectAll('circle.node')
            .transition()
            .duration(this.duration)
            .attr('r', (d)=>d._children ? this.r_1 : this.r_2)
            .style('fill', (d)=>d._children ? 'white' : 'green');
        
        // Remove any existing nodes
        var nodeExit = node
            .exit()
            .transition()
            .duration(this.duration)
            .attr('transform', (d)=>{ return `translate(${source.y},${source.x})`; })   // (y,x) y no (source.y0, source.x0) porque source puede ser que se mueva tambien, vamos a la nueva posicion de source
            .remove();

        // On exit reduce the node circles size to 0
        nodeExit
            .select('rect.node')
            .attr('width', 1e-6)
            .attr('height', 1e-6);
        
        // On exit reduce the opacity of text labels
        nodeExit
            .select('text')
            .style('fill-opacity', 1e-6);

        // On exit reduce the opacity of text icon
        nodeExit
            .select('path.node')
            .style('fill-opacity', 1e-6)
            .style('stroke-opacity', 1e-6);

        // ****************** links section ***************************
        // Update the links...
        var link = this.svg.selectAll('path.link').data(links, d=>d.id);

        // Enter any new links at the parent's previous position
        var linkEnter = link
            .enter()
            .insert('path', 'g')
            .attr('class', 'link')
            .attr('d', (d)=> {
                var o = {x:source.x0, y:source.y0};
                return this.#diagonal(o,o);
            });

        // UPDATE
        let linkUpdate = linkEnter.merge(link);

        // Transition back to the parent element position
        linkUpdate
            .transition()
            .duration(this.duration)
            .attr('d', (d)=>this.#diagonal(d, d.parent));

        // Remove any existing links
        var linkExit = link
            .exit()
            .transition()
            .duration(this.duration)
            .attr('d', (d)=> {
                var o = {x: source.x, y: source.y};
                return this.#diagonal(o, o);
            }).remove();

        // Store the old positions for transition
        nodes.forEach(function(d){
            d.x0 = d.x;
            d.y0 = d.y;
    });
    }

    // Collapse the node and all its children
    #collapse(d) {
        if(d.children) {    // If it has children
            d._children = d.children;   // Set them as collapsed
            d.children.forEach(e=>this.#collapse(e));  // Check if the children have children of their own
            d.children = null;
        }
    }

    // Toggle children on click
    #click(event, d) {
        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else {
            d.children = d._children;
            d._children = null;
        }
        this.#update(d);
    }

    #diagonal(s, d) {
        let path = `M${s.y} ${s.x}
                C ${(s.y + d.y) / 2} ${s.x},
                ${(s.y + d.y) / 2} ${d.x},
                ${d.y} ${d.x}`
        return path;
    }
}