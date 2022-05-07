// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Youtube {
  uint public videoCount;
  address public owner;
  string public name = "Youtube";

  struct Video {
    uint id;
    string hash;
    string title;
    address author;
  }

  mapping(uint => Video) public videos;

  constructor()  {
    owner = msg.sender;
  }

  event VideoAdded(uint id, string hash, string title, address sender);

  function uploadVideo(string memory _videoHash, string memory _title) public {
    require(bytes(_videoHash).length > 0, "Should have a hash");
    require(bytes(_title).length > 0, "Should have a title");

    videoCount += 1;
    videos[videoCount] = Video(videoCount, _videoHash, _title, msg.sender);

    emit VideoAdded(videoCount, _videoHash, _title, msg.sender);
  }
}
