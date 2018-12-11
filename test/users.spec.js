describe('Users', () => {
  describe('/GET users', () => {
    it('it should GET all users', done => {
      chai
        .request(server)
        .get(API_URI + '/users')
        .end((err, res) => {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.a('array');
          res.body.length.should.not.be.equal(0);

          done();
        });
    });
  });
});
