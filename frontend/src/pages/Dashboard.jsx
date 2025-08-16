import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import "../index.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [rsiData, setRsiData] = useState(null);
  const [macdData, setMacdData] = useState(null);
  const [stockStats, setStockStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;

  // Fetch companies list
  useEffect(() => {
    axios
      .get(`${API_URL}/companies`)
      .then((res) => setCompanies(res.data))
      .catch((err) => console.error("Error fetching companies:", err));
  }, [API_URL]);

  // Fetch stock data for selected company
  useEffect(() => {
    if (!selectedCompany) return;

    const fetchStockData = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await axios.get(
          `${API_URL}/stocks/${selectedCompany.symbol}`
        );
        const { historical, stats, indicators } = res.data;

        if (!historical || historical.length === 0) {
          setError("No historical data available.");
          setChartData(null);
          setRsiData(null);
          setMacdData(null);
          setLoading(false);
          return;
        }

        const labels = historical.map((d) => d.date);
        const closes = historical.map((d) => d.close);

        const padArray = (arr, targetLen) =>
          arr.length < targetLen
            ? [...Array(targetLen - arr.length).fill(null), ...arr]
            : arr;

        // Price + SMA chart
        setChartData({
          labels,
          datasets: [
            {
              label: `${selectedCompany.name} Price`,
              data: closes,
              borderColor: "#151213ff",
              backgroundColor: "#f4f41cff",
              fill: false
            },
            {
              label: "SMA 50",
              data: padArray(indicators.sma50, closes.length),
              borderColor: "#f95c5cff",
              fill: false
            },
            {
              label: "SMA 200",
              data: padArray(indicators.sma200, closes.length),
              borderColor: "#f3f2f0ff",
              fill: false
            }
          ]
        });

        // RSI chart
        setRsiData({
          labels,
          datasets: [
            {
              label: "RSI 14",
              data: padArray(indicators.rsi14, closes.length),
              borderColor: "#574649",
              fill: false
            }
          ]
        });

        // MACD chart
        setMacdData({
          labels,
          datasets: [
            {
              label: "MACD",
              data: indicators.macd.map((m) => m.MACD),
              borderColor: "#ED24E0",
              fill: false
            },
            {
              label: "Signal",
              data: indicators.macd.map((m) => m.signal),
              borderColor: "#F9DC5C",
              fill: false
            },
            {
              label: "Histogram",
              data: indicators.macd.map((m) => m.histogram),
              borderColor: "#011936",
              fill: false
            }
          ]
        });

        setStockStats(stats);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch stock data.");
      } finally {
        setLoading(false);
      }
    };

    fetchStockData();
  }, [selectedCompany, API_URL]);

  return (
    <div
      className="app-container"
      style={{ display: "flex", flexDirection: "column", height: "100vh" }}
    >
      {/* Header */}
      <div
        className="header"
        style={{
          backgroundColor: "#465362",
          color: "white",
          textAlign: "center"
        }}
      >
        STOCK DASHBOARD
      </div>

      {/* Main Dashboard */}
      <div
        className="main"
        style={{ display: "flex", flex: 1, overflow: "hidden" }}
      >
        {/* Left Panel */}
        <div
          className="dashboard-left"
          style={{
            width: "250px",
            overflowY: "auto",
            backgroundColor: "#f3f2f0ff"
          }}
        >
          <ul>
            {companies.map((c) => (
              <li
                key={c.symbol}
                className={
                  selectedCompany?.symbol === c.symbol ? "selected" : ""
                }
                onClick={() => setSelectedCompany(c)}
                style={{
                  padding: "8px",
                  cursor: "pointer",
                  marginBottom: "5px",
                  borderRadius: "5px",
                  backgroundColor:
                    selectedCompany?.symbol === c.symbol
                      ? "#011936"
                      : "transparent",
                  color:
                    selectedCompany?.symbol === c.symbol
                      ? "white"
                      : "#465362"
                }}
              >
                {c.name}
              </li>
            ))}
          </ul>
        </div>

        {/* Right Panel */}
        <div
          className="dashboard-right"
          style={{ flex: 1, padding: "20px", overflowY: "auto" }}
        >
          {loading && <p>Loading...</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}

          {stockStats && !loading && (
            <div
              className="stats-panel"
              style={{ marginBottom: "20px", color: "#465362" }}
            >
              <p>
                <strong>52-Week High:</strong> ${stockStats.high52}
              </p>
              <p>
                <strong>52-Week Low:</strong> ${stockStats.low52}
              </p>
              <p>
                <strong>Average Volume:</strong>{" "}
                {stockStats.avgVolume.toLocaleString()}
              </p>
            </div>
          )}

          {chartData && (
            <>
              <div
                className="chart-container"
                style={{ height: "300px", marginBottom: "20px" }}
              >
                <Line
                  data={chartData}
                  options={{ responsive: true, maintainAspectRatio: false }}
                />
              </div>

              <div
                className="chart-container"
                style={{ height: "200px", marginBottom: "20px" }}
              >
                <Line
                  data={rsiData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: { y: { min: 0, max: 100 } }
                  }}
                />
              </div>

              <div className="chart-container" style={{ height: "200px" }}>
                <Line
                  data={macdData}
                  options={{ responsive: true, maintainAspectRatio: false }}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div
        className="footer"
        style={{
          backgroundColor: "#465362",
          color: "white",
          textAlign: "center"
        }}
      >
        &copy; 2025 Stock Dashboard. All rights reserved.
      </div>
    </div>
  );
}
