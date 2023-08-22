import React from 'react';

const YoutubeEmbed = ({ videoId }) => {
  return (
    <div className="youtube-embed">
      <iframe
        width="560"
        height="315"
        src={`https://www.youtube.com/embed/${videoId}`}
        allowFullScreen
      ></iframe>
    </div>
  );
};

export default YoutubeEmbed;