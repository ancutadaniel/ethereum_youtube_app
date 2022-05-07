const Youtube = artifacts.require('Youtube');
const chai = require('chai');

chai.use(require('chai-as-promised')).should();

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract('Youtube', async ([deployer, author]) => {
  let youtube;

  before(async () => {
    youtube = await Youtube.deployed();
  });

  describe('deployment of the contract', async () => {
    it('contract deployed successfully and has a address', async () => {
      const address = await youtube.address;

      assert.notEqual(address, 0x0);
      assert.notEqual(address, '');
      assert.notEqual(address, null);
      assert.notEqual(address, undefined);
      assert.isString(address);
    });

    it('check the name of the contract', async () => {
      const name = await youtube.name();
      assert.equal(name, 'Youtube', 'Contract has no name set');
    });

    it('should assert true', async function () {
      await Youtube.deployed();
      return assert.isTrue(true);
    });
  });

  describe('videos', async () => {
    let result, videoCount;
    const hash = 'QmevgiAivhBRShk6V3Ehd7TitYxGXphXU2PToU4o9MsZWS';

    before(async () => {
      result = await youtube.uploadVideo(hash, 'Video title', { from: author });
      videoCount = await youtube.videoCount();
    });

    //check event
    it('creates videos', async () => {
      // SUCCESS
      assert.equal(videoCount, 1);
      const event = result.logs[0].args;
      assert.equal(event.id.toNumber(), videoCount.toNumber(), 'id is correct');
      assert.equal(event.hash, hash, 'Hash is correct');
      assert.equal(event.title, 'Video title', 'title is correct');
      assert.equal(event.sender, author, 'author is correct');

      // FAILURE: Video must have hash
      await youtube.uploadVideo('', 'Video title', { from: author }).should.be
        .rejected;

      // FAILURE: Video must have title
      await youtube.uploadVideo('Video hash', '', { from: author }).should.be
        .rejected;
    });

    //check from Struct
    it('lists videos', async () => {
      const video = await youtube.videos(videoCount);
      assert.equal(video.id.toNumber(), videoCount.toNumber(), 'id is correct');
      assert.equal(video.hash, hash, 'Hash is correct');
      assert.equal(video.title, 'Video title', 'title is correct');
      assert.equal(video.author, author, 'author is correct');
    });
  });
});
