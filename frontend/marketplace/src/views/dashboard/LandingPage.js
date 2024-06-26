import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import axios from '../../axios_interceptor';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import gsap from 'gsap';
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

import {
  CContainer,
  CRow,
  CCol,
  CSpinner,
  CCard,
  CCardHeader,
  CCardBody,
  CFormInput,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CPagination,
  CButton
} from '@coreui/react';

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
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2;
  const [imagepath, setImagePath] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/miningareas`);
        setMiningAreas(response.data.miningAreas);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
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
        const blurMaterial = new THREE.MeshBasicMaterial({ color: 0x333333, opacity: 0.5, transparent: true });
        const planet = new THREE.Mesh(geometry, material);
        const blurOverlay = new THREE.Mesh(geometry, blurMaterial);

        const distance = (index + 1) * 10;
        planet.position.x = distance;
        blurOverlay.position.x = distance;
        planet.userData = { id: _id, name, distance, description, products: data.products };

        planets.push(planet);
        scene.add(planet);
        scene.add(blurOverlay);

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
    const products = await fetchProductData(planet.userData.id);
    const Iresponse = await axios.get(`${BASE_URL}/api/miningareas/${planet.userData.id}`);
    const img = Iresponse.data.image;
    const imagepath = `src/assets/images/planets_textures/${img}`;
    
    setImagePath(imagepath);
    console.log(imagepath);
    setProductData(products);

    // Smooth camera movement
    gsap.to(cameraRef.current.position, {
      duration: 2,
      x: planet.position.x + 10,
      y: planet.position.y + 10,
      z: planet.position.z + 5,
      onUpdate: () => {
        controlsRef.current.target.copy(planet.position);
      },
      onComplete: () => {
        controlsRef.current.update();
      }
    });
  };

  const fetchProductData = async (planetId) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/miningareas/${planetId}/products`);
      return response.data.products;
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
    gsap.to(camera.position, {
      duration: 2,
      x: 0,
      y: 10,
      z: 70,
      onUpdate: () => {
        controls.target.set(0, 0, 0);
      },
      onComplete: () => {
        controls.update();
      }
    });
  };

  const filteredProducts = productData.filter(product => 
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleNextPage = () => {
    if (currentPage < Math.ceil(filteredProducts.length / itemsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (loading) {
    return (
      <CContainer className="text-center">
        <CSpinner color="primary" style={{ width: '3rem', height: '3rem' }} />
      </CContainer>
    );
  }

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
                    <CButton
                      type="button"
                      color="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        zoomToPlanet(planetsRef.current[index]);
                      }}
                    >
                      Select
                    </CButton>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        {isFocused && (
          <CButton className="mt-3" color="secondary" onClick={resetView}>
            Back
          </CButton>
        )}
      </div>

      {selectedPlanet && (
        <CCard style={{ width: '40%', position: 'absolute', right: "58%", bottom: '10%', marginTop: '400px' }}>
          <CCardHeader>
            <CFormInput
              type="text"
              placeholder="Search by Code and Description"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </CCardHeader>
          <CCardBody>
            <strong>{selectedPlanet.userData.name}</strong>
            <p>{selectedPlanet.userData.description}</p>
            <CTable hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Code</CTableHeaderCell>
                  <CTableHeaderCell>Description</CTableHeaderCell>
                  <CTableHeaderCell>Price</CTableHeaderCell>
                  <CTableHeaderCell>Quantity</CTableHeaderCell>
                  <CTableHeaderCell>Action</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {currentProducts.map(product => (
                  <CTableRow key={product.code}>
                    <CTableDataCell>{product.code}</CTableDataCell>
                    <CTableDataCell>{product.description}</CTableDataCell>
                    <CTableDataCell>{product.price}</CTableDataCell>
                    <CTableDataCell>{product.quantity}</CTableDataCell>
                    <CTableDataCell><button type="button" className="btn btn-primary mr-2">Buy</button></CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
            <div className="d-flex justify-content-between mt-3">
              <CButton color="primary" onClick={handlePrevPage} disabled={currentPage === 1}>
                Previous
              </CButton>
              <CPagination
                activePage={currentPage}
                pages={Math.ceil(filteredProducts.length / itemsPerPage)}
                onActivePageChange={setCurrentPage}
              />
              <CButton color="primary" onClick={handleNextPage} disabled={currentPage === Math.ceil(filteredProducts.length / itemsPerPage)}>
                Next
              </CButton>
            </div>
          </CCardBody>
        </CCard>
      )}
    </CContainer>
  );
};

export default LandingPage;
