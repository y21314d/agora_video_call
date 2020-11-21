import React, { useState } from 'react';
import './App.css';

import { Layout, Card, Button, Collapse, Input, Radio, Select, notification } from 'antd';
import { SmileOutlined } from '@ant-design/icons';

import FormItem from './Components/FormItem'
import Display from './Components/Display'

const { Content } = Layout;
const { Panel } = Collapse;
const { Option } = Select;

const log = console.log.bind(console)

function App() {


  const [appid, setAppid] = useState('')
  const [channel, setChannel] = useState('')
  const [token, setToken] = useState('')
  const [isjoin, setIsJoin] = useState(false)


  const onInputAppid = (event) => {
    setAppid(event.target.value)
  }

  const onInputToken = (event) => {
    setToken(event.target.value)
  }

  const onInputChannel = (event) => {
    setChannel(event.target.value)
  }

  const handleClickJoin = () => {
    if (!appid || !channel || !token) {
      if (!appid) {
        openNotification('appid')
      }
      if (!channel) {
        openNotification('channel')
      }
      if (!token) {
        openNotification('token')
      }
      return
    }

    let options = {
      appId: appid,
      channel: channel,
      token: token,
    }
    // startBasicCall(options)
    log('join channel success')
    setIsJoin(true)
  }

  const handleClickLeave = () => {
    // leaveCall()
    log('client leaves channel success')
    setIsJoin(false)
  }

  const handleClickPublish = () => {

  }

  const handleClickUnPublish = () => {

  }

  const onClickSetting = () => {

  }

  const update = () => {

  }

  const openNotification = (placement) => {
    notification.open({
      message: 'Please enter complete information',
      description:
        `The ${placement} is empty`,
      icon: <SmileOutlined style={{ color: '#108ee9' }} />,
    });
  };

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
                value={appid}
                onChange={onInputAppid}
                allowClear='true'
              >
              </FormItem>
              <FormItem
                title={"Channel"}
                placeholder="Channel"
                value={channel}
                onChange={onInputChannel}
                allowClear='true'
              >
              </FormItem>
              <FormItem
                title={"Token"}
                placeholder="Token"
                value={token}
                onChange={onInputToken}
                allowClear='true'
              >
              </FormItem>
              <div >
                <div className='function-button box'>
                  <Button style={{ margin: "0 3px" }} type="primary" onClick={handleClickJoin} disabled={isjoin}>JOIN</Button>
                  <Button style={{ margin: "0 3px" }} type="primary" onClick={handleClickLeave} disabled={isjoin}>LEAVE</Button>
                  <Button style={{ margin: "0 3px" }} type="primary" onClick={handleClickPublish} disabled={isjoin}>PUBLISH</Button>
                  <Button style={{ margin: "0 3px" }} type="primary" onClick={handleClickUnPublish} disabled={isjoin}>UNPUBLISH</Button>
                </div>
              </div>
            </Card>
            <div className="advance-setting-block">
              <Collapse bordered={true} defaultActiveKey={['1']} onChange={onClickSetting}>
                <Panel className="setting-panel" showArrow={false} header="ADVANCED SETTINGS" key="1">
                  <div style={{ padding: "8px" }}>
                    <div className="mg-0-0-15-0" >
                      <span className='input-title'>UID</span>
                      {/* <InputNumber formatter={number} style={{width: "100%"}} placeholder="UID"  allowClear='true' /> */}
                      <input className="ant-input-affix-wrapper" style={{ width: "100%" }} type="number" placeholder="UID" name="uid"></input>
                    </div>
                    <div className="mg-15-0" >
                      <span className='input-title'>CAMERA</span>
                      <Select defaultValue="CAMERA" style={{ width: "100%" }} >
                        <Option value="Option1">Option1</Option>
                        <Option value="Option2">Option2</Option>
                      </Select>
                    </div>
                    <div className="mg-15-0" >
                      <span className='input-title'>MICROPHONE</span>
                      <Select defaultValue="MICROPHONE" style={{ width: "100%" }} >
                        <Option value="Option1">Option1</Option>
                        <Option value="Option2">Option2</Option>
                      </Select>
                    </div>
                    <div className="mg-15-0" >
                      <span className='input-title'>CAMERA RESOLUTION</span>
                      <Select defaultValue="CAMERA RESOLUTION" style={{ width: "100%" }} >
                        <Option value="Option1">Option1</Option>
                        <Option value="Option2">Option2</Option>
                      </Select>
                    </div>
                    <div className="mg-15-0" >
                      <span className='input-title'>MODE</span>
                      <Radio.Group style={{ width: "100%", margin: "11px" }} onChange={update} value={1}>
                        <Radio value={1}>live</Radio>
                        <Radio value={2}>rtc</Radio>
                      </Radio.Group>
                    </div>
                    <div className="mg-15-0" >
                      <span className='input-title'>CODEC</span>
                      <Radio.Group style={{ width: "100%", margin: "11px" }} onChange={update} value={1}>
                        <Radio value={1}>h264</Radio>
                        <Radio value={2}>vp8</Radio>
                      </Radio.Group>
                    </div>
                  </div>
                </Panel>
              </Collapse>
            </div>
          </div>
          <div class="video-block box">
            <div class="video-grid" id="video">
              <div class="video-view">
                <div id="local_stream" class="video-placeholder"></div>
                <div id="local_video_info" class="video-profile hide"></div>
                <div id="video_autoplay_local" class="autoplay-fallback hide"></div>
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
