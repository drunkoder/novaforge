import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
//import axios from '../../../axios_interceptor';
import axios from 'axios';

import './App.css';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import suen from './Planets_textures/2k_sun.jpg';
import mercury from './Planets_textures/2k_mercury.jpg';
import venus from './Planets_textures/2k_venus.jpg';
import earth from './Planets_textures/2k_earth_.jpg';
import mars from './Planets_textures/2k_mars.jpg';
import jupiter from './Planets_textures/2k_jupiter.jpg';
import saturn from './Planets_textures/2k_saturn.jpg';
import uranus from './Planets_textures/2k_uranus.jpg';
import neptune from './Planets_textures/2k_neptune.jpg';
import milky from './Planets_textures/8k_stars_milky_way.jpg';
import MiningAreaModel from '../../../../../backend/src/models/mining_areas';
import instance from '../../axios_interceptor';
import { AppFooter } from '../../components';
import {AppHeader} from '../../components';


const Landing_page = () => {
  const mountRef = useRef(null);
  const planetsRef = useRef([]);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const rendererRef = useRef(null);
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [isFocused, setIsFocused] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  var [filteredData,setfilteredData] = useState(null);

  const planetsData = [
    { name: "Mercury", texture: mercury, size: 0.5, distance: 5.8, info: 'Mercury is the closest planet to the Sun.' },
    { name: "Venus", texture: venus, size: 0.9, distance: 10.8, info: 'Venus is the second planet from the Sun.' },
    { name: "Earth", texture: earth, size: 1, distance: 15, info: 'Earth is the third planet from the Sun and our home.' },
    { name: "Mars", texture: mars, size: 0.7, distance: 22.8, info: 'Mars is known as the Red Planet.' },
    { name: "Jupiter", texture: jupiter, size: 2, distance: 30, info: 'Jupiter is the largest planet in our solar system.' },
    { name: "Saturn", texture: saturn, size: 1.7, distance: 40, info: 'Saturn is known for its ring system.' },
    { name: "Uranus", texture: uranus, size: 1.5, distance: 50, info: 'Uranus has a unique tilt, rotating on its side.' },
    { name: "Neptune", texture: neptune, size: 1.4, distance: 60, info: 'Neptune is the farthest planet from the Sun in our solar system.' },
  ];
  
 
  
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/miningareas', {
          headers: {
            'Authorization': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2NWU0YjRmYTRlZWZjNTJiNWFlNTk1NSIsImVtYWlsIjoidXNlckBleGFtcGxlLm9yZyIsImZpcnN0X25hbWUiOiJVc2VyIDEiLCJyb2xlIjoiVXNlciIsIm5vdmFfY29pbl9iYWxhbmNlIjowLCJpYXQiOjE3MTgwNjQzNzZ9.lUBdL0eAISmOLdBaeJR4sqsYWm6cgQggYR-a2tISWBg'
          }
        });
        const miningAreas = response.data.miningAreas;
  
        const filteredData = miningAreas.map(area => {
          const products = area.products.map(product => ({
            name: area.name,
            description: area.description,
            ...product
          }));
          return products;
        }).flat();
  
        setfilteredData(products);
        } catch (error) {
          setError(error.message);
          }
          };
          
          fetchData();
          console.log(filteredData);
  }, []);
  
  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 70;
    camera.position.y = 10;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth - 5, window.innerHeight - 5);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 1, 0);
    pointLight.position.set(0, 0, 0);
    scene.add(pointLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.minDistance = 10;
    controls.maxDistance = 500;
    controlsRef.current = controls;

    const textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin('anonymous');

    const sunTexture = textureLoader.load(suen);
    const sunGeometry = new THREE.SphereGeometry(2, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);

    const planets = [];
    planetsData.forEach(data => {
      const geometry = new THREE.SphereGeometry(data.size, 32, 32);
      const texture = textureLoader.load(data.texture);
      const material = new THREE.MeshBasicMaterial({ map: texture });
      const planet = new THREE.Mesh(geometry, material);
      planet.position.x = data.distance;
      planet.userData = { name: data.name, distance: data.distance, info: data.info };
      planets.push(planet);
      scene.add(planet);

      const orbitGeometry = new THREE.RingGeometry(data.distance - 0.1, data.distance + 0.1, 64);
      const orbitMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
      const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
      orbit.rotation.x = Math.PI / 2;
      scene.add(orbit);
    });
    planetsRef.current = planets;

    function createStarfield() {
      const starGeometry = new THREE.BufferGeometry();
      const starMaterial = new THREE.PointsMaterial({ color: 0xffffff });
      const starVertices = [];

      for (let i = 0; i < 10000; i++) {
        const x = (Math.random() - 0.5) * 2000;
        const y = (Math.random() - 0.5) * 2000;
        const z = (Math.random() - 0.5) * 2000;
        starVertices.push(x, y, z);
      }

      starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
      const stars = new THREE.Points(starGeometry, starMaterial);
      scene.add(stars);
    }
    createStarfield();

    

    const milkyWayTexture = textureLoader.load(milky);
    const milkyWayGeometry = new THREE.SphereGeometry(1000, 64, 64);
    const milkyWayMaterial = new THREE.MeshBasicMaterial({
      map: milkyWayTexture,
      side: THREE.BackSide
    });
    const milkyWay = new THREE.Mesh(milkyWayGeometry, milkyWayMaterial);
    scene.add(milkyWay);

    function animate() {
      requestAnimationFrame(animate);

      planets.forEach(planet => {
        const distance = planet.userData.distance;
        planet.position.x = Math.cos(Date.now() * 0.000005 * distance) * distance;
        planet.position.z = Math.sin(Date.now() * 0.000005 * distance) * distance;
      });

      if (isFocused && selectedPlanet) {
        camera.position.x = selectedPlanet.position.x + 10;
        camera.position.y = selectedPlanet.position.y + 10;
        camera.position.z = selectedPlanet.position.z + 5;
        controls.target.copy(selectedPlanet.position);
      }

      controls.update();
      renderer.render(scene, camera);
    }
    animate();


    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current.removeChild(renderer.domElement);
    };
  }, [isFocused, selectedPlanet]);

  const zoomToPlanet = (planet) => {
    setSelectedPlanet(planet);
    setIsFocused(true);
    showInfo(planet.userData);
  };

  const resetView = () => {
    setSelectedPlanet(null);
    setIsFocused(false);
    const controls = controlsRef.current;
    const camera = cameraRef.current;
    camera.position.set(0, 10, 70);
    controls.target.set(0, 0, 0);
    controls.update();
  };

  const showInfo = async (data) => {
    const planetInfo = document.getElementById('planet-info');
    
    planetInfo.style.display = 'block';
    planetInfo.innerHTML = `<strong>${data.name}</strong><br>${data.info}`;
  };

  

  return (
    <div> 
    <AppHeader />
    <div className="container-fluid">
      <div ref={mountRef} className="canvas-container" style={{ height: '90vh' }}></div>
      <div id="planet-table" className="mt-3">
        <table className="table table-dark table-hover">
          <thead>
            <tr>
              <th>Planet</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {planetsData.map((planet, index) => (
              <tr key={index} onClick={() => zoomToPlanet(planetsRef.current[index])}>
                <td>{planet.name}</td>
                <td><button className="btn btn-primary">Select</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {isFocused && (
          <button className="btn btn-secondary mt-3" onClick={resetView}>Back</button>
        )}
      </div>
      <div id="planet-info" className="mt-3"></div>
    </div>
    <AppFooter />
    </div>
  );
};

export default Landing_page;
