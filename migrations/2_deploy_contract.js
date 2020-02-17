var Election = artifacts.require("./Election.sol");
var Certification = artifacts.require("./Certification.sol");

module.exports = function(deployer) {
    deployer.deploy(Election);
    deployer.deploy(Certification);
};
