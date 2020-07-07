const request = require('supertest');
const app = require('../api');
var fs = require("fs");
const nconftest   = require("nconf");

var methodMysql ;
var conMysql ;
var username ;
var password ;
var MysqlAddress;
var MysqlUsername;
var MysqlPassword;
var MysqlDatabase;

var OtherMysql = false ;
var conf_defaults = {};
var conf_file = './config.json';

if( ! fs.existsSync(conf_file) ) {
    fs.writeFileSync( conf_file, JSON.stringify(conf_defaults,null, 2) );
}

nconftest.file('config-test', conf_file);
nconftest.set('address','localhost');
nconftest.set('port',1234);


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
            nconftest.set('mysql:address', val.substring(1, val.length));
        }
        else if(index == 6)
        {
            nconftest.set('mysql:username', val.substring(1, val.length));
        } 
        else if(index == 7)
        {
            nconftest.set('mysql:password', val.substring(1, val.length));
        }
        else if(index == 8)
        {
            nconftest.set('mysql:database', val.substring(1, val.length));
        }
    } 
   
        
  //Debug  console.log(index + ': ' + val);
  });


  if (OtherMysql == false)
  {
    {
        MysqlAddress =  nconftest.get('mysql:address');
        MysqlUsername = nconftest.get('mysql:username');
        MysqlPassword = nconftest.get('mysql:password');
        MysqlDatabase = nconftest.get('mysql:database');
    }
  }



   //nconftest.remove('config');


//  module.exports = { nconftest };


  



  
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
            methodMysql.createMysql(nconftest.get('mysql:address'),nconftest.get('mysql:username'),nconftest.get('mysql:password'),nconftest.get('mysql:database'), function(value) {
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
                .expect(200,{message: "Shindra-Online-API 07/07/202"}, done);
                
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







