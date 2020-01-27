var Election = artifacts.require("./Election.sol");

contract("Election", function (account) {
    var electionInstance;

    it('initializes with two candidates', function () {
        return Election.deployed().then(function (instance) {
            return instance.candidatesCount();
        }).then(function (count) {
            assert.equal(count,2);
        })
    });

    it('initializes with two candidates with correct value', function () {
        return Election.deployed().then(function (instance) {
            electionInstance = instance;
            return electionInstance.candidates(1);
        }).then(function (candidate) {
            assert.equal(candidate[0],1,"Correct ID");
            assert.equal(candidate[1],"Candidate 1", "Correct Name");
            assert.equal(candidate[2],0, "Correct Vote Count");
        })
    });
});
