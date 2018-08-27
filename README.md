# mq poc Service

## Versioning

Version | Released Date | Release Notes                                             |tags		|
--------|---------------|-----------------------------------------------------------|----------	|
0.0.1	|	            |	first edition                                           | [v0.0.1]  |


## Routes
monitoring routes
/version
/ping
/vitality
/getenv

microservices app
/mqListener

## How to build
scripts/run.sh build
## How to run
scripts/run.sh up

## gu interface
localhost:9300/docs/#/

##mq info

INFO
----
QM = QM1 (--env MQ_QMGR_NAME=QM1)
admin:passw0rd - QM administration (--env MQ_ADMIN_PASSWORD=passw0rd)
app:passw0rd - Working with Q (--env MQ_APP_PASSWORD=passw0rd)
/etc/mqm/10-dev.mqsc - MQSC file loaded when container start (docker exec -i -t $container_name more /etc/mqm/10-dev.mqsc)
IN Queue added by docker exec when container created


GET MQ SERVER UP AND RUNNING
----------------------------
chmod +x "setMqServer.sh" - change premission to allow execution 
./setMqServer.sh - execute the script (in scripts directory)

GUI
----
Web interface to manage the mq server - https://127.0.0.1:9443/ibmmq/console/login.html

MQ CLIENT
---------
npm - ibmmq: ^0.8.5
must use node image (not slim/alpine)
installs mq client
must create .dockerignore file (node_modules)