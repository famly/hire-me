import { useEffect, useState } from "react";
import { calculateDataBookends } from "../utils/utils";
import axios from "axios";

import config from "../config";

const apiUrl = `${config.groupDataUrl}?accessToken=${config.accessToken}&groupId=${config.groupId}&institutionId=${config.institutionId}`;

const useLocalCachedData = () => {
  const [fullData, setFullData] = useState([]);
  const [childData, setChildData] = useState([]);
  const pageSize = 8;
  const [pageNumber, setPageNumber] = useState(1);
  const [sliceStart, setSliceStart] = useState(0);
  const [sliceEnd, setSliceEnd] = useState(pageSize);
  const [refetch, setRefetch] = useState(1);

  const handleNext = () => {
    const [sliceStart, sliceEnd] = calculateDataBookends(
      pageSize,
      pageNumber,
      "next"
    );
    setChildData(fullData.slice(sliceStart, sliceEnd));
    setSliceStart(sliceStart);
    setSliceEnd(sliceEnd);
    setPageNumber(pageNumber + 1);
  };

  const handlePrev = () => {
    if (pageNumber === 1) return;
    const [sliceStart, sliceEnd] = calculateDataBookends(
      pageSize,
      pageNumber,
      "previous"
    );
    setChildData(fullData.slice(sliceStart, sliceEnd));
    setSliceStart(sliceStart);
    setSliceEnd(sliceEnd);
    setPageNumber(pageNumber - 1);
  };

  const handleCheckinUpdates = (data) => {
    const { checkinTime, childId } = data;

    setRefetch(refetch + 1);
  };

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await axios(apiUrl);

      setFullData(data.children);
      setChildData(data.children.slice(0, 8));
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await axios(apiUrl);

      setFullData(data.children);
      setChildData(data.children.slice(sliceStart, sliceEnd));
    };
    fetchData();
  }, [refetch]);

  return [pageNumber, handlePrev, handleNext, childData, handleCheckinUpdates];
};

export default useLocalCachedData;
