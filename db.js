const mysql = require("mysql");
var log4js = require('log4js');

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

module.exports = {
    createMysql: function (hostname,username,password,database, callback) {
        
        const connection = mysql.createConnection({
            host: hostname,
            user: username,
            password: password,
            database: database
        });

        connection.connect(error => {
            if (error)
                { 
                        log.error(error);
                        callback(error.code);
                }
            else
                {
                        log.info("Connected to database !");
                        callback(connection);
                }
        });

    },

    signUp: function (conMysql,lastname,firstname,email,username,password, callback) {
      
      if (lastname.length >= 64 || firstname.length >= 64 || username.length >= 64 || email.length >= 100 || username.password >= 100 )
      {
            log.error("Taille de l'inscription d'un compte anormal"); 
            log.error(lastname,firstname,email,username,password); 
            callback('ERROR');     
      }
      else
      {

            conMysql.query("SELECT email from account Where email = ?",[email], function(err, rows) { 
            if(rows.length > 0 ) // Si le compte est déja existant, on renvoi bad request
                  {
                  log.error("Echec de création de compte : Compte déja exsitant !");
                        callback('ERROR_EMAIL_ALREADY_EXISTS');      
                  }
            else
            {  
                  conMysql.query("SELECT username from account Where username = ?",[username], function(err, rows) { 
                        if(rows.length > 0 )
                              {
                                    log.error("Echec de création de compte : Compte déja exsitant !");   
                                    callback('ERROR_USERNAME_ALREADY_EXISTS');  
                              }
                        else
                              {
                                    var sql = "INSERT INTO account (username, lastname,firstname,email,password,restpassword,date_creation,id_user_type) VALUES ( ? )" ;
                                    var values = [username,lastname,firstname, email,password,0,new Date(),1];
                                          conMysql.query(sql, [values], function (err, result) {
                                          if (err)
                                                { 
                                                      log.error(err); 
                                                      callback('ERROR');  
                                                }
                                          else
                                                {
                                                      log.info("Nouveau compte créer pour le email : "+ email );
                                                      callback('OK');  
                                                }
                                          });
                              }
                        });
            }

            if (err) { 
                  log.error(err);
                  callback('ERROR'); 
            }

            });
      }
    },

    signIn: function (conMysql,username,password, callback) {

      if (username.length >= 64 )
      {
            log.error("Taille de username anormal"); 
            log.error(username); 
            callback('ERROR');     
      }
      else
      {
            conMysql.query("SELECT username,email,password from account Where username = ?",[username], function(err, rows) { 
            if(rows.length == 0 ) // Si le compte n'existe pas, on renvoi bad request
                  {
                        log.error("Echec d'identification : Le compte n'exsite pas");   
                        callback('ERRORNOTFOUND');    
                  }
            else      
            {
                  if ( rows[0].password == password) // Si les identifiant sont correct , on envoi le tokenn
                  {
                        log.info("Identification réussi pour le compte suivant  : "+ rows[0].username); 
                        callback(rows[0].username);
                  }
                  else // Si les identifiant ne sont pas correct , on renvoi bad request
                  {

                        log.error("Echec d'identification : Identifiant incorrect !");   
                        callback('ERROR'); 
                  }
            }
            
            });
      }

    },

  forgotpassword: function (conMysql,email, callback) {
      
      if (email.length >= 100)
            {
                  log.error("Taille de l'email anormal"); 
                  log.error(email); 
                  callback('ERROR');     
            }
      else
      {
            conMysql.query("SELECT * from account Where email = ?",[email], function(err, rows) { 
            if(rows.length == 0 ) // Si le compte n'existe pas, on renvoi bad request
                  {
                        log.error("Echec de rest de mot de passse : Le compte n'exsite pas.");      
                        callback('ERRORNOTFOUND');    
                  }
            else      
            {
                  
                  conMysql.query("UPDATE account SET password = ? WHERE email = ?",['rest',email], function (err, result) {
                        if (err)
                        { 
                              log.error(err);
                              callback('ERROR'); 
                        }
                  log.info("Réinitialisation de mot de passe pour le compte "+rows[0].username+" associé au mail "+rows[0].mail+" réussi !");
                  callback('OK'); 
                  });
            }
            
            });
      }
  }

};