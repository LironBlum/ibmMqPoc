const mq = require('ibmmq');
const MQC = mq.MQC; 
const StringDecoder = require('string_decoder').StringDecoder;
const decoder = new StringDecoder('utf8');

const qMgr = "QM1";
const qName = "IN";
const msgId = "";

const csp = new mq.MQCSP(); //user ID and password auth
const cno = new mq.MQCNO(); //connection options
const cd = new mq.MQCD(); //mq channel definitiona
cno.Options = MQC.MQCNO_NONE; //connect as client

//authentication (user)
csp.UserId = "app";
csp.Password = "passw0rd";
cno.SecurityParms = csp;
cd.ConnectionName = "docker.for.mac.localhost(1414)"; //connect to a containerized mq server
cd.ChannelName = "DEV.APP.SVRCONN"; //open channel in mq server
cno.ClientConn = cd;

let connectionHandle;
let qHandle;

const waitInterval = 3; // max seconds to wait for a new message
let ok = true;
let exitCode = 0;

function mqListener(req,res) {
  mq.Connx(qMgr,cno, function(err,hConn) {  // Connect to qm
    if (err) {
        console.log('ERROR CONNECTING TO QM!')
        console.log(formatErr(err))
    } else {
      console.log(`MQCONN to ${qMgr} successful`);
      connectionHandle = hConn;
 
      //open connection to q properties
      let od = new mq.MQOD();
      od.ObjectName = qName;
      od.ObjectType = MQC.MQOT_Q;
      let openOptions = MQC.MQOO_INPUT_AS_Q_DEF;

      mq.Open(hConn,od,openOptions,function(err,hObj) {
        qHandle = hObj;
        if (err) {
            console.log(`ERROR CONNECTING TO Q: ${qName}!`)
            console.log(formatErr(err));
        } else {
            console.log(`MQOPEN CONNECTION TO Q: ${qName} successful`);
            setInterval(function() {
                if (!ok) {
                   console.log("Exiting ...");
                   cleanup(connectionHandle,qHandle);
                   process.exit(exitCode);
                } else {
                  getMessages(); 
                }
            }, (waitInterval + 2 ) * 1000);
        }
      });
    }
  });
  res.status(200).json({ status: 'finished'});
}

module.exports = {
  mqListener
};

function getMessages() {
  const md = new mq.MQMD(); //msg descriptor
  const gmo = new mq.MQGMO(); //msg from open q options

  gmo.Options = MQC.MQGMO_NO_SYNCPOINT |
                MQC.MQGMO_WAIT |
                MQC.MQGMO_CONVERT |
                MQC.MQGMO_FAIL_IF_QUIESCING;
  gmo.MatchOptions = MQC.MQMO_NONE;
  gmo.WaitInterval = waitInterval * 1000; // 3 seconds

  if (msgId != null) { //get message by unique mq id
     gmo.MatchOptions = MQC.MQMO_MATCH_MSG_ID;
     md.MsgId = hexToBytes(msgId);
  }
  mq.setPollTime(500); //0.5 sec
  mq.Get(qHandle,md,gmo,getCB);

}

/**
 * Async callback
 * @param {*} err 
 * @param {*} hObj 
 * @param {*} gmo 
 * @param {*} md message descriptor
 * @param {*} buf buffer with message data.
 */
function getCB(err, hObj, gmo,md,buf) {
   if (err) {
     if (err.mqrc == MQC.MQRC_NO_MSG_AVAILABLE) {
       console.log("No messages in queue");
     } else {
       console.log(formatErr(err));
       ok = false; 
       mq.GetDone(hObj);
       exitCode = 1;
     }
   } else {
     if (md.Format=="MQSTR") {
       console.log(`message: ${decoder.write(buf)}`);
     } else {
       console.log(`binary message: ${buf}`);
     }
  }
}

function cleanup(hConn,hObj) {
  mq.Close(hObj, 0, function(err) {
    if (err) {
      console.log(formatErr(err));
    } else {
      console.log("MQCLOSE successful");
    }
    mq.Disc(hConn, function(err) {
      if (err) {
        console.log(formatErr(err));
      } else {
        console.log("MQDISC successful");
      }
    });
  });
}

function formatErr(err) {
    ok = false;
    return "MQ call failed at " + err.message;
}

function hexToBytes(hex) {
    let bytes
    for (bytes = [], c = 0; c < hex.length; c += 2)
    bytes.push(parseInt(hex.substr(c, 2), 16));
    return bytes;
}



