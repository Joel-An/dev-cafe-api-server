/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

const { isEmptyInput } = require('../../util/util');

describe('#isEmptyInput', () => {
  it('null, undefined가 입력되면 true', () => {
    isEmptyInput(null).should.be.true;
    isEmptyInput(undefined).should.be.true;
    isEmptyInput('').should.be.true;
  });

  it('빈 문자열이 입력되면 true', () => {
    isEmptyInput('').should.be.true;
    isEmptyInput('    ').should.be.true;
    isEmptyInput('      ').should.be.true;
  });

  it('빈 object, array가 입력되면 true', () => {
    isEmptyInput({}).should.be.true;
    isEmptyInput([]).should.be.true;
  });

  it('null, undefined, 빈문자열이 함께 입력되면 true', () => {
    isEmptyInput(null, undefined, '').should.be.true;
  });

  it('문자열사이에 null이 있으면 true', () => {
    isEmptyInput('string', null, 'string2').should.be.true;
  });

  it('문자열이 하나 또는 여러개가 입력되면 false', () => {
    isEmptyInput('string').should.be.false;
    isEmptyInput('string', 'string2', 'string3').should.be.false;
  });

  it('Boolean false가 입력되면 false', () => {
    isEmptyInput(false).should.be.false;
  });

  it('문자열 "false"가 입력되면 false', () => {
    isEmptyInput('false').should.be.false;
  });


  it('숫자가 입력되면 false', () => {
    isEmptyInput(1, 0).should.be.false;
  });
});
