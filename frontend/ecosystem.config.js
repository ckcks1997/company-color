module.exports = {
  apps: [
    {
      name: 'nextjs-app',
      script: 'server.js',
      cwd: '/app',
      exec_mode: 'cluster',
      instances: 'max',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
