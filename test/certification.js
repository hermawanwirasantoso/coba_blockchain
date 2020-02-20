var Certification = artifacts.require("./Certification.sol");

contract("Certification", function (accounts) {
    let certificationInstace;

    it('stringsEqual', function () {
        return Certification.deployed().then(function (instance) {
            return instance.stringsEqual("0Nm3ZlDWPBTqqWzfSgBY","0Nm3ZlDWPBTqqWzfSgBY");
        }).then(function (result) {
            assert.equal(result, true, "Tidak Sama");
        })
    });

    it('enrollClass', function () {
        return Certification.deployed().then(function (instance) {
            return instance.enrollClass(web3.toWei(200, 'ether'),"0Nm3ZlDWPBTqqWzfSgBY", {from: accounts});
        }).then(function (result) {
            assert.equal(result, true, "Tidak Sama");
        })
    });

    it('publishCertificate', function () {
        return Certification.deployed().then(function (instance) {
            certificationInstace= instance;
            return instance.publishCertificate("0Nm3ZlDWPBTqqWzfSgBY", {from:accounts});
        }).then(function (result) {
            certificationInstace.publishedCertificates(1).then(function (result) {
                assert.equal(result.id, 1, "Nomor Urut Sertifikat Tidak Sama");
                assert.equal(result.penerima, accounts, "Penerima Sertifikat Tidak Sama");
                assert.equal(result.classId, "0Nm3ZlDWPBTqqWzfSgBY", "UID Kelas Tidak Sama");
            })
        })
    });
});
