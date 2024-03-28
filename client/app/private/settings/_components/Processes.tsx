"use client";

import axios from "axios";
import { useEffect } from "react";

export default function Processes() {
  useEffect(() => {
    axios.get("/api/processes").then((response) => {
      console.log(response.data);
    });
  }, []);
  return (
    <div>
      <h1>Processes</h1>
    </div>
  );
}
