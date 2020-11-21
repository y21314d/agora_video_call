import React from 'react';

const Display = ((props) => {
    return (
        <div class="video-block box">
            <div class="video-grid" id="video">
                <div class="video-view">
                    <div id="local_stream" class="video-placeholder"></div>
                    <div id="local_video_info" class="video-profile hide"></div>
                    <div id="video_autoplay_local" class="autoplay-fallback hide"></div>
                </div>
            </div>
        </div>
    )
})

export default Display