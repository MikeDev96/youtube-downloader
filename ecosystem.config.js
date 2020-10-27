module.exports = {
  apps: [
    {
      name: "ytd-server",
      script: "./server.js",
      out_file: "./logs/out.log",
      error_file: "./logs/err.log",
      time: true,
    },
  ],
}