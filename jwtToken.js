const expressJwt = require('express-jwt');
var nconf = require("nconf");

module.exports = jwtRoute;

function jwtRoute() {
    if (process.env.NODE_ENV == 'test ' )
            {
                  nconftest1.use('config-test');
                  const { secret } = { secret : nconftest1.get('secret') };
                  return expressJwt({ secret, algorithms: ['HS256'] }).unless({
                    path: [
                        // public routes that don't require authentication
                        '/signin',
                        '/signup',
                        '/forgotpassword',
                        '/'
                    ]
                });

            }
      else
            {
                const { secret } = { secret : nconf.get('secret') };
                return expressJwt({ secret, algorithms: ['HS256'] }).unless({
                    path: [
                        // public routes that don't require authentication
                        '/signin',
                        '/signup',
                        '/forgotpassword',
                        '/'
                    ]
                });
            } 




    
}