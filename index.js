const express = require("express")
const ytdl = require("ytdl-core")
const pathToFfmpeg = require("ffmpeg-static")
const ffmpeg = require("fluent-ffmpeg")
const cors = require("cors")
const sanitize = require("sanitize-filename")
const mime = require("mime-types")
const path = require("path")

const app = express()

app.use(cors())

app.get("/:videoId", async (req, res) => {
  try {
    const info = await ytdl.getBasicInfo(`https://www.youtube.com/watch?v=${req.params.videoId}`)

    res.send({
      audioAndVideo: info.player_response.streamingData.formats,
      audio: info.player_response.streamingData.adaptiveFormats.filter(af => af.mimeType.startsWith("audio/")),
      video: info.player_response.streamingData.adaptiveFormats.filter(af => af.mimeType.startsWith("video/")),
    })
  }
  catch (err) {
    res.send(err.message)
  }
})

app.get("/:videoId/:itag/mp3", (req, res) => {
  try {
    const ytStream = ytdl(`https://www.youtube.com/watch?v=${req.params.videoId}`, { quality: req.params.itag })
      .on("info", e => {
        const title = sanitize(e.player_response.videoDetails.title)

        res.writeHead(200, {
          "Content-Type": "audio/mpeg",
          "Content-Disposition": `attachment; filename=${title}.mp3`
        })

        ffmpeg()
          .setFfmpegPath(pathToFfmpeg)
          .input(ytStream)
          .audioCodec("libmp3lame")
          .output(res)
          .outputFormat("mp3")
          // This is needed to fix the 'Error: Output stream closed' error which crashes the server.
          .on("error", err => {
            console.log(err)
          })
          .run()
      })
  }
  catch (err) {
    res.send(err.message)
  }
})

app.get("/download/:videoId/:itag", (req, res) => {
  try {
    const ytStream = ytdl(`https://www.youtube.com/watch?v=${req.params.videoId}`, { quality: req.params.itag })

    ytStream.on("info", e => {
      const title = sanitize(e.player_response.videoDetails.title)
      const format = e.player_response.streamingData.formats.concat(...e.player_response.streamingData.adaptiveFormats).find(f => f.itag === parseInt(req.params.itag))

      const headers = {
        "Content-Disposition": `attachment; filename=${title}`
      }

      if (format) {
        if (format.mimeType) {
          const extension = mime.extension(format.mimeType)
          const contentType = mime.contentType(format.mimeType)

          if (contentType) {
            headers["Content-Type"] = contentType
          }

          if (extension) {
            headers["Content-Disposition"] += `.${extension}`
          }
        }

        if (format.contentLength) {
          headers["Content-Length"] = format.contentLength
        }
      }

      res.writeHead(200, headers)
    })

    ytStream.pipe(res)
  }
  catch (err) {
    res.send(err.message)
  }
})

app.use(express.static(path.join(__dirname, "client/build")))

app.get("*", function (req, res) {
  res.sendFile(path.join(__dirname, "client/build", "index.html"))
})

const port = process.env.PORT || 4000

app.listen(port, () => console.log(`Listening at http://localhost:${port}`))