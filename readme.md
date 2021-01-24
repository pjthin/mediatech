# deploy.sh
------------
#!/bin/bash
cd /opt/nodejs/
rm -rf mediatech
git clone https://github.com/pjthin/mediatech.git
cd mediatech/mediatech-filler
yarn install
------------

# Run with pm2
$ yarn global add pm2
...
$ pm2 startup systemd
... follow instruction
$ sudo systemctl start pm2-pi (pi is the user)

$ pm2 ls
$ pm2 start index
$ pm2 stop index
$ pm2 del index
$ pm2 save (save pm2 status for reboot raspberrypi)
$ pm2 dash (dashboard and logs)
$ pm2 -h (all available command)