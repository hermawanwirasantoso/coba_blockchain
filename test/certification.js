var Certification = artifacts.require("./Certification.sol");
contract("Certification", function (accounts) {
    let certificationInstace;
    it('Publish Certificate', function () {
        return Certification.deployed().then(function (instance) {
            certificationInstace= instance;
            return instance.publishCertificate("0Nm3ZlDWPBTqqWzfSgBY", {from:accounts[1]});
        }).then(function (result) {
            console.log(result);
        })
    });
});
