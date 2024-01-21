export default {
   inf: {
      stage: process.env['STAGE'],
      identifierTag: process.env['IDENTIFIER_TAG'],
      hostedZoneId: process.env['HOSTED_ZONE_ID'],
      hostedZoneDomain: process.env['HOSTED_ZONE_DOMAIN'],
      certificateArn: process.env['CERTIFICATE_ARN'],
   },
};
