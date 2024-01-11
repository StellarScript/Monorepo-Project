const configuration = {
   config: {
      stage: process.env['STAGE'],
      projectName: process.env['PROJECT_NAME'],
      frontendUrl: process.env['FRONTEND_URL'],
      backendUrl: process.env['BACKEND_URL'],
      serverPort: process.env['SERVER_PORT'],
      sessionSecret: process.env['SESSION_SECRET'],
      redisUri: process.env['REDIS_URI'],
   },

   auth0: {
      domain: process.env['AUTH0_DOMAIN'],
      clientId: process.env['AUTH0_CLIENT_ID'],
      clientSecret: process.env['AUTH0_CLIENT_SECRET'],
      audience: process.env['AUTH0_AUDIENCE'],
      apikey: process.env['AUTH0_API_KEY'],
      issuer: process.env['AUTH0_ISSUER_BASE_URL'],
   },

   inf: {
      stage: process.env['STAGE'],
      hostedZoneId: process.env['HOSTED_ZONE_ID'],
      hostedZoneDomain: process.env['HOSTED_ZONE_DOMAIN'],
      certificateArn: process.env['CERTIFICATE_ARN'],
      // TODO: Pass as env
      vpcName: 'DefaultVpc',
      albSecurityGroupName: 'AlbSecurityGroup',
   },

   database: {
      port: Number(process.env['DATABASE_PORT']),
      password: process.env['DATABASE_PASSWORD'],
      identifier: process.env['DATABASE_IDENTIFIER'],
   },

   aws: {
      account: process.env['AWS_ACCOUNT_ID'],
      region: process.env['AWS_DEFAULT_REGION'],
   },

   tokens: {
      dopperToken: process.env['DOPPLER_TOKEN'],
   },
};

export type Configuration = typeof configuration;
export default configuration as typeof configuration;
