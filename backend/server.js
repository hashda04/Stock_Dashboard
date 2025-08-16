// Load environment variables
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { SMA, RSI, MACD } = require("technicalindicators");
const yf = require("yahoo-finance2").default;

const app = express();
app.use(cors({
  origin: [
    "https://stock-dashboard-1-lk6g.onrender.com", // your frontend Render URL
    "http://localhost:5173" // (optional) local dev
  ]
}));

app.use(express.json());

// Mongoose schemas
const historicalSchema = new mongoose.Schema({
  date: String,
  open: Number,
  high: Number,
  low: Number,
  close: Number,
  volume: Number
});

const companySchema = new mongoose.Schema({
  name: String,
  symbol: String,
  historical: [historicalSchema],
  lastUpdated: Date,
});

const Company = mongoose.model("Company", companySchema);

// Companies to track
const companiesList = [

  { name: "Microsoft", symbol: "MSFT" },
  { name: "Amazon", symbol: "AMZN" },
  { name: "Google", symbol: "GOOGL" },
  { name: "Facebook / Meta", symbol: "META" },
  { name: "Netflix", symbol: "NFLX" },
  { name: "Nvidia", symbol: "NVDA" },
  { name: "Intel", symbol: "INTC" },
  { name: "Adobe", symbol: "ADBE" },
  { name: "PayPal", symbol: "PYPL" },
  { name: "Salesforce", symbol: "CRM" },
  { name: "Uber", symbol: "UBER" },
  { name: "Lyft", symbol: "LYFT" },
  { name: "Shopify", symbol: "SHOP" },
  { name: "Square / Block", symbol: "SQ" },
  { name: "Spotify", symbol: "SPOT" },
  { name: "Twitter / X", symbol: "TWTR" },
  { name: "Zoom Video", symbol: "ZM" },
  { name: "Pinterest", symbol: "PINS" },
  { name: "Oracle", symbol: "ORCL" },
  { name: "IBM", symbol: "IBM" },
  { name: "Cisco", symbol: "CSCO" },
  { name: "Qualcomm", symbol: "QCOM" },
  { name: "AMD", symbol: "AMD" },
  { name: "American Express", symbol: "AXP" },
  { name: "Visa", symbol: "V" },
  { name: "Mastercard", symbol: "MA" },
  { name: "Bank of America", symbol: "BAC" },
];

// Seed companies: insert missing ones
async function seedCompanies() {
  try {
    for (const c of companiesList) {
      await Company.updateOne(
        { symbol: c.symbol },
        { $setOnInsert: { name: c.name, symbol: c.symbol, historical: [], lastUpdated: null } },
        { upsert: true }
      );
    }
    console.log(" ✅ Companies seeded or updated");
  } catch (err) {
    console.error(" Seed error:", err.message);
  }
}

// Fetch historical data
async function fetchHistorical(symbol) {
  try {
    const result = await yf.historical(symbol, { period1: "2020-01-01", interval: "1d" });
    if (!result || result.length === 0) return [];
    return result.map(d => ({
      date: d.date.toISOString().split("T")[0],
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
      volume: d.volume
    }));
  } catch (err) {
    console.error(` Failed to fetch ${symbol}:`, err.message);
    return [];
  }
}

// Routes
app.get("/", (req, res) => res.send("Backend API is up and running!"));

app.get("/companies", async (req, res) => {
  try {
    const companies = await Company.find({}, "name symbol");
    res.json(companies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/stocks/:symbol", async (req, res) => {
  try {
    const { symbol } = req.params;
    let company = await Company.findOne({ symbol });

    if (!company) {
      // Look up real name from companiesList
      const companyInfo = companiesList.find(c => c.symbol === symbol);
      const historical = await fetchHistorical(symbol);
      if (historical.length === 0) return res.status(404).json({ error: "No data found" });
      company = new Company({
        name: companyInfo ? companyInfo.name : symbol, // Use real name if available
        symbol,
        historical,
        lastUpdated: new Date()
      });
      await company.save();
    } else {
      const now = new Date();
      const diffHours = (now - company.lastUpdated) / (1000 * 60 * 60);
      if (diffHours > 24) {
        const historical = await fetchHistorical(symbol);
        if (historical.length > 0) {
          company.historical = historical;
          company.lastUpdated = now;
          await company.save();
        }
      }
    }

    const historical = [...company.historical].reverse();
    const lastYearData = historical.slice(-252).filter(d => d.high && d.low && d.volume);

    const high52 = Math.max(...lastYearData.map(d => d.high));
    const low52 = Math.min(...lastYearData.map(d => d.low));
    const avgVolume = Math.round(
      lastYearData.reduce((sum, d) => sum + d.volume, 0) / lastYearData.length
    );

    const closes = historical.map(d => d.close);
    const sma50 = SMA.calculate({ period: 50, values: closes });
    const sma200 = SMA.calculate({ period: 200, values: closes });
    const rsi14 = RSI.calculate({ period: 14, values: closes });
    const macd = MACD.calculate({
      values: closes, fastPeriod: 12, slowPeriod: 26, signalPeriod: 9,
      SimpleMAOscillator: false, SimpleMASignal: false
    });

    res.json({
      company: company.name,
      symbol: company.symbol,
      historical,
      stats: { high52, low52, avgVolume },
      indicators: { sma50, sma200, rsi14, macd }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// MongoDB connection and server start
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(async () => {
    console.log(" MongoDB connected");
    await seedCompanies(); // Seed companies after DB connection
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, "0.0.0.0", () => console.log(` Server running on port ${PORT}`));
  })
  .catch(err => console.error(" MongoDB connection error:", err));
