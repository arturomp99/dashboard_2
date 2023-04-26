import styled from "styled-components";
import './../css/Dashboard.css'
import Dendrogram from "./../components/dendrogram";
import DendrogramMenu from './../components/dendrogramMenu';
import Timeline from './../components/timeline';
import HeatTree from "../components/heatTree";
import { useState, useEffect, useRef } from 'react';
import fileName from "./../data/FloraFauna.json";
import timeFile from "./../data/self-generated.json";
import heattree from "./../data/heat_tree/HeatTree1.svg";
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// TODO: We could animate the fullscreen.
// TODO: add radiobutton and conditional rendering to toggle between heattree and dendrogram: https://react.dev/learn/conditional-rendering
// TODO: Make the charts responsive

const Layout = ({
    children
}) => {
    const [menu, dendrogram, right] = children;
    return (
        <Container>
            <Pane1 className='menuPane'>
                {menu}
            </Pane1>
            <Pane2 className='dendrogramPane'>
                 {dendrogram}
            </Pane2>
            <Pane3 className='timelinePane'>
                {right}
            </Pane3>
        </Container>
    )
}

export const Dashboard = () => {
    const fullscreenOnClick = () => {        // TODO: COULD THIS BE DONE MORE EFFICIENTLY??
        document.getElementsByClassName("menuPane")[0].classList.toggle('collapse');
        document.getElementsByClassName("timelinePane")[0].classList.toggle('collapse');
        document.getElementsByClassName("dendrogramPane")[0].classList.toggle('expand');
    };
    
    const viewSwitch = (e) => {
        if(selectedTree !== e.target.id) setSelectedTree(e.target.id);
    }

    // Use a state for the taxonomic data
    const [taxData, setData] = useState([]);
    const [timeData, setTimeData] = useState([]);
    const [heatTreeSVG, setHeatTreeSVG] = useState();
    const [selectedTree, setSelectedTree] = useState("dendrogram");

    

    // Data is loaded inside a react hook so that it is only loaded when needed
    useEffect(()=>{ 
        setData(fileName);
    }, [taxData]); // Will only execute when taxData is changed
    useEffect(()=> {  
        setTimeData(timeFile);
    }, [timeData]) // Will only execute when timeData is changed
    useEffect(()=>{
        d3.xml(heattree).then((d)=>setHeatTreeSVG(d));
    }, []);

    return <Layout>
        <DendrogramMenu data={taxData}/>
        <div>
            <div className="radio-group">
                <input type='radio' id='dendrogram' value='dendrogram' name='viewSwitch' defaultChecked onClick={viewSwitch}></input>
                <label htmlFor='dendrogram'>Dendrogram</label>
                <input type='radio' id='heat-tree' value='heat tree' name='viewSwitch' onClick={viewSwitch}></input>
                <label htmlFor='heat-tree'>Heat tree</label>
            </div>
            {selectedTree === "dendrogram" ?    
                <Dendrogram data={taxData}>
                    <button className="fullscreenBtn" onClick={fullscreenOnClick}>Full Screen</button>
                </Dendrogram> :
                <HeatTree data={heatTreeSVG}></HeatTree>
            }
        </div>
        <Timeline data={timeData}/>
    </Layout>
}

const Container = styled.div`
    height: 100%;
    display: grid;
    grid-template-columns: 20% auto;
    grid-template-rows: 1fr 1fr
`;

const Pane1 = styled.div`
    grid-column: 1;
    align-self: stretch;
`;

const Pane2 = styled.div`
    grid-column: 2;
    align-self: stretch;
    position: relative;
`

const Pane3 = styled.div`
    grid-column: 1 / span 2;
    align-self: stretch;
`;