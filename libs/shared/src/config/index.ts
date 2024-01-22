export default {
   app: {
      environment: process.env['ENVIRONMENT'],
   },
   inf: {
      stage: process.env['STAGE'],
      identifierTag: process.env['IDENTIFIER_TAG'],
      hostedZoneId: process.env['HOSTED_ZONE_ID'],
      hostedZoneDomain: process.env['HOSTED_ZONE_DOMAIN'],
      certificateArn: process.env['CERTIFICATE_ARN'],
   },

   aws: {
      account: process.env['AWS_ACCOUNT_ID'],
      region: process.env['AWS_DEFAULT_REGION'],
   },

   tokens: {
      doppler: process.env['DOPPLER_TOKEN'],
   },
};
