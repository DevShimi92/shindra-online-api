const expressJwt = require('express-jwt');
var nconf = require("nconf");

module.exports = jwtRoute;

function jwtRoute() {
    console.log(process.env.NODE_ENV+"*");
    if (process.env.NODE_ENV == 'test ' )
            {
                console.log('B');
                  const { secret } = { "secret" : 'MySecretIsNotHere' };
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
                console.log('C');
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