# :arrow_double_down: Set Up:
Follow the steps below to set up your environment on your device

## Downloads :exclamation: :
- Github / Github Desktop (Preferred)
- Visual Studio Code
- MySQL Workbench 8.0

### Github
- Clone repository:
- ![image](https://github.com/Quarcc/ElderWee/assets/121778246/dea638fd-672c-43a9-b119-be735ee1123a)
1. Click on "clone" / "clone again"
2. Ensure that repository is cloned into your "C:" drive
3. File directory should look like this: "C:/ElderWee"
4. If it looks like this: "C:/ElderWee/ElderWee", copy the second folder and paste it into your "C:" drive directly

### Visual Studio Code
- Download Dependencies
Run:
1. ```cd backend```
2. ```npm install```
3. ```cd ..```
4. ```cd frontend```
5. ```npm install```
6. ```cd ..```
   
- Download extension: "Live Share" by microsoft (For collaboration)
- ![image](https://github.com/Quarcc/EventNow/assets/121778246/3aa895cc-adc2-42d1-8fde-9b6e0dff821f)

### MySQL Workbench 8.0
- Setup your database in your "Local Instance MySQL80"
- ![image](https://github.com/Quarcc/EventNow/assets/121778246/5cb7060c-f259-42cb-aa29-faacc2b54de6)
1. Ensure that user is "root"
2. Port is "localhost:3306"

- Add user account
- ![image](https://github.com/Quarcc/EventNow/assets/121778246/a5f087c7-f03a-413a-9fd3-01e729cb009f)
1. Under Management, click on Users and Privileges
- ![image](https://github.com/Quarcc/EventNow/assets/121778246/81f3ed4c-4611-455d-ad49-749fe10c9d48)
1. Click Add Account
2. Login Name: "elderwee"
3. Password: "elderwee"
4. Confirm Password: "elderwee"
5. Check all boxes for "Administrative Roles"
6. Hit "Apply"

- Add Schema
- ![image](https://github.com/Quarcc/EventNow/assets/121778246/54e3f705-1aab-498a-9bb6-951fac6a2286)
1. Right click the box and click "Create Schema"
2. Name: "elderwee"
3. Hit "Apply"

#### You're done! Happy coding

# MAKE YOUR LIFE EASIER AND SAFE :exclamation: :
### Open VSC
1. Hit ```"Ctrl" + "+"``` / "File > Preference > Settings"
2. Search "Auto Save"
3. At "Files: Auto Save", select ```afterDelay```