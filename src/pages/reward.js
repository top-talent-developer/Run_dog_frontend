import React, { useState, useEffect, useCallback } from "react";
import Header from "../components/header";
import { useBlockchainContext } from "../context";
import { useWallet } from "use-wallet";
import { NotificationManager } from "react-notifications";
import { Grid, Paper, Container } from "@mui/material";
import { ListView, ListViewHeader } from "@progress/kendo-react-listview";
import { Pager } from "@progress/kendo-react-data-tools";
import "@progress/kendo-theme-default/dist/all.css";

function Home() {
  // datas
  const wallet = useWallet();
  const [state] = useBlockchainContext();
  const [currenttime, setTime] = useState("");
  setInterval(() => {
    var today = new Date();
    var time =today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate()+' '+today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
    setTime(time)
  }, 1000);
  const [page, setPage] = React.useState({
    skip: 0,
    take: 5,
  });
  const [page1, setPage1] = React.useState({
    skip1: 0,
    take1: 5,
  });
  const { skip, take } = page;
  const { skip1, take1 } = page1;


  const handlePageChange = (e) => {
    setPage({
      skip: e.skip,
      take: e.take,
    });
  };
  const handlePageChange1 = (e) => {
    
    setPage1({
      skip1: e.skip,
      take1: e.take,
    });
  };
  return (
    <div style={{ minHeight: "93vh" }}>
      <Header />
      <Container>
        <div
          className="RoundInfoCard"
          style={{
            marginTop: "40px",
          }}
        >
          <ListView
            data={state.players.slice(skip1, skip1 + take1)}
            item={CardItem1}
            style={{
              width: "100%",
              padding: "10px",
              background: "rgba(0 ,0, 0,0.2)",
              color: "white",
              fontSize: "20px",
            }}
            header={CardHeader1}
          />  
          <Pager
            skip={skip1}
            take={take1}
            onPageChange={handlePageChange1}
            total={state.players.length}
            style={{
              width: "100%",
              padding: "10px",
              background: "rgba(0 ,0, 0,0.2)",
              color: "white",
              fontSize: "20px",
            }}
          />
          <hr />
          <div style={{color:"white" ,fontSize:"18px",marginTop:"5px", textAlign:"center", width:"100%"}}>{currenttime}</div>
          <hr />

          <ListView
            data={state.histories.slice(skip, skip + take)}
            item={CardItem}
            style={{
              width: "100%",
              padding: "10px",
              background: "rgba(0 ,0, 0,0.2)",
              color: "white",
              fontSize: "20px",
            }}
            header={CardHeader}
          />
          <Pager
            skip={skip}
            take={take}
            onPageChange={handlePageChange}
            total={state.histories.length}
            style={{
              width: "100%",
              padding: "10px",
              background: "rgba(0 ,0, 0,0.2)",
              color: "white",
              fontSize: "20px",
            }}
          />
        </div>
      </Container>
    </div>
  );
}

export default Home;

const CardHeader = () => {
  return (
    <ListViewHeader className="pl-4 pb-2 pt-2">
      <Grid container className="text-center">
        <Grid item xs={6} sm={6} md={3} className="x-font3-red">
          <span style={{ fontSize: "28px" }}> Data</span>
        </Grid>
        <Grid item xs={6} sm={6} md={3} className="x-font3-red">
          <span style={{ fontSize: "28px" }}> Player</span>
        </Grid>
        <Grid item xs={6} sm={6} md={3} className="x-font3-yellow">
          <span style={{ fontSize: "28px" }}> amount</span>
        </Grid>
        <Grid item xs={6} sm={6} md={3} className="x-font3-yellow">
          <span style={{ fontSize: "28px" }}> Tx</span>
        </Grid>
      </Grid>
      <div className="space-line"></div>
    </ListViewHeader>
  );
};

const CardItem = (props) => {
  let item = props.dataItem;

  try {
    var date = new Date(item.data);
    return (
      <Grid container className="text-center" style={{ padding: "10px" }}>
        <Grid item xs={6} sm={6} md={3} className="x-font4-white">
          {date.toDateString()}
        </Grid>
        <Grid item xs={6} sm={6} md={3} className="x-font4-white">
          {item.user}
        </Grid>
        <Grid item xs={6} sm={6} md={3} className="x-font4-white">
          {item.amount / 10 ** 18}
        </Grid>
        <Grid item xs={6} sm={6} md={3} className="x-font4-white">
          {item.txhash.slice(0, 5) + "..." + item.txhash.slice(-5)}
        </Grid>
      </Grid>
    );
  } catch (err) {
    return <div></div>;
  }
};
const CardHeader1 = () => {
  return (
    <ListViewHeader className="pl-4 pb-2 pt-2">
      <Grid container className="text-center">
        <Grid item xs={6} sm={6} md={3} className="x-font3-red">
          <span style={{ fontSize: "28px" }}> Rate</span>
        </Grid>
        <Grid item xs={6} sm={6} md={3} className="x-font3-red">
          <span style={{ fontSize: "28px" }}> Name</span>
        </Grid>
        <Grid item xs={6} sm={6} md={3} className="x-font3-red">
          <span style={{ fontSize: "28px" }}> Coin</span>
        </Grid>
        <Grid item xs={6} sm={6} md={3} className="x-font3-yellow">
          <span style={{ fontSize: "28px" }}> Address</span>
        </Grid>
      </Grid>
      <div className="space-line"></div>
    </ListViewHeader>
  );
};

const CardItem1 = (props) => {
  let item = props.dataItem;
  try {
    return (
      <Grid container className="text-center" style={{ padding: "10px" }}>
        <Grid item xs={6} sm={6} md={3} className="x-font4-white">
          {item.rate}
        </Grid>
        <Grid item xs={6} sm={6} md={3} className="x-font4-white">
          {item.nickname}
        </Grid>
        <Grid item xs={6} sm={6} md={3} className="x-font4-white">
          {item.coin}
        </Grid>
        <Grid item xs={6} sm={6} md={3} className="x-font4-white">
          {item.address.slice(0, 5) + "..." + item.address.slice(-5)}
        </Grid>
      </Grid>
    );
  } catch (err) {
    return <div></div>;
  }
};
