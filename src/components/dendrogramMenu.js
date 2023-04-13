import React, {createRef} from 'react';
import "../css/dendrogramMenu.css";   // Includes the stylesheet


// TODO. COULD WE MAKE IT COLLAPSIBLE????
export default class DendrogramMenu extends React.Component {

    constructor(props)
    {
        super(props);
        this.data = props.data;
        this.menuRef = createRef();
    }

    render() {  // TODO, ¿Cómo añadir margen a la derecha de las etiquetas?
        return (
        <ul ref={this.menuRef}></ul>
        )
    }

    componentDidUpdate(prevProps) {
        this.#addToPage(this.props.data, this.menuRef.current);
        this.#clickFeedback();
    }

    // This function takes an element and a UL to add it to
    #addToPage(d, list) {
        let li = document.createElement('li');  // It creates a list item
        li.textContent = d.name;
        if (d.children) // If it has children
        {
            const span = document.createElement('span');    // A span is created
            span.append(li);    // The list item is added to the span
            li.classList.add('expandable'); // It is defined as expandable
            const innerUL = document.createElement('ul');   // Join them to a new list
            innerUL.classList.add('nested');
            span.append(innerUL);   // The inner nested list is also added to the span, this way parentElement.querySelector(.nested) will query it
            list.append(span); // If there was no span, querySelector() would return the first nested. So if more than one li had nested lists, only the first one would be returned
            d.children.forEach(element => {
                this.#addToPage(element, innerUL);  // It recursively adds the children to nested lists
            });
        } else {
            list.append(li);
        }
    }

    #clickFeedback() {
        let toggler = document.getElementsByClassName('expandable');
        // Expand the first children
        toggler[0].classList.toggle('down');
        toggler[0].parentElement.querySelector('.nested').classList.toggle('active');
        // Event listeners
        for (let i = 0; i < toggler.length; i++) {
            toggler[i].addEventListener('click', ()=> {
                toggler[i].classList.toggle('down');
                toggler[i].parentElement.querySelector('.nested').classList.toggle('active');
            });
        }
    }
}