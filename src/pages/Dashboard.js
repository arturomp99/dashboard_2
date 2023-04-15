import styled from "styled-components";
import './../css/Dashboard.css'
import Dendrogram from "./../components/dendrogram";
import DendrogramMenu from './../components/dendrogramMenu';
import Timeline from './../components/timeline';
import { useState, useEffect } from 'react';
import fileName from "./../data/FloraFauna.json";
import timeFile from "./../data/self-generated.json";

// TODO: We could animate the fullscreen.

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
    // Use a state for the taxonomic data
  const [taxData, setData] = useState([]);
  const [timeData, setTimeData] = useState([]);
  // Data is loaded inside a react hook so that it is only loaded when needed
  useEffect(()=>{
    setData(fileName);
  }, []);
  useEffect(()=> {
    setTimeData(timeFile);
  }, [])

    return <Layout>
        <DendrogramMenu data={taxData}/>
        <Dendrogram data={taxData}>
            <button className="fullscreenBtn" onClick={fullscreenOnClick}>Full Screen</button>
        </Dendrogram>
        <Timeline data={timeData}/>
    </Layout>
}

const fullscreenOnClick = () => {        // TODO: COULD THIS BE DONE MORE EFFICIENTLY??
    document.getElementsByClassName("menuPane")[0].classList.toggle('collapse');
    document.getElementsByClassName("timelinePane")[0].classList.toggle('collapse');
    document.getElementsByClassName("dendrogramPane")[0].classList.toggle('expand');
};

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