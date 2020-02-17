var Certification = artifacts.require("./Certification.sol");

contract("Certification", function (accounts) {
    var certificationInstance;

    it('Pay Class '+accounts[0], function () {
        return Certification.deployed().then(function (instance) {
            certificationInstance = instance;
            return certificationInstance.payClass(20, "0Nm3ZlDWPBTqqWzfSgBY", { from: accounts[0] });
        })
    });

    it('Valid Contract Address', function () {
        return Certification.deployed().then(function (instance) {
            certificationInstance = instance;
            return certificationInstance.getContractAddress();
        }).then(function (address) {
            assert.equal(address, "0x61355fF0aada0dd765f4F2BD96714BedD2359b73")
        })
    });
});
