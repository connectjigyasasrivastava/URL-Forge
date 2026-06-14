const os=require('os');

const EPOCH = 1700000000000n;
const MACHINE_ID = BigInt(parseInt(os.hostname().charCodeAt(0))) & 0x3FFn;
let sequence = 0n;
let lastTimestamp = -1n;

function generateSnowflakeId() {
  let timestamp = BigInt(Date.now());

  if (timestamp === lastTimestamp) {
    sequence = (sequence + 1n) & 0xFFFn;
    if (sequence === 0n) {
      while (timestamp <= lastTimestamp) {
        timestamp = BigInt(Date.now());
      }
    }
  } else {
    sequence=0n;
  }

  lastTimestamp=timestamp;

  const id=((timestamp-EPOCH)<<22n) | (MACHINE_ID<<12n) | sequence;
  return id;
}

function toBase62(id) {
  const chars='0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result='';
  let num=id;
  while (num>0n) {
    result=chars[Number(num % 62n)] + result;
    num= num / 62n;
  }
  return result.padStart(7, '0');
}

module.exports ={ generateSnowflakeId, toBase62 };