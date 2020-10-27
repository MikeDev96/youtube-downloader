module.exports = {
  apps: [
    {
      name: "youtube-downloader",
      script: "./index.js",
      out_file: "./logs/out.log",
      error_file: "./logs/err.log",
      time: true,
    },
  ],
}