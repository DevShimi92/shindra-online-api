const request = require('supertest');
const app = require('../api');
const configJSON = require('../config');

var methodMysql ;
var conMysql ;
var username ;
var password ;
var MysqlAddress;
var MysqlUsername;
var MysqlPassword;
var MysqlDatabase;

var OtherMysql = false ;


process.argv.forEach(function (val, index, array) {
    if(index == 4)
    {
        if(val == '-paramMySQL')
        {
            OtherMysql = true ;
        } 

    }

    if(OtherMysql == true)
    {
        if(index == 5)
        {
            MysqlAddress = val.substring(1, val.length);

        }
        else if(index == 6)
        {
            MysqlUsername = val.substring(1, val.length);
        } 
        else if(index == 7)
        {
            MysqlPassword = val.substring(1, val.length);
        }
        else if(index == 8)
        {
            MysqlDatabase = val.substring(1, val.length);
        }
    } 
   
        
    console.log(index + ': ' + val);
  });

  if (OtherMysql == false)
  {
    {
        console.log(OtherMysql);
        MysqlAddress  = configJSON.mysql.address;
        MysqlUsername = configJSON.mysql.username;
        MysqlPassword = configJSON.mysql.password;
        MysqlDatabase = configJSON.mysql.database;
        console.log('3no : '+ MysqlAddress,MysqlUsername,MysqlPassword,MysqlDatabase);
    }
  }



  module.exports.configJSONTest = {
    "test" : OtherMysql,
    "address": "localhost",
    "port"   : "1000",
     "mysql": {
         "address"  : MysqlAddress,
         "username" : MysqlUsername,
         "password" : MysqlPassword,
         "database" : MysqlDatabase
     }
 };



  
//==================== Test de l'API  ==================== \\

describe("# Test de l'api", function () {
   
    before(function(){
        methodMysql = require("../db.js");
        lastname  = 'lastnametest';
        firstname = 'firstnametest';
        email    = 'email'+ (Math.floor(Math.random() * (999999 - 1)) + 1 );
        username = 'test'+ (Math.floor(Math.random() * (999999 - 1)) + 1);
        password = 'test';
   });

    describe(" -- MySQL -- ", function () {
        
        it("Connexion MySQL - ALL GREEN", function (done) {
            this.timeout(15000); 
            methodMysql.createMysql(MysqlAddress,MysqlUsername,MysqlPassword,MysqlDatabase, function(value) {
                if ( value.state == 'connected')
                    {
                        conMysql = value ;
                        done();
                    }
                     
              });
        });

        it("Méthode MySQL - Inscription - ALL GRREN ", function (done) {
            this.timeout(15000); 
            methodMysql.signUp(conMysql,lastname,firstname,email,username,password, function(value) {
                if(value == 'OK' ) 
                      {
                        done();
                      }                   

              });
            
        });

        it("Méthode MySQL - Inscription - ACCOUNT ALREADY EXIST WITH USENAME", function (done) {
            this.timeout(15000); 
            methodMysql.signUp(conMysql,lastname,firstname,'AuthoerEmailfdhzeui','test',password, function(value) {
                if(value == 'ERROR_USERNAME_ALREADY_EXISTS' ) 
                      {
                        done();
                      }                   
                      
              });
            
        });

        it("Méthode MySQL - Inscription - ACCOUNT ALREADY EXIST WITH EMAIL", function (done) {
            this.timeout(15000); 
            methodMysql.signUp(conMysql,lastname,firstname,'test@test.fr',username,password, function(value) {
                if(value == 'ERROR_EMAIL_ALREADY_EXISTS' ) 
                      {
                        done();
                      }                   

              });
            
        });

        it("Méthode MySQL - Identification - ALL GRREN", function (done) {
            this.timeout(15000); 
            methodMysql.signIn(conMysql,username,password, function(value) {
                console.log(value);
                if(value == 'OK' ) 
                      {
                        done();
                      }                   

              });

        });

        it("Méthode MySQL - Identification - BAD PASSWORD ", function (done) {
            this.timeout(15000); 
            methodMysql.signIn(conMysql,username,'BADPASSWORDTEST', function(value) {
                if(value == 'ERROR' ) 
                      {
                        done();
                      }                   

              });

        });

        it("Méthode MySQL - Identification - BAD USERNAME", function (done) {
            this.timeout(15000); 
            methodMysql.signIn(conMysql,'BADUSERNAMETEST',password, function(value) {
                if(value == 'ERRORNOTFOUND' ) 
                      {
                        done();
                      }                   

              });

        });

        it("Méthode MySQL - Oubli de mot de passe  - ALL GRREN ", function (done) {
            this.timeout(15000); 
            methodMysql.forgotpassword(conMysql,email, function(value) {
                if(value == 'OK' ) 
                      {
                        done();
                      }                   
              });

        });

        it("Méthode MySQL - Oubli de mot de passe - BAD EMAIL", function (done) {
            this.timeout(15000); 
            methodMysql.forgotpassword(conMysql,'thoerEmailfdhzeui', function(value) {
                if(value == 'ERRORNOTFOUND' ) 
                      {
                        done();
                      }                   
              });

        });

    
    });
   
    describe(" -- Route de l'api -- ", function () {
    
        it("Ping d'api", function (done) {
            this.timeout(15000);
            request(app)
                .get('/')
                .set('Accept', 'application/json')
                .expect(200,{message: "Shindra-Online-API"}, done);
                
        });


        it("Ajout de compte  - ALL GREEN ", function (done) {
            this.timeout(15000);
            email = 'email'+ (Math.floor(Math.random() * (999999 - 1)) + 1 );
            username = 'test'+ (Math.floor(Math.random() * (999999 - 1)) + 1) ;
            let data = {
                "lastname": lastname,
                "firstname": firstname,
                "email":  email,
                "username": username,
                "password": password,
            }
           
                request(app)
                    .post('/signup')
                    .send(data)
                    .set('Accept', 'application/json')
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .end((err) => {
                        if (err) return done(err);
                        done();
                    });
        
        });

        it("Ajout de compte  - MISSING RESOURCES ", function (done) {
            this.timeout(15000);
            let data = {
                "lastname": lastname,
                "firstname": null,
                "email":  email,
                "username": username,
                "password": password,
            }
           
                request(app)
                    .post('/signup')
                    .send(data)
                    .set('Accept', 'application/json')
                    .expect('Content-Type', /json/)
                    .expect(400,{error : 'Missing Resources'})
                    .end((err) => {
                        if (err) return done(err);
                        done();
                    });
        
        });

        it("Ajout de compte  - ACCOUNT ALREADY EXIST WITH EMAIL ", function (done) {
            this.timeout(15000);
            let data = {
                "lastname": lastname,
                "firstname": firstname,
                "email":  email,
                "username": 'test'+ (Math.floor(Math.random() * (999999 - 1)) + 1),
                "password": password,
            }
           
                request(app)
                    .post('/signup')
                    .send(data)
                    .set('Accept', 'application/json')
                    .expect('Content-Type', /json/)
                    .expect(400)
                    .end((err) => {
                        if (err) return done(err);
                        done();
                    });
        
        });

        it("Ajout de compte  - ACCOUNT ALREADY EXIST WITH USENAME ", function (done) {
            this.timeout(15000);
            let data = {
                "lastname": lastname,
                "firstname": firstname,
                "email":  'email'+ (Math.floor(Math.random() * (999999 - 1)) + 1 ),
                "username": username,
                "password": password,
            }
           
                request(app)
                    .post('/signup')
                    .send(data)
                    .set('Accept', 'application/json')
                    .expect('Content-Type', /json/)
                    .expect(400)
                    .end((err) => {
                        if (err) return done(err);
                        done();
                    });
        
        });

        it("Identification de compte - ALL GREEN", function (done) {
            this.timeout(15000);
            let data = {
                "username": username,
                "password": password,
            }
           
                request(app)
                    .post('/signin')
                    .send(data)
                    .set('Accept', 'application/json')
                    .expect(200,{token: ""})
                    .end((err) => {
                        if (err) return done(err);
                        done();
                    });
                     
                    
        });

        it("Identification de compte - INCOMPLETE LOGIN", function (done) {
            this.timeout(15000);
            let data = {
                "username": username
            }
           
                request(app)
                    .post('/signin')
                    .send(data)
                    .set('Accept', 'application/json')
                    .expect(400,{error : 'Incomplete login'})
                    .end((err) => {
                        if (err) return done(err);
                        done();
                    });
                     
                    
        });

        it("Identification de compte - NONEXISTENT ACCOUNT", function (done) {
            this.timeout(15000);
            let data = {
                "username": 'qsdqdqdqsd',
                "password": 'azezeddz',
            }
           
                request(app)
                    .post('/signin')
                    .send(data)
                    .set('Accept', 'application/json')
                    .expect(400,{ error : "The account does not exist"})
                    .end((err) => {
                        if (err) return done(err);
                        done();
                    });
                     
                    
        });

        it("Rest de mot de passe de compte - ALL GREEN", function (done) {
            this.timeout(15000);
            let data = {
                "email": email
            }
           
                request(app)
                    .put('/forgotpassword')
                    .send(data)
                    .set('Accept', 'application/json')
                    .expect(200,{ token : ""})
                    .end((err) => {
                        if (err) return done(err);
                        done();
                    });
        });

        it("Rest de mot de passe de compte - NONEXISTENT ACCOUNT", function (done) {
            this.timeout(15000);
            let data = {
                "email": "EmailQUIexsitepas"
            }
           
                request(app)
                    .put('/forgotpassword')
                    .send(data)
                    .set('Accept', 'application/json')
                    .expect(400,{ error : "The account does not exist" })
                    .end((err) => {
                        if (err) return done(err);
                        done();
                    });
        });

        it("Rest de mot de passe de compte - Missing Resources", function (done) {
            this.timeout(15000);
            let data = {
                "email": null
            }
           
                request(app)
                    .put('/forgotpassword')
                    .send(data)
                    .set('Accept', 'application/json')
                    .expect(400,{ error : 'Missing Resources'})
                    .end((err) => {
                        if (err) return done(err);
                        done();
                    });
        });
        
    
    });
 

});







