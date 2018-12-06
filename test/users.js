process.env.NODE_ENV = "test";

let mongoose = require("mongoose");
let User = require("../models/user");

let chai = require("chai");
let chaiHttp = require("chai-http");
let should = chai.should();

let server = require("../bin/www");

chai.use(chaiHttp);
//Our parent block
describe("Users", () => {
  /*
   * Test the /GET route
   */
  describe("/GET users", () => {
    it("it should GET all users", done => {
      chai
        .request(server)
        .get("/api/v1/users")
        .end((err, res) => {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.a("array");
          res.body.length.should.not.be.equal(0);

          done();
        });
    });
  });
});
