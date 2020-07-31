You Should Have :

-Python 3 (if you’re using Linux, chances are that it’s already installed. Run python3 -V command to check)

-Pip (the default Python package installer)

-NodeJS(in a version 6 or plus) and npm (5.2+)

-Postgresql 10  with PostGIS extension

Follow These Step to setup the project : 



Run these command on terminal 
 1. sudo apt install -y python3-venv
 2. mkdir environments
 3. python3 -m venv reactenv
 4. source reactenv/bin/activate
 5. pip install -r requirements.txt

 For the installation of Node JS and NPM
  1. sudo apt update
  2. sudo apt install nodejs
  3. sudo apt install npm
  4. nodejs -v
 
 REMEMBER : 
 >>>>>>>This Project uses Postgresql with postgis extension enabled
 >>>>>>>Hence make sure you installed postgresql 10 and created database named "sfm" with postgis extension enabled 
 >>>>>>> You can edit your username and password on settings.py file ( Default is username: 'postgres' and password: 'admin')


AFTER YOU INITIALIZED DATABASE AND INSTALLED ALL LIBRARIES HIT THESE COMMANDS : 
1. Python manage.py makemigrations
2. Python manage.py migrate
3. Navigate to node_modules and hit "npm install " & "npm start"
