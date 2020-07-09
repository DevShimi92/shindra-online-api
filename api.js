var express = require('express');
var app = express();
var bodyParser = require("body-parser"); 
var log4js = require('log4js');
var nconftest1 = require("nconf");
var nconf = require("nconf");
const jwt = require('jsonwebtoken');
const jwtRoute = require('./jwtToken');
const errorHandler = require('./error-handler');

process.title = "SHINDRA_API";

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

//Selon l'environnement, on initialise les paramètres de configuration
switch (process.env.NODE_ENV) {
      case 'test':
            var hostname = 'localhost'; 
            var port = '3000'; 

          break;
          default:
            nconf.file('config', './config.json');
            var hostname = nconf.get('address');
            var port = nconf.get('port');

          break;
  };

/**
 * @api {all} / Ping d'api
 * @apiName All
 * @apiGroup Ping
 * 
 * @apiSuccess {String} message Message de retour du ping.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "message": "Shindra-Online-API"
 *     }
 */
myRouter.route('/')
// all permet de prendre en charge toutes les méthodes. 
.all(function(req,res){ 
      log.info("Ping sur l'api");
      res.status(200).json({message : "Shindra-Online-API"});
      res.end();
});

/**
 * @api {post} /signup Méthode d'inscription
 * @apiName PostSignup
 * @apiGroup Basic
 * 
 * @apiParam {String} lastname Nom.
 * @apiParam {String} firstname Prénom.
 * @apiParam {String} username Nom d'utilisateur.
 * @apiParam {String} password Mot de passe.
 * @apiParam {String} email Email.
 * 
 * @apiParamExample {json} Request-Example:
 *     {
 *       "lastname": 'lastname',
 *       "firstname": 'firstname',
 *       "username": 'username',
 *       "password": 'password',
 *       "email": 'email',
 *     }
 * 
 * @apiSuccess {String} token Token donnée aprés création de compte
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "token": "TokenHere"
 *     }
 * 
 * @apiError Missing_Resources Des champs sont vide ou manquant.
 *
 * @apiErrorExample Missing Resource
 *     HTTP/1.1 400 Not Found
 *     {
 *       "error": "Missing Resources"
 *     }
 * 
 * @apiError EMAIL_ALREADY_EXISTS Email d'utilisateur déja existant.
 * 
 * @apiErrorExample EMAIL_ALREADY_EXISTS
 *     HTTP/1.1 400 Not Found
 *     {
 *       "error": "Account already exist"
 *     }
 * 
 * @apiError USERNAME_ALREADY_EXISTS Nom d'utilisateur déja existant.
 * 
 * @apiErrorExample USERNAME ALREADY EXISTS
 *     HTTP/1.1 400 Not Found
 *     {
 *       "error": "Account already exist"
 *     }
 * 
 * @apiError ERROR Une erreur imprévue est survenue.
 *
 * @apiErrorExample ERROR
 *     HTTP/1.1 400 Not Found
 *     {
 *       "error": "ERROR"
 *     }
 */ 
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

/**
 * @api {post} /signin Méthode d'identification
 * @apiName PostSignin
 * @apiGroup Basic
 * 
 * @apiParam {String} username Nom d'utilisateur.
 * @apiParam {String} password Mot de passe.
 * 
 * @apiParamExample {json} Request-Example:
 *     {
 *       "username": 'username',
 *       "password": 'password'
 *     }
 * 
 * @apiSuccess {String} token Token donnée aprés identification de compte
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "token": "TokenHere"
 *     }
 * 
 * @apiError Incomplete_login Des champs sont vide ou manquant.
 *
 * @apiErrorExample Incomplete login
 *     HTTP/1.1 400 Not Found
 *     {
 *       "error": "Incomplete login"
 *     }
 * 
 * @apiError ERRORNOTFOUND Compte inexistant.
 * 
 * @apiErrorExample ERRORNOTFOUND
 *     HTTP/1.1 400 Not Found
 *     {
 *       "error": "The account does not exist"
 *     }
 * 
 * @apiError ERROR Identifiant incorrect
 *
 * @apiErrorExample ERROR
 *     HTTP/1.1 400 Not Found
 *     {
 *       "error": "ERROR"
 *     }
 */ 
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
                              
                              if (process.env.NODE_ENV == 'test' )
                                    { 
                                          const { secret } = { "secret" : 'MySecretIsNotHere' };
                                          const token = jwt.sign({ username: value }, secret , { expiresIn: '2h' });
                                          res.status(200).json({valeur : value ,token : token});
                                          res.end();
                              
                                    }
                              else
                                    {
                                          const { secret } = { secret : nconf.get('secret') };
                                          const token = jwt.sign({ username: value }, secret , { expiresIn: '2h' });
                                          res.status(200).json({token : token});
                                          res.end();
                                      }      
                                   
                        }               

            });
      }


      })

/**
 * @api {put} /forgotpassword Méthode de réinitialisation de mot de passe
 * @apiName PutForgotpassword
 * @apiGroup Basic
 * 
 * @apiParam {String} email Email du compte a réintialiser.
 * 
 * @apiParamExample {json} Request-Example:
 *     {
 *       "email": 'email'
 *     }
 * 
 * @apiSuccess {String} error Champs erreur vide renvoyé
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "error": ""
 *     }
 * 
 * @apiError Incomplete_login Des champs sont vide ou manquant.
 *
 * @apiErrorExample Incomplete login
 *     HTTP/1.1 400 Not Found
 *     {
 *       "error": "Incomplete login"
 *     }
 * 
 * @apiError ERRORNOTFOUND Compte inexistant.
 * 
 * @apiErrorExample ERRORNOTFOUND
 *     HTTP/1.1 400 Not Found
 *     {
 *       "error": "The account does not exist"
 *     }
 * 
 * @apiError ERROR Une erreur imprévue est survenue.
 *
 * @apiErrorExample ERROR
 *     HTTP/1.1 400 Not Found
 *     {
 *       "error": "ERROR"
 *     }
 */ 
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
                                    res.status(200).json({error : ''});
                                    res.end();
                        }               

            });
      }

})

/**
 * @api {get} /testtoken Méthode de réinitialisation de mot de passe
 * @apiName GetTesttoken
 * @apiGroup Basic
 * 
 * @apiSuccess {String} message Message pour dire que le token est OK
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "message": "TOKEN OK"
 *     }
 * 
 * @apiError Invalid_Token Token invalide ou manquant.
 *
 * @apiErrorExample Invalid Token
 *     HTTP/1.1 400 Not Found
 *     {
 *       "error": "Invalid Token"
 *     }
 */ 
myRouter.route('/testtoken')
//GET
.get(function(req,res){ 
      log.info("Test token...");
      res.status(200).json({message : "TOKEN OK"});
      res.end()
});

// Nous demandons à l'application de rendre static cette route vers le dossier doc (Pour la documentation de l'api)
app.use('/doc', express.static('./doc'));

// Nous demandons à l'application de vérifier le token client via jwtRoute
app.use(jwtRoute());

// Nous demandons à l'application d'utiliser notre routeur
app.use(myRouter);

//Nous demandons à l'application d'utiliser errorHandler pour gérer les erreur non générer par les routes
app.use(errorHandler);



//On lance le serveur   
const server =  app.listen(port, hostname, function(){
      log.info("Mon serveur fonctionne sur http://"+ hostname +":"+port); 
      if (process.env.NODE_ENV == 'test' )
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

// Le serveur est exporté pour les lancement en mode de test
module.exports = server;
