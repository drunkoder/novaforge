import React, { useEffect, useRef, useState } from 'react';

const TimelinePlanetSelector = ({ planets, selectedPlanet, onDotClick, showTimeline }) => {

  //const [showTimeline, setShowTimeline] = useState(false);

  // const toggleTimeline = () => {
  //     setShowTimeline(!showTimeline);
  //     showTimelineClick(!showTimeline);
  // };

  useEffect(() => {
}, [planets]);

  return (
    
    <div className="main">
      {/* <button className="fab-button" onClick={toggleTimeline}>
          {showTimeline ? 'x' : '+'}
        </button> */}
      {showTimeline && planets && (
      <div className="timeline">
        <div className="box">
          <div className="container">
            <div className="lines">
              {planets.map((planet, index) => (
                <React.Fragment key={index}>
                  <div
                    className={`dot ${selectedPlanet?.userData?.id === planet.userData.id ? 'active' : ''}`}
                    onClick={() => onDotClick(planet)}
                  />
                  <div className="planet-name">{planet.userData.name}</div>
                  {index !== planets.length - 1 && <div className="line" />}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>)}
    </div>
  );
};

export default TimelinePlanetSelector;
