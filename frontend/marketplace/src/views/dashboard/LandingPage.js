import React, { useEffect, useRef, useState } from 'react';
import { CContainer, CRow, CCol } from '@coreui/react';
import * as THREE from 'three';
import axios from '../../axios_interceptor';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import '../../assets/css/landing_page.css';
import suen from '../../assets/images/planets_textures/2k_sun.jpg';
import mercury from '../../assets/images/planets_textures/2k_mercury.jpg';
import venus from '../../assets/images/planets_textures/2k_venus.jpg';
import earth from '../../assets/images/planets_textures/2k_earth_.jpg';
import mars from '../../assets/images/planets_textures/2k_mars.jpg';
import jupiter from '../../assets/images/planets_textures/2k_jupiter.jpg';
import saturn from '../../assets/images/planets_textures/2k_saturn.jpg';
import uranus from '../../assets/images/planets_textures/2k_uranus.jpg';
import neptune from '../../assets/images/planets_textures/2k_neptune.jpg';
import milky from '../../assets/images/planets_textures/8k_stars_milky_way.jpg';

const LandingPage = () => {
  const mountRef = useRef(null);
  const planetsRef = useRef([]);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const rendererRef = useRef(null);
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [isFocused, setIsFocused] = useState(false);
  const [miningAreas, setMiningAreas] = useState(null);
  const [productData, setProductData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/miningareas`);
        setMiningAreas(response.data.miningAreas);
      } catch (error) {
        setError(error.message);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!miningAreas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 70;
    camera.position.y = 10;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(mountRef.current.offsetWidth, mountRef.current.offsetHeight);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 1, 0);
    pointLight.position.set(0, 0, 0);
    scene.add(pointLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.minDistance = 10;
    controls.maxDistance = Math.max(50, miningAreas.length * 10);
    controlsRef.current = controls;

    const textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin('anonymous');

    const sunTexture = textureLoader.load(suen);
    const sunGeometry = new THREE.SphereGeometry(2, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);

    const planets = [];
    miningAreas.forEach((data, index) => {
      const { _id, image, name, description } = data;

      const size = Math.random() * (2 - 0.5) + 0.5;
      const geometry = new THREE.SphereGeometry(size, 32, 32);
      const planetImage = image || '2k_earth_.jpg';

      const planetTexture = textureLoader.load(`src/assets/images/planets_textures/${planetImage}`, () => {
        const material = new THREE.MeshBasicMaterial({ map: planetTexture });
        const planet = new THREE.Mesh(geometry, material);

        const distance = (index + 1) * 10;
        planet.position.x = distance;
        planet.userData = { id: _id, name, distance, description, products: data.products };

        planets.push(planet);
        scene.add(planet);

        const orbitGeometry = new THREE.RingGeometry(distance - 0.1, distance + 0.1, 64);
        const orbitMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
        const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
        orbit.rotation.x = Math.PI / 2;
        scene.add(orbit);
      });

      planetsRef.current = planets;
    });

    const createStarfield = () => {
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
    };
    createStarfield();

    const milkyWayTexture = textureLoader.load(milky);
    const milkyWayGeometry = new THREE.SphereGeometry(1000, 64, 64);
    const milkyWayMaterial = new THREE.MeshBasicMaterial({
      map: milkyWayTexture,
      side: THREE.BackSide,
    });
    const milkyWay = new THREE.Mesh(milkyWayGeometry, milkyWayMaterial);
    scene.add(milkyWay);

    const animate = () => {
      requestAnimationFrame(animate);

      planets.forEach((planet) => {
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
    };
    animate();

    const handleResize = () => {
      camera.aspect = mountRef.current.offsetWidth / mountRef.current.offsetHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.offsetWidth, mountRef.current.offsetHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current.removeChild(renderer.domElement);
    };
  }, [isFocused, selectedPlanet, miningAreas]);

  const zoomToPlanet = async (planet) => {
    setSelectedPlanet(planet);
    setIsFocused(true);
    const products = await fetchProductData(planet.userData.products);
    showInfo(planet.userData, products);
  };

  const fetchProductData = async (products) => {
    try {
      const productData = await Promise.all(products.map(async (product) => {
        const response = await axios.get(`${BASE_URL}/api/products/${product.product_id}`);
        return response.data;
      }));
      return productData;
    } catch (error) {
      setError(error.message);
    }
  };

  const resetView = () => {
    setSelectedPlanet(null);
    setIsFocused(false);
    setProductData([]);
    const controls = controlsRef.current;
    const camera = cameraRef.current;
    camera.position.set(0, 10, 70);
    controls.target.set(0, 0, 0);
    controls.update();
  };

  const showInfo = (data, products) => {
    const planetInfo = document.getElementById('planet-info');
    planetInfo.style.display = 'block';

    let productTable = `<table class="table table-white table-hover"><thead><tr><th>Code</th><th>Description</th></tr></thead><tbody>`;
    products.forEach(product => {
      productTable += `<tr><td>${product.code}</td><td>${product.description}</td></tr>`;
    });
    productTable += `</tbody></table>`;

    planetInfo.innerHTML = `<strong>${data.name}</strong><br>${data.description}<br>${productTable}`;
  };

  return (
    <CContainer>
      <CRow>
        <CCol>
          <div ref={mountRef} className="canvas-container"></div>
        </CCol>
      </CRow>
      <div id="planet-table" className="mt-3">
        <table className="table table-dark table-hover">
          <thead>
            <tr>
              <th>Planet</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {miningAreas &&
              miningAreas.map((planet, index) => (
                <tr key={index} onClick={() => zoomToPlanet(planetsRef.current[index])}>
                  <td>{planet.name}</td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        zoomToPlanet(planetsRef.current[index]);
                      }}
                    >
                      Select
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        {isFocused && (
          <button className="btn btn-secondary mt-3" onClick={resetView}>
            Back
          </button>
        )}
      </div>
      <div id="planet-info" className="mt-3"></div>
    </CContainer>
  );
};

export default LandingPage;
