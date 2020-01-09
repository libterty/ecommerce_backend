module.exports = {
  apps : [{
    name: 'API',
    script: 'index.js',
    instances: 2,
    autorestart: true,
    watch: true,
    max_memory_restart: '1G',
    node_args: ["--optimize_for_size", "--max_old_space_size=256"],
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }]
};
