import React, { useReducer, useState } from 'react';
import './App.css';
import AgoraRTC from 'agora-rtc-sdk'

import { Layout, Card, Button, Collapse, Input, Radio, Select, notification } from 'antd';

import FormItem from './Components/FormItem'
import Display from './Components/Display'
import { useCamera, useMicrophone, useMediaStream } from "./hooks";

const { Content } = Layout;
const { Panel } = Collapse;
const { Option } = Select;

const defaultState = {
  appId: "",
  channel: "",
  uid: "",
  token: undefined,
  cameraId: "",
  microphoneId: "",
  cameraResolution: { name: "default", value: "default" },
  mode: "live",
  codec: "h264"
};

const reducer = (state = defaultState, action) => {
  switch (action.type) {
    case "setAppId":
      return {
        ...state,
        appId: action.value
      }
    case "setChannel":
      return {
        ...state,
        channel: action.value
      }
    case "setUid":
      return {
        ...state,
        uid: action.value
      }
    case "setToken":
      return {
        ...state,
        token: action.value
      }
    case "setCamera":
      return {
        ...state,
        cameraId: action.value
      }
    case "setMicrophone":
      return {
        ...state,
        microphoneId: action.value
      }
    case "setCameraResolution":
      return {
        ...state,
        cameraResolution: action.value
      }
    case "setMode":
      return {
        ...state,
        mode: action.value
      }
    case "setCodec":
      return {
        ...state,
        codec: action.value
      }
    default:
      return state
  }
};

function App() {
  const [appid, setAppid] = useState('')
  const [channel, setChannel] = useState('')
  const [token, setToken] = useState('')
  const [isJoined, setisJoined] = useState(false)
  const [isPublished, setIsPublished] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [state, dispatch] = useReducer(reducer, defaultState)
  const [agoraClient, setClient] = useState(undefined)


  const cameraList = useCamera();
  const microphoneList = useMicrophone();
  const resolutions = [
    {
      name: "default",
      value: "default",
    },
    {
      name: "480p",
      value: "480p",
    },
    {
      name: "720p",
      value: "720p",
    },
    {
      name: "1080p",
      value: "1080p"
    }
  ]

  let [localStream, remoteStreamList, streamList] = useMediaStream(agoraClient);


  const onInputAppid = (event) => {
    setAppid(event.target.value)
  }

  const onInputToken = (event) => {
    setToken(event.target.value)
  }

  const onInputChannel = (event) => {
    setChannel(event.target.value)
  }


  // Handle click Join 
  const handleClickJoin = async () => {
    // let params = serializeformData()
    if (true) {
      const client = AgoraRTC.createClient({ mode: state.mode, codec: state.codec })

      setClient(client)
      setIsLoading(true);
      try {
        const uid = isNaN(Number(state.uid)) ? null : Number(state.uid)

        // initializes the client with appId
        await client.init(state.appId)

        // joins a channel with a token, channel, user id
        await client.join(state.token, state.channel, uid)

        // create a ne stream
        const stream = AgoraRTC.createStream({
          streamID: uid || 12345,
          video: true,
          audio: true,
          screen: false
        });

        await stream.init()

        await client.publish(stream)


        setIsPublished(true)
        setisJoined(true)

        notification.info({
          message: `Joined channel ${state.channel}`,
          description: null,
          closeIcon: null
        })
      } catch (err) {
        console.log(err)
        notification.error({
          message: `Failed to join, ${err}`,
          description: null,
          closeIcon: null
        })
      } finally {
        setIsLoading(false);
      }
    }
  }


  const handleClickLeave = async () => {
    if (isJoined) {
      setIsLoading(true);
      try {
        if (localStream) {
          localStream.close();
          await agoraClient.unpublish(localStream);
        }
        await agoraClient.leave();
        setIsPublished(false);
        setisJoined(false);
        notification.info({
          message: "Left channel",
          description: null,
          closeIcon: null
        })
      } catch (err) {
        notification.error({
          message: `Failed to leave, ${err}`,
          description: null,
          closeIcon: null
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      notification.error({
        message: "Please Join First!",
        description: null,
        closeIcon: null
      })
    }
  }


  const handleClickPublish = async () => {
    if (isJoined) {
      setIsLoading(true)
      try {
        if (localStream) {
          await agoraClient.publish(localStream);
          setIsPublished(true)
        }
        notification.info({
          message: "Stream published",
          description: null,
          closeIcon: null
        })
      } catch (err) {
        notification.error({
          message: `Failed to publish, ${err}`,
          description: null,
          closeIcon: null
        })
      } finally {
        setIsLoading(false)
      }
    } else {
      notification.error({
        message: "Please Join Room First!",
        description: null,
        closeIcon: null
      })
    }
  }

  const handleClickUnPublish = () => {
    if (isJoined) {
      if (localStream) {
        agoraClient.unpublish(localStream);
        setIsPublished(false);
        notification.info({
          message: "Stream unpublished",
          description: null,
          closeIcon: null
        })
      }
    } else {
      notification.error({
        message: "Please Join Room First!",
        description: null,
        closeIcon: null
      })
    }
  }

  const update = (actionType) => (e) => {
    console.log(e)
    return dispatch({
      type: actionType,
      value: e.target.value
    });
  };

  const handleChangeCamera = (value) => {
    localStream.switchDevice("video", value);
  };

  const handleChangeMicrophone = (value) => {
    localStream.switchDevice("audio", value);
  };

  const validator = (formData, fields) => {
    var keys = Object.keys(formData)
    for (let key of keys) {
      if (fields.indexOf(key) != -1) {
        if (!formData[key]) {
          notification.error({
            message: `Please Enter ${key}`,
            description: null,
            closeIcon: null
          })
          return false
        }
      }
    }
    return true
  }
  

  return (
    <div className="root">
      <Layout >
        <div className="header">
          <div style={{ height: "55px", position: 'fixed', width: '100%' }}>
            <div className="header-wrapper" >
              <h5 style={{ marginLeft: "15px", fontSize: "1rem", color: "#fff" }}>Basic Communication</h5>
              <a className="agora-github-pin" href="https://github.com/AgoraIO/Basic-Video-Call/tree/master/One-to-One-Video/Agora-Web-Tutorial-1to1" ></a>
            </div>
          </div>
        </div>
        <Content className="container box">
          <div className="box" style={{ minWidth: "433px", maxWidth: "443px" }}>
            <Card
              className="card"
              style={{ marginTop: "0px", marginBottom: "0px" }}
              bordered={true}
            >
              <FormItem
                title={"App ID"}
                placeholder="App ID"
                value={state.appId}
                onChange={update("setAppId")}
                allowClear='true'
              >
              </FormItem>
              <FormItem
                title={"Channel"}
                placeholder="Channel"
                value={state.channel}
                onChange={update("setChannel")}
                allowClear='true'
              >
              </FormItem>
              <FormItem
                title={"Token"}
                placeholder="Token"
                value={state.token}
                onChange={update("setToken")}
                allowClear='true'
              >
              </FormItem>
              <div >
                <div className='function-button box'>
                  <Button style={{ margin: "0 3px" }} type="primary" onClick={handleClickJoin} >JOIN</Button>
                  <Button style={{ margin: "0 3px" }} type="primary" onClick={handleClickLeave} >LEAVE</Button>
                  <Button style={{ margin: "0 3px" }} type="primary" onClick={handleClickPublish} >PUBLISH</Button>
                  <Button style={{ margin: "0 3px" }} type="primary" onClick={handleClickUnPublish} >UNPUBLISH</Button>
                </div>
              </div>
            </Card>
            <div className="advance-setting-block">
              <Collapse bordered={true} defaultActiveKey={['1']} >
                <Panel className="setting-panel" showArrow={false} header="ADVANCED SETTINGS" key="1">
                  <div style={{ padding: "8px" }}>
                    <div className="mg-0-0-15-0" >
                      <span className='input-title'>UID</span>
                      <input className="ant-input-affix-wrapper" style={{ width: "100%" }} type="number" placeholder="UID" name="uid" value={state.uid} onChange={update("setUid")}></input>
                    </div>
                    <div className="mg-15-0" >
                      <span className='input-title'>CAMERA</span>
                      <Select
                        value={state.cameraId}
                        style={{ width: "100%" }}
                        onChange={(e) => update("setCamera")}
                      >
                        {cameraList.map(item => (
                          <Option key={item.deviceId} value={item.deviceId}>
                            {item.label}
                          </Option>
                        ))}
                      </Select>
                    </div>
                    <div className="mg-15-0" >
                      <span className='input-title'>MICROPHONE</span>
                      <Select
                        value={state.microphoneId}
                        style={{ width: "100%" }}
                        onChange={update("setMicrophone")}
                      >
                        {microphoneList.map(item => (
                          <Option key={item.deviceId} value={item.deviceId}>
                            {item.label}
                          </Option>
                        ))}
                      </Select>
                    </div>
                    <div className="mg-15-0" >
                      <span className='input-title'>CAMERA RESOLUTION</span>
                      <Select 
                        value={state.cameraResolution.value} 
                        style={{ width: "100%" }} 
                        onChange={update("setCameraResolution")}
                        >
                        {resolutions.map(resolution => (
                          <Option key={resolution.value} value={resolution.value}>
                            {resolution.name}
                          </Option>
                        ))}
                      </Select>
                    </div>
                    <div className="mg-15-0" >
                      <span className='input-title'>MODE</span>
                      <Radio.Group style={{ width: "100%", margin: "11px" }} value={state.mode} onChange={update("setMode")}>
                        <Radio value={"live"}>live</Radio>
                        <Radio value={"rtc"}>rtc</Radio>
                      </Radio.Group>
                    </div>
                    <div className="mg-15-0" >
                      <span className='input-title'>CODEC</span>
                      <Radio.Group style={{ width: "100%", margin: "11px" }} value={state.codec} onChange={update("setCodec")}>
                        <Radio value={"h264"}>h264</Radio>
                        <Radio value={"vp8"}>vp8</Radio>
                      </Radio.Group>
                    </div>
                  </div>
                </Panel>
              </Collapse>
            </div>
          </div>
          <div className="video-block box">
            <div className="video-grid" id="video">
              <div className="video-view">
                <div id="local_stream" className="video-placeholder"></div>
                <div id="local_video_info" className="video-profile hide"></div>
                <div id="video_autoplay_local" className="autoplay-fallback hide"></div>
              </div>
            </div>
          </div>
          {/* <Display /> */}
        </Content>
      </Layout>
    </div >
  );
}

export default App;
