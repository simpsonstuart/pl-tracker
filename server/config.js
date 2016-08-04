module.exports = {
  // App Settings
  MONGO_URI: process.env.MONGO_URI || 'localhost',
  TOKEN_SECRET: process.env.TOKEN_SECRET || 'g,kj89jh43fguiiu4kJGHIUI4jkhl,5253k',

  // OAuth 2.0
  GOOGLE_SECRET: process.env.GOOGLE_SECRET || 'tmGyOyoIqpXVJousFSqMzkKP',
  GITHUB_SECRET: process.env.GITHUB_SECRET || '50e5607fa152ea11d5e99a292b415e36499bae50',
  BITBUCKET_SECRET: process.env.BITBUCKET_SECRET || 'Gp3zyT2KTGYc4Q2PdvnZsM2nyE7Yp8sA'
};
