var express = require('express');
var app = express();
var bodyParser = require("body-parser"); 
var log4js = require('log4js');
var fs = require("fs");
var nconftest1 = require("nconf");
var nconf = require("nconf");

log4js.configure({
      appenders: {
        everything: { type: 'file', filename: 'logs/all-the-logs.log' },
        emergencies: { type: 'file', filename: 'logs/error.log' },
         console : {    type: "console" ,layout: {
            type: 'pattern',
            pattern: '%[[%d{dd-MM-yyyy hh:mm:ss.SSS}] [%p] %c -%] %m',
        }},
        'just-errors': { type: 'logLevelFilter', appender: 'emergencies', level: 'error' }
      },
      categories: {
        default: { appenders: ['just-errors', 'everything','console' ], level: 'debug' }
      }
    });
    var log = log4js.getLogger('API');

    var constructorSQL = require("./db.js");
    var conMysql ;


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Afin de faciliter le routage (les URL que nous souhaitons prendre en charge dans notre API), nous créons un objet Router.
//C'est à partir de cet objet myRouter, que nous allons implémenter les méthodes. 
var myRouter = express.Router(); 

switch (process.env.NODE_ENV) {
      case 'test ':
            var hostname = 'localhost'; 
            var port = '3000'; 
            
          break;
          default:
            nconf.file('config', './config.json');
            
            var hostname = nconf.get('address');
            var port = nconf.get('port');

          break;
  };



myRouter.route('/')
// all permet de prendre en charge toutes les méthodes. 
.all(function(req,res){ 
      log.info("Ping sur l'api");
      res.status(200).json({message : "Shindra-Online-API"});
      res.end();
});
 
myRouter.route('/signup') //Création d'un nouveau compte
//POST
.post(function(req,res){
      log.info("Ajout d'un compte...");
      if (req.body.lastname == null || req.body.firstname == null || req.body.username == null || req.body.password == null || req.body.email == null ) // Si il manque un champ, on renvoi bad request
      {
            res.status(400).json({error : 'Missing Resources'});
            res.end();
            log.error("Echec de création de compte : Champs manquant");      
      }
      else
      {
            constructorSQL.signUp(conMysql,req.body.lastname,req.body.firstname,req.body.email,req.body.username,req.body.password, function(value) {
                  if(value == 'ERROR_EMAIL_ALREADY_EXISTS' ) 
                        {
                              res.status(400).json({error : 'Account already exist'});
                              res.end();
                        }      
                  else if (value == 'ERROR_USERNAME_ALREADY_EXISTS' ) 
                        {
                              res.status(400).json({error : 'Account already exist'});
                              res.end();    
                        }
                  else if (value == 'ERROR' ) 
                        {
                              res.status(400).json({error : 'ERROR'});
                              res.end();    
                        }
                  else    
                        {
                              res.status(200).json({token : ''});
                              res.end();
                        }               

                });
      }
});


myRouter.route('/signin')
//POST
.post(function(req,res){
      log.info("Tentative d'identification...");

      if (req.body.username == null || req.body.password == null ) // Si il manque un champ, on renvoi bad request
      {
            res.status(400).json({error : 'Incomplete login'});
            res.end();
            log.error("Echec d'identification : Champs manquant");     
            log.error(req.body);
      }
      else
      {
            constructorSQL.signIn(conMysql,req.body.username,req.body.password, function(value) {
                  if(value == 'ERRORNOTFOUND' ) // Si le compte n'existe pas, on renvoi bad request
                        {
                              res.status(400).json({ error : "The account does not exist" });
                              res.end(); 
                        }      
                  else if (value == 'ERROR' ) // Si les identifiant ne sont pas correct , on renvoi bad request
                        {
                                    res.status(400).json({error : 'ERROR'});
                                    res.end();    
                        }
                  else     // Si les identifiant sont correct , on envoi le tokenn
                        {
                                    res.status(200).json({token : ''});
                                    res.end();
                        }               

            });
      }


      })


myRouter.route('/forgotpassword')
//PUT
.put(function(req,res){
      log.info("Demande de rest de mot de passe...");
      if (req.body.email == null ) // Si il manque un champ, on renvoi bad request
      {
            res.status(400).json({error : 'Missing Resources'});
            res.end();
            log.error("Echec de rest de mot de passse : Champs manquant");      }
      else
      {
            
            constructorSQL.forgotpassword(conMysql,req.body.email, function(value) {
                  if(value == 'ERRORNOTFOUND' ) // Si le compte n'existe pas, on renvoi bad request
                        {
                              res.status(400).json({ error : "The account does not exist" });
                              res.end(); 
                        }      
                  else if (value == 'ERROR' ) // Si les identifiant ne sont pas correct , on renvoi bad request
                        {
                                    res.status(400).json({error : 'Error'});
                                    res.end();    
                        }
                  else     // Si les identifiant sont correct , on envoi le tokenn
                        {
                                    res.status(200).json({token : ''});
                                    res.end();
                        }               

            });
      }

})
// Nous demandons à l'application d'utiliser notre routeur
app.use(myRouter);



const server =  app.listen(port, hostname, function(){
      log.info("Mon serveur fonctionne sur http://"+ hostname +":"+port); 
    
      if (process.env.NODE_ENV == 'test ' )
            {
                  nconftest1.use('config-test');
                 constructorSQL.createMysql(nconftest1.get('mysql:address'),nconftest1.get('mysql:username'),nconftest1.get('mysql:password'),nconftest1.get('mysql:database'), function(value) {
                        conMysql = value;
                      });

            }
      else
            {
                  constructorSQL.createMysql(nconf.get('mysql:address'),nconf.get('mysql:username'),nconf.get('mysql:password'),nconf.get('mysql:database'), function(value) {
                        conMysql = value;
                      })
            } 

      
});

module.exports = server;
