import React, { useEffect, useState } from 'react'
import './App.css'
import agora from "agora-rtc-sdk"
import enhanceAgoraRTC from "agoran-awe"

import { Layout, Card, Button, Collapse, Radio, Select, notification } from 'antd'
import FormItem from './Components/FormItem'

const { Content } = Layout
const { Panel } = Collapse
const { Option } = Select

const AgoraRTC = enhanceAgoraRTC(agora)

function App() {
    const [appid, setAppid] = useState('')
    const [channel, setChannel] = useState('')
    const [token, setToken] = useState('')
    const [isJoined, setisJoined] = useState(false);
    const [isPublished, setIsPublished] = useState(false);
    const [uid, setUID] = useState("")
    const [camera, setCamera] = useState({})
    const [microphone, setMicrophone] = useState({})
    const [cameraResolution, setCameraResolution] = useState({})
    const [mode, setMode] = useState("live")
    const [codec, setCodec] = useState("h264")
    const [availableCamera, setAvailableCamera] = useState([])
    const [availableMicrophone, setAvailableMicrophone] = useState([])
    const [localStream, setLocalStream] = useState(null)
    const [remoteStreams, setRemoteStreams] = useState([])
    const [clientInstance, setClientInstance] = useState(null)
    const [mutedAudio, setMutedAudio] = useState(false);
    const [mutedVideo, setMutedVideo] = useState(false);


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

    useEffect(() => {
        const init = () => {
            getDevices(async (devices) => {
                let cameras = await devices.videos
                let audios = await devices.audios

                setAvailableCamera([...cameras])
                setAvailableMicrophone([...audios])
                setCamera(cameras[0])
                setMicrophone(audios[0])
                setCameraResolution(resolutions[0])
            })
        }
        init()
    }, [])

    var rtc = {
        client: clientInstance,
        joined: isJoined,
        published: isPublished,
        localStream: localStream,
        remoteStreams: remoteStreams,
        params: {}
    }

    const fields = ["appid", "channel", "token"]
    const handleClickJoin = async () => {
        console.log("join")
        let params = serializeformData();
        if (validator(params, fields)) {
            await join(rtc, params)
        }
    }

    const handleClickPublish = async () => {
        console.log("publish")
        let params = serializeformData()
        if (validator(params, fields)) {
            await publish(rtc)
        }
    }

    const handleClickUnPublish = async () => {
        console.log("unpublish")
        var params = serializeformData()
        if (validator(params, fields)) {
            await unpublish(rtc)
        }
    }

    const handleClickLeave = async () => {
        console.log("leave")
        var params = serializeformData()
        if (validator(params, fields)) {
            await leave(rtc)
        }
    }


    const handleMuteAudio = () => {
        if (!mutedAudio) {
            localStream.muteAudio();
        } else {
            localStream.unmuteAudio();
        }
        setMutedAudio(!mutedAudio);
    }

    const handleMuteVideo = () => {
        if (!mutedVideo) {
            localStream.muteVideo();
        } else {
            localStream.unmuteVideo();
        }
        setMutedVideo(!mutedVideo);
    }

    const getDevices = (next) => {
        AgoraRTC.getDevices((items) => {
            items.filter((item) => {
                return ["audioinput", "videoinput"].indexOf(item.kind) !== -1
            })
                .map((item) => {
                    return {
                        name: item.label,
                        value: item.deviceId,
                        kind: item.kind,
                    }
                })
            let videos = []
            let audios = []
            for (let i = 0; i < items.length; i++) {
                let item = items[i]
                if ("videoinput" === item.kind) {
                    let name = item.label
                    let value = item.deviceId
                    if (!name) {
                        name = "camera-" + videos.length
                    }
                    videos.push({
                        name: name,
                        value: value,
                        kind: item.kind
                    })
                }
                if ("audioinput" === item.kind) {
                    let name = item.label
                    let value = item.deviceId
                    if (!name) {
                        name = "microphone-" + audios.length
                    }
                    audios.push({
                        name: name,
                        value: value,
                        kind: item.kind
                    })
                }
            }
            next({ videos: videos, audios: audios })
        })
    }

    const serializeformData = () => {
        let formData = [
            { name: "appid", value: appid },
            { name: "channel", value: channel },
            { name: "token", value: token },
            { name: "uid", value: uid },
            { name: "camera", value: camera },
            { name: "microphone", value: microphone },
            { name: "cameraResolution", value: cameraResolution },
            { name: "mode", value: mode },
            { name: "codec", value: codec }
        ]
        let obj = {}
        for (let item of formData) {
            let key = item.name
            let val = item.value
            obj[key] = val
        }
        return obj
    }

    const validator = (params, fields) => {
        var keys = Object.keys(params)
        for (let key of keys) {
            if (fields.indexOf(key) !== -1) {
                if (!params[key]) {
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

    /*
        rtc = {
            client: clientInstance,
            joined: isJoined,
            published: isPublished,
            localStream: localStream,
            remoteStreams: remoteStreams,
            params: {}
        }
    */

    const join = async (rtc, option) => {
        if (rtc.joined) {
            notification.error({
                message: "Your already joined",
                description: null,
                closeIcon: null
            })
            return;
        }
        let client = AgoraRTC.createClient({ mode: option.mode, codec: option.codec })
        rtc.client = client
        rtc.params = option
        setClientInstance(client)

        // handle AgoraRTC client event
        handleEvents(rtc)

        try {
            let uid = isNaN(Number(option.uid)) ? null : Number(option.uid);
            // init client
            await rtc.client.init(option.appid)
            console.log("init success")

            await rtc.client.join(
                option.token ? option.token : null,
                option.channel,
                option.uid ? option.uid : null
            )

            notification.success({
                message: `join channel: ${option.channel} success, uid: ${uid}`,
                description: null,
                closeIcon: null
            })
            console.log("join channel: " + option.channel + " success, uid: " + uid)


            rtc.joined = true
            rtc.params.uid = uid

            // create local stream
            let localStream = AgoraRTC.createStream({
                streamID: rtc.params.uid,
                audio: true,
                video: true,
                screen: false,
                microphoneId: option.microphoneId,
                cameraId: option.cameraId
            })

            rtc.localStream = localStream

            // initialize local stream. Callback function executed after intitialization is done
            await rtc.localStream.init()
            console.log("init local stream success")

            await rtc.localStream.play("local_stream")

            await publish(rtc)

            setLocalStream(localStream)
            setIsPublished(true)
            setisJoined(true)



        } catch (err) {
            notification.error({
                message: `Join failed, please open console see more detail`,
                description: `${err}`,
                closeIcon: null
            })
        }
    }

    const publish = async (rtc) => {
        if (!rtc.client) {
            notification.error({
                message: "Please Join Room First",
                description: null,
                closeIcon: null
            })
            return
        }
        if (rtc.published) {
            notification.error({
                message: "Your already published",
                description: null,
                closeIcon: null
            })
            return
        }
        let oldState = rtc.published
        try {
            // publish localStream
            await rtc.client.publish(rtc.localStream)
            notification.info({
                message: "publish",
                description: null,
                closeIcon: null
            })
            setIsPublished(true)
        } catch (err) {
            setIsPublished(oldState)
            console.log("publish failed")
            notification.error({
                message: "publish failed",
                description: null,
                closeIcon: null
            })
            console.error(err)
        }
    }

    const unpublish = async (rtc) => {
        if (!rtc.client) {
            notification.error({
                message: "Please Join Room First",
                description: null,
                closeIcon: null
            })
            return
        }
        if (!rtc.published) {
            notification.error({
                message: "Your didn't publish",
                description: null,
                closeIcon: null
            })
            return
        }
        let oldState = rtc.published
        try {
            await rtc.client.unpublish(rtc.localStream)
            notification.info({
                message: "unpublish",
                description: null,
                closeIcon: null
            })
            setIsPublished(false)
        } catch (err) {
            setIsPublished(oldState)
            console.log("unpublish failed")
            notification.error({
                message: "unpublish failed",
                description: null,
                closeIcon: null
            })
            console.error(err)
        }
    }

    const leave = async (rtc) => {
        if (!rtc.client) {
            notification.error({
                message: "Please Join First!",
                description: null,
                closeIcon: null
            })
            return
        }
        if (!rtc.joined) {
            notification.error({
                message: "You are not in channel",
                description: null,
                closeIcon: null
            })
            return
        }
        try {
            await rtc.client.leave()
            // stop stream
            if (rtc.localStream.isPlaying()) {
                rtc.localStream.stop()
            }
            // close stream
            await rtc.localStream.close()
            for (let i = 0; i < rtc.remoteStreams.length; i++) {
                let stream = rtc.remoteStreams.shift()
                // let id = stream.getId()
                if (stream.isPlaying()) {
                    stream.stop()
                }
                // removeView(id)
            }
            setLocalStream(null)
            setRemoteStreams([])
            setClientInstance(null)
            console.log("client leaves channel success")
            setIsPublished(false)
            setisJoined(false)
            notification.success({
                message: "leave success",
                description: null,
                closeIcon: null
            })
        } catch (err) {
            console.log("channel leave failed")
            notification.error({
                message: "leave failed",
                description: null,
                closeIcon: null
            })
            console.error(err)
        }
    }

    const handleEvents = async (rtc) => {
        // Occurs when an error message is reported and requires error handling.
        rtc.client.on("error", (err) => {
            console.log(err)
        })
        // Occurs when the peer user leaves the channel; for example, the peer user calls Client.leave.
        rtc.client.on("peer-leave", (evt) => {
            let id = evt.uid;
            console.log("id", evt)
            let streams = rtc.remoteStreams.filter(e => id !== e.getId())
            let peerStream = rtc.remoteStreams.find(e => id === e.getId())
            if (peerStream && peerStream.isPlaying()) {
                peerStream.stop()
            }
            // rtc.remoteStreams = streams
            setRemoteStreams(streams)
            if (id !== rtc.params.uid) {
                // removeView(id)

            }
            notification.success({
                message: "peer leave",
                description: null,
                closeIcon: null
            })
            console.log("peer-leave", id)
        })

        // Occurs when the local stream is published.
        rtc.client.on("stream-published", (evt) => {
            notification.success({
                message: "stream published success",
                description: null,
                closeIcon: null
            })
            console.log("stream-published")
        })

        // Occurs when the remote stream is added.
        rtc.client.on("stream-added", (evt) => {
            let remoteStream = evt.stream
            let id = remoteStream.getId()
            notification.info({
                message: `stream-added uid: ${id}`,
                description: null,
                closeIcon: null
            })
            if (id !== rtc.params.uid) {
                rtc.client.subscribe(remoteStream, (err) => {
                    console.log("stream subscribe failed", err)
                })
            }
            console.log("stream-added remote-uid: ", id)
        })

        // Occurs when a user subscribes to a remote stream.
        rtc.client.on("stream-subscribed", (evt) => {
            let remoteStream = evt.stream
            let id = remoteStream.getId()
            // rtc.remoteStreams.push(remoteStream)
            setRemoteStreams(streamList => [...streamList, remoteStream])

            // addView(id)
            remoteStream.play("remote_video_" + id)
            notification.info({
                message: `stream-subscribed remote-uid: ${id}`,
                description: null,
                closeIcon: null
            })
            console.log("stream-subscribed remote-uid: ", id)
        })

        // Occurs when the remote stream is removed; for example, a peer user calls Client.unpublish.
        rtc.client.on("stream-removed", (evt) => {
            let remoteStream = evt.stream
            let id = remoteStream.getId()
            notification.info({
                message: `stream-removed uid: ${id}`,
                description: null,
                closeIcon: null
            })
            if (remoteStream.isPlaying()) {
                remoteStream.stop()
            }
            let filteredRemoteStreams = rtc.remoteStreams.filter((stream) => {
                return stream.getId() !== id
            })
            setRemoteStreams(filteredRemoteStreams)
            // removeView(id)
            console.log("stream-removed remote-uid: ", id)


            rtc.client.on("onTokenPrivilegeWillExpire", () => {
                // After requesting a new token
                rtc.client.renewToken(token)
                notification.info({
                    message: "onTokenPrivilegeWillExpire",
                    description: null,
                    closeIcon: null
                })
                console.log("onTokenPrivilegeWillExpire")
            })
            rtc.client.on("onTokenPrivilegeDidExpire", () => {
                // After requesting a new token
                rtc.client.renewToken(token)
                notification.info({
                    message: "onTokenPrivilegeDidExpire",
                    description: null,
                    closeIcon: null
                })
                console.log("onTokenPrivilegeDidExpire")
            })
        })
    }

    const handleChangeCamera = (value) => {
        // localStream.switchDevice("video", device.cameraId)
        setCamera({ ...camera, value: value })
    }

    const handleChangeMicrophone = (value) => {
        // localStream.switchDevice("audio", device.microphoneId)
        setMicrophone({ ...microphone, value: value })
    }

    const handleChangeResolution = (value) => {
        setCameraResolution({ ...cameraResolution, value: value })
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
                                value={appid}
                                onChange={(e) => setAppid(e.target.value)}
                                allowClear='true'
                            >
                            </FormItem>
                            <FormItem
                                title={"Channel"}
                                placeholder="Channel"
                                value={channel}
                                onChange={(e) => setChannel(e.target.value)}
                                allowClear='true'
                            >
                            </FormItem>
                            <FormItem
                                title={"Token"}
                                placeholder="Token"
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
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
                            <Collapse bordered={true} >
                                <Panel className="setting-panel" showArrow={false} header="ADVANCED SETTINGS" key="1">
                                    <div style={{ padding: "8px" }}>
                                        <div className="mg-0-0-15-0" >
                                            <span className='input-title'>UID</span>
                                            <input
                                                className="ant-input-affix-wrapper"
                                                style={{ width: "100%" }} type="number"
                                                placeholder="UID"
                                                name="UID"
                                                value={uid}
                                                onChange={(e) => setUID(e.target.value)}
                                            >
                                            </input>
                                        </div>
                                        <div className="mg-15-0" >
                                            <span className='input-title'>CAMERA</span>
                                            <Select
                                                value={camera.value}
                                                style={{ width: "100%" }}
                                                onChange={handleChangeCamera}
                                            >
                                                {availableCamera.map((camera) => {
                                                    return (
                                                        <Option key={camera.name} value={camera.value}>
                                                            {camera.name}
                                                        </Option>
                                                    )
                                                })}
                                            </Select>
                                        </div>
                                        <div className="mg-15-0" >
                                            <span className='input-title'>MICROPHONE</span>
                                            <Select
                                                value={microphone.value}
                                                style={{ width: "100%" }}
                                                onChange={handleChangeMicrophone}
                                            >
                                                {availableMicrophone.map((microphone) => {
                                                    return (
                                                        <Option key={microphone.name} value={microphone.value}>
                                                            {microphone.name}
                                                        </Option>
                                                    )
                                                })}
                                            </Select>
                                        </div>
                                        <div className="mg-15-0" >
                                            <span className='input-title'>CAMERA RESOLUTION</span>
                                            <Select
                                                value={cameraResolution.value}
                                                style={{ width: "100%" }}
                                                onChange={handleChangeResolution}
                                            >
                                                {resolutions.map(resolution => (
                                                    <Option key={resolution.name} value={resolution.value}>
                                                        {resolution.name}
                                                    </Option>
                                                ))}
                                            </Select>
                                        </div>
                                        <div className="mg-15-0" >
                                            <span className='input-title'>MODE</span>
                                            <Radio.Group
                                                style={{ width: "100%", margin: "11px" }}
                                                value={mode}
                                                onChange={(e) => setMode(e.target.value)}
                                            >
                                                <Radio value={"live"}>live</Radio>
                                                <Radio value={"rtc"}>rtc</Radio>
                                            </Radio.Group>
                                        </div>
                                        <div className="mg-15-0" >
                                            <span className='input-title'>CODEC</span>
                                            <Radio.Group
                                                style={{ width: "100%", margin: "11px" }}
                                                value={codec}
                                                onChange={(e) => setCodec(e.target.value)}
                                            >
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
                        <div>
                            <Button disabled={!localStream? true: false} onClick={handleMuteAudio}>
                                {mutedAudio ? "Unmute Audio" : "Mute Audio"}
                            </Button>
                            <Button disabled={!localStream? true: false} onClick={handleMuteVideo}>
                                {mutedVideo ? "Unmute Video" : "Mute Video"}
                            </Button>
                        </div>
                        <div id="video" className="video-grid" >
                            <div className="video-view">
                                <div id="local_stream" className="video-placeholder"></div>
                                <div id="local_video_info" className="video-profile hide"></div>
                                <div id="video_autoplay_local" className="autoplay-fallback hide"></div>
                            </div>
                            {remoteStreams.map((stream) => {
                                let id = stream.getId()
                                return (
                                    <div key={id} id={`remote_video_panel_${id}`} className="video-view">
                                        <div id={`remote_video_${id}`} className="video-placeholder"></div>
                                        <div id={`remote_video_info_${id}`} className={`video-profile hide`}></div>
                                        <div id={`video_autoplay_${id}`} className="autoplay-fallback hide"></div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </Content>
            </Layout>
        </div >
    );
}

export default App;
