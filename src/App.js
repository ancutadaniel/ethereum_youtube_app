import React, { useCallback, useEffect, useState } from 'react';
import getWeb3 from './utils/getWeb3';

import Youtube from '../src/build/abi/Youtube.json';
import MainMenu from './components/Menu';

import { create } from 'ipfs-http-client';
import './App.css';

import {
  Button,
  Container,
  Form,
  Divider,
  Message,
  Grid,
  Card,
  Icon,
} from 'semantic-ui-react';

const App = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contract, setContract] = useState({});
  const [, setWeb3] = useState({});
  const [errors, setErrors] = useState();

  const [videos, setVideos] = useState([]);
  const [latestVideo, setLatestVideo] = useState();
  const [title, setTitle] = useState('');

  // IPFS Array buffer
  const [bufferFile, setBufferFile] = useState(null);

  const INFURA_ID = process.env.REACT_APP_INFURA_ID;
  const INFURA_SECRET_KEY = process.env.REACT_APP_INFURA_SECRET_KEY;
  const auth =
    'Basic ' +
    Buffer.from(INFURA_ID + ':' + INFURA_SECRET_KEY).toString('base64');

  const url = `https://dropbox.infura-ipfs.io/ipfs`;

  const ipfs = create({
    host: 'ipfs.infura.io',
    port: '5001',
    protocol: 'https',
    headers: {
      authorization: auth,
    },
  });

  const loadWeb3 = async () => {
    try {
      const web3 = await getWeb3();
      if (web3) {
        const getAccounts = await web3.eth.getAccounts();
        // get networks id of deployed contract
        const getNetworkId = await web3.eth.net.getId();
        // get contract data on this network
        const newData = await Youtube.networks[getNetworkId];
        // check contract deployed networks
        if (newData) {
          // get contract deployed address
          const contractAddress = newData.address;
          // create a new instance of the contract - on that specific address
          const contractData = await new web3.eth.Contract(
            Youtube.abi,
            contractAddress
          );

          setContract(contractData);
        } else {
          alert('Smart contract not deployed to selected network');
        }
        setWeb3(web3);
        setAccounts(getAccounts);
        setLoading(false);
      }
    } catch (error) {
      setErrors(error);
    }
  };

  const handleTitle = (e) => {
    setTitle(e.target.value);
  };

  const handleUpload = (e) => {
    setLoading(true);
    try {
      const fileUpload = e.target.files[0];
      const reader = new FileReader();
      // create the array buffer for IPFS
      reader.readAsArrayBuffer(fileUpload);
      // success
      reader.onload = () => setBufferFile(Buffer(reader.result));
      // error
      reader.onerror = () => setErrors(reader.error);
      setLoading(false);
    } catch (error) {
      setErrors(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await ipfs.add(bufferFile);
      if (data) {
        handleIpfsData(data);
        setTitle('');
        setBufferFile(null);
      }
      setLoading(false);
    } catch (error) {
      setErrors(error);
    }
  };

  const handleIpfsData = async (data) => {
    setLoading(true);
    try {
      await contract.methods.uploadVideo(data.path, title).send({
        from: accounts[0],
      });
      showVideos();
      setLoading(false);
    } catch (error) {
      setErrors(error);
    }
  };

  const showVideos = useCallback(async () => {
    setLoading(true);
    try {
      // read data from blockchain
      const getVideoCount = await contract.methods.videoCount().call();
      let videoArr = [];
      for (let i = getVideoCount; i >= 1; i--) {
        const getVideo = await contract.methods.videos(i).call();
        const { id, title, hash, author } = getVideo;
        videoArr.push({ id, title, hash, author });
      }
      // set default video
      const getLatestVideo = await contract.methods
        .videos(getVideoCount)
        .call();
      const { id, title, hash, author } = getLatestVideo;
      setLatestVideo({ id, title, hash, author });

      setVideos(videoArr);
      setLoading(false);
    } catch (error) {
      setErrors(error);
    }
  }, [contract]);

  const handleChangeVideo = (video) => {
    const { id, title, hash, author } = video;
    setLatestVideo({ id, title, hash, author });
  };

  useEffect(() => {
    if (contract && contract?.options?.address) showVideos();
  }, [contract, showVideos]);

  useEffect(() => {
    loadWeb3();
  }, []);

  return (
    <div className='App'>
      <MainMenu account={accounts[0]} />

      <Divider horizontal>§</Divider>

      <Container>
        <Grid celled>
          <Grid.Row>
            <Grid.Column width={12}>
              {latestVideo && !!latestVideo.hash && (
                <>
                  <h4>{latestVideo.title}</h4>
                  <video
                    src={`${url}/${latestVideo?.hash}`}
                    controls
                    width='640'
                    height='360'
                  />
                </>
              )}
            </Grid.Column>
            <Grid.Column
              width={4}
              style={{ overflowY: 'scroll', height: '740px' }}
            >
              <Form onSubmit={handleSubmit} loading={loading}>
                <Form.Input
                  label='Video Title'
                  placeholder='title...'
                  name='title'
                  type='text'
                  value={title}
                  onChange={handleTitle}
                  required
                />
                <Form.Input
                  label='Upload Video'
                  placeholder='Upload Video'
                  type='file'
                  onChange={handleUpload}
                  accept='.mp4, .mkv, .ogg, .wmv'
                  required
                />
                <Button color='purple' type='submit'>
                  Submit
                </Button>
              </Form>
              <Divider horizontal>§</Divider>
              {videos.map((video) => {
                return (
                  <div
                    className='video_card'
                    key={video.id}
                    onClick={() => handleChangeVideo(video)}
                  >
                    <Card centered>
                      <video
                        src={`${url}/${video?.hash}`}
                        width='auto'
                        height='auto'
                      />
                      <Card.Content>
                        <Card.Header>{video.title}</Card.Header>
                        <Card.Meta>Author</Card.Meta>
                        <Card.Description>
                          <a
                            href={`https://goerli.etherscan.io/address/${video.author}`}
                            target='_blank'
                            rel='noopener noreferrer'
                          >
                            {video.author.substring(0, 20)}...
                          </a>
                        </Card.Description>
                      </Card.Content>
                    </Card>
                    <Divider horizontal>
                      <Icon name='video' size='mini' />
                    </Divider>
                  </div>
                );
              })}
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Container>
      <Divider horizontal>§</Divider>
      <Container>
        {errors && (
          <Message negative>
            <Message.Header>Code: {errors?.code}</Message.Header>
            <p>{errors?.message}</p>
          </Message>
        )}
      </Container>
    </div>
  );
};

export default App;
