const expressJwt = require('express-jwt');
var nconf = require("nconf");

module.exports = jwtRoute;
        
function jwtRoute() {
    
    if (process.env.NODE_ENV == 'test' )
            {
                  const { secret } = { "secret" : 'MySecretIsNotHere' };

                  return expressJwt({ secret, algorithms: ['HS256'] }).unless({
                    path: [
                        // Route public qui ne nécessite pas d'authentification
                        '/signin',
                        '/signup',
                        '/forgotpassword',
                        '/doc',
                        '/'
                    ]
                });

            }
      else
            {
                const { secret } = { secret : nconf.get('secret') };

                return expressJwt({ secret, algorithms: ['HS256'] }).unless({
                    path: [
                        // Route public qui ne nécessite pas d'authentification
                        '/signin',
                        '/signup',
                        '/forgotpassword',
                        '/doc',
                        '/'
                    ]
                });

            } 




    
}