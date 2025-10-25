import { Router } from "express";
import fetch from "node-fetch";

const router = Router();

router.get("/geo/resolve-postcode", async (req, res) => {
  const { postcode } = req.query;
  if (!postcode || typeof postcode !== "string") {
    return res.status(400).json({ message: "postcode query required" });
  }

  try {
    const response = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(postcode)}`);
    if (!response.ok) {
      return res.status(404).json({ message: "Postcode not found" });
    }
    const data = await response.json();
    res.json({ result: data.result });
  } catch (error) {
    console.error("Postcode lookup failed", error);
    res.status(500).json({ message: "Lookup failed" });
  }
});

export default router;
