import axios from "axios";

export const analyzeURL = async (req, res) => {
  try {
    const { url } = req.body;

    const response = await axios.post(
      "http://localhost:4000/api/analyze", // 👈 SERVER B IP
      { url },
      {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.SECOND_SERVER_API_KEY,
        },
        timeout: 120000,
      },
    );

    res.json(response.data);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Analysis failed" });
  }
};
