module.exports = {
  apps: [
    {
      name: 'API',
      script: 'index.js',
      instances: 2,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      node_args: [
        '--optimize_for_size',
        '--max_old_space_size=128',
        '--gc_interval=100'
      ],
      env: {
        NODE_ENV: 'development'
      },
      env_production: {
        NODE_ENV: 'production'
      }
    }
  ]
};
