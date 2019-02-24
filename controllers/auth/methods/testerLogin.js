const TokenManager = require('../../../util/token');
const User = require('../../../models/user');
const secretKey = require('../../../config/config').JwtSecretKey;
const { wrapAsync } = require('../../../util/util');

const testerNames = [
  '설렁탕을 사왔는데 먹지를 못하는',
  '거친 파도에도 굴하지 않는',
  '말 안 들으면 이놈하는',
  '맞춤법이 칼같고 싶은',
  '진밥을 좋아하는',
  '귀여운 알파카를 좋아하는',
  '말을 잇지 못하는',
  '탕수육은 무조건 부어먹는',
  '파인애플 피자를 좋아하는',
  '커피를 사랑하는',
  '영어를 잘하고 싶은',
  '짜파게티 코드를 만드는',
  '차가운 도시의',
  '구운 감자를 좋아하는',
  '방청소가 귀찮은',
  'TDD를 좋아하는',
  '피자가 먹고싶은',
  '설거지가 하기 싫은',
  '밥을 물에 말아먹는',
  '인공 눈물을 달고사는',
  '배가 고픈',
  '인성이 어마어마한',
  '책을 많이 읽고 싶은',
  '돈을 많이 벌고 싶은',
  '거울과의 가위바위보에서 승리한',
  '로또만이 희망인',
  '더 이상 할 말이 없는',
  '열 살에 곰을 잡은',
  '젓가락질을 못하는',
  '심각한 악필의',
  '물을 많이 마시는',
  '직화구이를 좋아하는',
  '고들빼기 김치 장인',
  '왼팔에 흑염룡이 봉인된',
  '가위바위보에서 진 적이 없는',
  '1955버거를 좋아하는',
  '0으로 나눌 수 있는',
  '숫자를 0부터 세는',
  '한번 열면 멈출 수 없는',
  '오랫동안 사귀었던 정든 내',
  'CSS가 너무 어려운',
  '알고리즘이 너무 쉬운',
  '있었는데 없어져버린',
];

const maxLen = testerNames.length;

async function generateTester(name) {
  const tester = new User({}, false);
  tester.profileName = `${name} 테스터님`;
  tester.username = tester._id;
  tester.email = 'tester@email.com';
  tester.password = tester.generateHash(secretKey);
  tester.set('isTester', true);

  await tester.save();

  return tester;
}

module.exports = wrapAsync(async (req, res) => {
  const testers = await User.find({ isTester: true });
  let tester;
  if (!testers || testers.length < maxLen) {
    const index = testers ? testers.length : 0;
    tester = await generateTester(testerNames[index]);
  } else {
    tester = testers[Math.floor(Math.random() * maxLen)];
  }

  const tokenManager = new TokenManager();
  const accessToken = await tokenManager.signToken(tester.toObject());

  res.status(201);
  return res.json({ accessToken });
});
