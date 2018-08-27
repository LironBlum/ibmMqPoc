image_name=ibmcom/mq:latest
container_name=mq

echo Cleaning
docker stop $container_name > /dev/null 2>&1; docker rm $container_name > /dev/null 2>&1;

[ $(docker ps -a -q -f name=$container_name) ] || { echo Creating container; docker run --env LICENSE=accept --env MQ_QMGR_NAME=QM1 --env MQ_ADMIN_PASSWORD=passw0rd --env MQ_APP_PASSWORD=passw0rd --publish 1414:1414 --publish 9443:9443 --publish 1422:22 --detach --name $container_name $image_name; sleep 10; }

[ $(docker inspect --format="{{ .State.Running }}" $container_name | grep true) ] || { echo Starting container; docker start $container_name; sleep 10; }
[ $(docker inspect --format="{{ .State.Running }}" $container_name | grep true) ] || { echo Error detected; docker logs $container_name; exit 1; }

echo Waiting for QM to start 1/5
docker exec --tty --interactive $container_name dspmq | grep Running > /dev/null 2>&1 || { sleep 2.5; echo Waiting for QM to start 2/5; }
docker exec --tty --interactive $container_name dspmq | grep Running > /dev/null 2>&1 || { sleep 2.5; echo Waiting for QM to start 3/5; }
docker exec --tty --interactive $container_name dspmq | grep Running > /dev/null 2>&1 || { sleep 2.5; echo Waiting for QM to start 4/5; }
docker exec --tty --interactive $container_name dspmq | grep Running > /dev/null 2>&1 || { sleep 2.5; echo Waiting for QM to start 5/5; }
docker exec --tty --interactive $container_name dspmq | grep Running > /dev/null 2>&1 || { echo Error detected; docker logs $container_name; exit 1; }

echo Configure MQ
echo "DEFINE QLOCAL('IN') REPLACE" | docker exec --interactive $container_name runmqsc -e
docker exec --interactive $container_name setmqaut -m QM1 -n IN -t queue -g mqclient +allmqi +alladm

echo Put Test Message
curl -X POST -u app:passw0rd https://127.0.0.1:9443/ibmmq/rest/v1/messaging/qmgr/QM1/queue/IN/message -H 'Content-Type: text/plain' -H 'ibm-mq-rest-csrf-token: none' -d "test message" --insecure

echo Get Test Message
curl -X DELETE -u app:passw0rd https://127.0.0.1:9443/ibmmq/rest/v1/messaging/qmgr/QM1/queue/IN/message -H 'ibm-mq-rest-csrf-token:none' --insecure

echo Open your browser to manage the mq server
echo https://127.0.0.1:9443/ibmmq/console/