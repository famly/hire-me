import React from "react";

import "./App.css";
import axios from "axios";

import useLocalCachedData from "./hooks/useLocalCachedData";

import Pagination from "./components/Pagination/Pagination";
import ChildSummary from "./components/ChildDashboard/ChildDashboard";

const App = () => {
  const [pageNumber, handlePrev, handleNext, childData, handleCheckinUpdates] =
    useLocalCachedData();

  const fetchData = async (apiUrl, postData) =>
    await axios.post(apiUrl, postData).then((response) => {
      return response.data;
    });

  const checkOperation = (id, isCheckedIn) => {
    const accessToken = "234ffdb8-0889-4be3-b096-97ab1679752c";
    const apiUrl = `https://tryfamly.co/api/v2/children/${id}/${
      isCheckedIn ? "checkout" : "checkins"
    }`;
    const postData = {
      accessToken: accessToken,
    };

    fetchData(apiUrl, postData).then((result) => {
      handleCheckinUpdates(result);
      return result;
    });
  };

  return (
    <div className='App'>
      {childData.map((child) => (
        <ChildSummary data={child} checkOperation={checkOperation} />
      ))}

      <Pagination
        pageNumber={pageNumber}
        handlePrev={handlePrev}
        handleNext={handleNext}
      />
    </div>
  );
};

export default App;
