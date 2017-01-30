There is store application with usage of AngularJS

Setup environment:

for better experience - you have to use "git bash" 
 https://git-scm.com/downloads

run next sequence of commands in git bash:

1.  "git clone https://github.com/vitto-moz/testStore_app.git"
2.  "cd testStore_app"
3.  "npm install" (nodejs with npm required)
4.  "gulp serve"
5.  go to localhost mentioned in command line (bash) through your browser

if error below occure (during "gulp serve" run - p.5):

    gulptnst.start.applylgulplnst. toRun);
    ^
    TypeError: Cannot read property 'apply' of undefined

run command: "npm install -g gulp-cli"...then try again p.4
