var express = require('express');
var app = express();
var mysql = require('mysql');
var bodyParser = require("body-parser"); 


var log4js = require('log4js');

//var log = log4js.getLogger();
//log.level = 'debug';
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


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Afin de faciliter le routage (les URL que nous souhaitons prendre en charge dans notre API), nous créons un objet Router.
//C'est à partir de cet objet myRouter, que nous allons implémenter les méthodes. 
var myRouter = express.Router(); 

const fs = require('fs');
// On charge le fichier de config
let rawdata = fs.readFileSync('config.json');
let configJSON = JSON.parse(rawdata);

var hostname = configJSON.address; 
var port = configJSON.port; 



var conMysql = mysql.createConnection({
      host: configJSON.mysql.address,
      user: configJSON.mysql.username,
      password: configJSON.mysql.password,
      database: configJSON.mysql.database
    });
    
    conMysql.connect(function(err) {
      if (err)
            { 
                  log.error(err); 
                  process.exit(2);
            }
      else
            {
                  log.info("Connected to database !");

            }
    });




myRouter.route('/')
// all permet de prendre en charge toutes les méthodes. 
.all(function(req,res){ 
      log.info('Ping d api');
      res.status(200).json({message : "Shindra-Online-API "});
      res.end();
});
 
myRouter.route('/signup') //Création d'un nouveau compte
//POST
.post(function(req,res){
      log.info("Ajout d'un compte...");
      if (req.body.lastname == null || req.body.name == null || req.body.identifiant == null || req.body.mdp == null || req.body.mail == null ) // Si il manque un champ, on renvoi bad request
      {
            res.status(400).json({error : 'Missing Resources'});
            res.end();
            log.error("Echec de création de compte : Champs manquant");      }
      else
      {
            conMysql.query("SELECT mail from account Where mail = '"+req.body.mail+"'", function(err, rows) { 
                  if(rows.length > 0 ) // Si le compte est déja existant, on renvoi bad request
                        {
                              res.status(400).json({error : 'Account already exist'});
                              res.end();
                              log.error("Echec de création de compte : Compte déja exsitant");      
                        }
                  else{
                              conMysql.query("SELECT identifiant from account Where identifiant = '"+req.body.identifiant+"'", function(err, rows) { 
                                    if(rows.length > 0 )
                                    {
                                          res.status(400).json({error : 'Account already exist'});
                                          res.end();
                                          log.error("Echec de création de compte : Compte déja exsitant");    
                                    }
                                    else
                                    {
                                          var sql = "INSERT INTO account (identifiant, lastname,name,mail,mdp) VALUES ( ? )" ;
                                          var values = [req.body.identifiant, req.body.lastname, req.body.name, req.body.mail, req.body.mdp ];
                                          conMysql.query(sql, [values], function (err, result) {
                                                if (err)
                                                      { 
                                                            log.error(err); 
                                                      }
                                                else
                                                      {
                                                            log.info("Nouveau compte créer pour le mail : "+ req.body.mail );
                                                            res.status(200);
                                                            res.end();
                                                      }
                                          });


                                    }
                              });
                        
                        }

                  if (err)
                  { log.error(err); }
                    });
      }})


myRouter.route('/signin')
//POST
.post(function(req,res){
      log.info("Tentative d'identification...");

      if (req.body.mail == null || req.body.mdp == null ) // Si il manque un champ, on renvoi bad request
      {
            res.status(400).json({error : 'Incomplete login'});
            res.end();
            log.error("Echec d'identification : Champs manquant");     4
            log.error(req.body);
      }
      else
      {
            conMysql.query("SELECT identifiant,mail,mdp from account Where mail = '"+req.body.mail+"'", function(err, rows) { 
                  if(rows.length == 0 ) // Si le compte n'existe pas, on renvoi bad request
                        {
                              res.status(400).json({error : 'The account does not exist'});
                              res.end();
                              log.error("Echec d'identification : Le compte n'exsite pas");      
                        }
                  else      
                  {
                        if ( rows[0].mdp == req.body.mdp) // Si les identifiant sont correct , on envoi le tokenn
                        {
                              res.status(200).json({token : ''});
                              res.end();
                              log.info("Identification réussi pour le compte suivant  : "+ rows[0].identifiant); 
                        }
                        else // Si les identifiant ne sont pas correct , on renvoi bad request
                        {
                              res.status(400).json({error : 'Login incorrect'});
                              res.end();
                              log.error("Echec d'identification : Identifiant incorrect");    
                        }
                  }
                  
                  });
      }


      })


myRouter.route('/forgotpassword')
//PUT
.put(function(req,res){
      log.info("Demande de rest de mot de passe...");
      if (req.body.mail == null ) // Si il manque un champ, on renvoi bad request
      {
            res.status(400).json({error : 'Missing Resources'});
            res.end();
            log.error("Echec de rest de mot de passse : Champs manquant");      }
      else
      {
            conMysql.query("SELECT * from account Where mail = '"+req.body.mail+"'", function(err, rows) { 
                  if(rows.length == 0 ) // Si le compte n'existe pas, on renvoi bad request
                        {
                              res.status(400).json({error : 'The account does not exist'});
                              res.end();
                              log.error("Echec de rest de mot de passse : Le compte n'exsite pas");      
                        }
                  else 
                        {
                              var sql = "UPDATE account SET mdp = '"+'rest'+"' WHERE mail = '"+req.body.mail+"'";
                              conMysql.query(sql, function (err, result) {
                                    if (err)
                                    { log.error(err); }
                              res.status(200);
                              res.end();
                              log.info("Réinitialisation de mot de passe pour le compte "+rows[0].identifiant+" associé au mail "+rows[0].mail+" réussi");
                              });
                        }
            });

      }

})
// Nous demandons à l'application d'utiliser notre routeur
app.use(myRouter);

app.listen(port, hostname, function(){
	log.info("Mon serveur fonctionne sur http://"+ hostname +":"+port); 
});