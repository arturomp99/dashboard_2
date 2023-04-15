import styled from "styled-components";
import './../css/Dashboard.css'
import Dendrogram from "./../components/dendrogram";
import DendrogramMenu from './../components/dendrogramMenu';
import Timeline from './../components/timeline';
import { useState, useEffect } from 'react';
import fileName from "./../data/FloraFauna.json";
import timeFile from "./../data/self-generated.json";
import Resizable from "react-resizable-layout";

const Layout = ({
    children
}) => {
    const [menu, dendrogram, right] = children;
    return (
        <Container>
            <Pane1>{menu}</Pane1>
            <Pane2>{dendrogram}</Pane2>
            <Pane3>{right}</Pane3>
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
        <Dendrogram data={taxData}/>
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
`

const Pane3 = styled.div`
    grid-column: 1 / span 2;
    align-self: stretch;
`;