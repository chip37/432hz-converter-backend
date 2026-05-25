const express = require("express");
const cors = require("cors");
const multer = require("multer");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");

ffmpeg.setFfmpegPath(ffmpegPath);

const app = express();

const upload = multer({
  dest: "uploads/",
});

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.send("432Hz Converter Backend Running");
});

app.post("/convert", upload.single("audio"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No audio file uploaded",
    });
  }

  const inputPath = req.file.path;

  const outputPath = `uploads/converted-${Date.now()}.mp3`;

  ffmpeg(inputPath)
    .audioFilters("asetrate=44100*432/440,aresample=44100")
    .save(outputPath)

    .on("end", () => {
      res.json({
        success: true,
        message: "Audio converted to 432Hz",
        downloadUrl: `http://localhost:8080/${outputPath}`,
      });
    })

    .on("error", (err) => {
      console.error(err);

      res.status(500).json({
        success: false,
        message: "Conversion failed",
        error: err.message,
      });
    });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});