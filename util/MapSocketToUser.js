/* eslint-disable no-console */
const mongoose = require('mongoose');

const { ObjectId } = mongoose.Types;

/*
  소켓과 로그인한 유저를 연결하기 위해서 만들었음.

  ex) 데스크탑으로 로그인, 모바일로 로그인 => 알림 생성 시 데스크탑, 모바일 모두에 알림 발송.

  만들고 보니까 socket.io에서 room이란 기능을 지원해서 쓸모 없어짐 ㅎㅎ;

  그냥 삭제하기는 아깝고해서 일단 킵해놓기로 함
*/

class MapSocketToUser {
  constructor() {
    if (MapSocketToUser.instance) return MapSocketToUser.instance;

    MapSocketToUser.instance = this;
    this.mapSidToUid = new Map();
    // 1:1

    this.mapUidToSidSet = new Map();
    // 1:n
  }

  userLoggedIn(uid, sid) {
    this.mapSidToUid.set(sid, uid);

    const sidSet = this.mapUidToSidSet.has(uid)
      ? this.mapUidToSidSet.get(uid)
      : new Set();

    sidSet.add(sid);

    this.mapUidToSidSet.set(uid, sidSet);
  }

  userLoggedOut(sid) {
    if (!this.mapSidToUid.has(sid)) return;

    const uid = this.mapSidToUid.get(sid);
    this.mapSidToUid.delete(sid);

    if (!this.mapUidToSidSet.has(uid)) return;

    const sidSet = this.mapUidToSidSet.get(uid);
    sidSet.delete(sid);

    if (sidSet.size === 0) {
      this.mapUidToSidSet.delete(uid);
    } else {
      this.mapUidToSidSet.set(uid, sidSet);
    }
  }

  print() {
    console.log('SID => UID');
    console.log(this.mapSidToUid);
    console.log('UID => SID');
    console.log(this.mapUidToSidSet);
  }

  findSocketIdsByUesrId(userId) {
    const uid = userId instanceof ObjectId ? userId.toString() : userId;
    return this.mapUidToSidSet.has(uid) ? [...this.mapUidToSidSet.get(uid)] : [];
  }
}

module.exports = MapSocketToUser;
