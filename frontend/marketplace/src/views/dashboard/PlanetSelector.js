import React, { useState, useEffect } from 'react';

const PlanetSelector = ({ startPlanet, planetCount }) => {
  const [activePlanet, setActivePlanet] = useState(startPlanet);
  const wrapperRef = React.useRef(null);

  useEffect(() => {
    const handlePlanetClick = (e) => {
      const clickedPlanet = e.currentTarget.getAttribute("data-planet");
      e.preventDefault();
      e.stopPropagation();

      wrapperRef.current.querySelectorAll('.planetButton').forEach(button => {
        button.classList.remove('active');
      });

      if (activePlanet !== undefined) {
        const prevActiveElement = wrapperRef.current.querySelector(
          `[data-planet="${activePlanet}"]`
        );
        if (prevActiveElement) {
          prevActiveElement.classList.remove("active");
        }
      }

      e.currentTarget.classList.add("active");
      setActivePlanet(clickedPlanet);
    };

    const wrapperElement = wrapperRef.current;

    for (let i = startPlanet; i <= startPlanet + planetCount; i++) {
      const planetButton = document.createElement("button");
      planetButton.classList.add("planetButton");
      planetButton.setAttribute("data-planet", String(i));

      const textElement = document.createElement("span");
      textElement.innerHTML = String(i);
      textElement.classList.add("planetText");
      planetButton.appendChild(textElement);

      const stripElement = document.createElement("div");
      stripElement.setAttribute("aria-hidden", "true");
      stripElement.classList.add("strip");
      planetButton.appendChild(stripElement);

      planetButton.addEventListener("click", handlePlanetClick);
      console.log('a');
      if (i === startPlanet) {
        planetButton.classList.add("active");
      }

      wrapperElement.appendChild(planetButton);
    }

    return () => {
      // wrapperElement.querySelectorAll(`.planetButton`).forEach(button => {
      //   button.removeEventListener("click", handlePlanetClick);
      // });
    };
  }, [startPlanet, planetCount, activePlanet]);

  return (
    <div className="container">
      <div className="wrapper-cover-top"></div>
      <div className="wrapper-cover-bottom"></div>
      <div className="scroll-area">
        <div className="wrapper" ref={wrapperRef}></div>
      </div>
    </div>
  );
};

export default PlanetSelector;
