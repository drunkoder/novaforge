import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry'
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
import CIcon from "@coreui/icons-react";
import { cilCart, cilLemon, cilX } from '@coreui/icons';
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
  CButton,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CFormLabel,
  CToaster,
  CToast,
  CToastHeader,
  CToastBody
} from '@coreui/react';
import { getUserFromSession, updateUserWalletSession } from '../../UserSession';
import PlanetSelector from './PlanetSelector';
import TimelinePlanetSelector from './TimelinePlanetSelector';

const LandingPage = () => {
  const mountRef = useRef(null);
  const planetsRef = useRef([]);
  const labelsRef = useRef([]);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const rendererRef = useRef(null);
  const planetsTimelineRef = useRef(null);

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
  const [purchaseModal, setPurchaseModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', color: '' });
  const [planetTimeline, setPlanetTimeline] = useState(null);
  const [selectedDot, setSelectedDot] = useState(0); 
  
  //const [planetsTimelineRef, setPlanetsTimelineRef] = useState([]); 

  useEffect(() => {
    
}, [planetsTimelineRef]);

  const handleDotClick = (planet) => {
    //e.stopPropagation();
    setSelectedPlanet(planet);
    zoomToPlanet(planet);
    setCurrentPage(1);
  };

  const handleShowTimelineClick = (show) => {
    if(!show){
      resetView();
    }
    
  };

  const getPlanets = () => {
    return planetsTimelineRef.current;
  }

  const handleChangeQuantity = (e) => {
      setQuantity(e.target.value);
  };

  const createPlanetLabel = (planet, text, font) => {
    const labelGeometry = new TextGeometry(text, {
      font: font,
      size: 1,
      depth: 0.1,
    });
    const labelMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const label = new THREE.Mesh(labelGeometry, labelMaterial);
    label.position.copy(planet.position);
    label.position.y += 2; 
    planet.userData.label = label;
    return label;
  };
  

  const handleMouseDown = (event) => {
    event.preventDefault();
    document.body.classList.add('planetarium-panning-cursor');
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);

    const intersects = raycaster.intersectObjects(planetsRef.current, true);
    if (intersects.length > 0) {
      const selectedPlanet = intersects[0].object;
      zoomToPlanet(selectedPlanet);
    }
  };


  const handleMouseMove = (event) => {
    event.preventDefault();
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);

    const intersects = raycaster.intersectObjects(planetsRef.current, true);
    if (intersects.length > 0) {
      const selectedPlanet = intersects[0].object;
      stopPlanetMovement(selectedPlanet);
      highlightPlanet(selectedPlanet);
    } else {
      resumeAllPlanetMovement();
      removeHighlight();
    }
  };

  const handleMouseUp = () => {
    event.preventDefault();
    document.body.classList.remove('planetarium-panning-cursor');
    window.removeEventListener('mousemove', handleMouseMove);
  };

  const handleMouseOut = () => {
    removeHighlight();
    window.addEventListener('mousemove', handleMouseMove);
  };
  
  const highlightPlanet = (planet) => {
    planet.material.color.set(0x9c8bf2);
  };
  
  const removeHighlight = () => {
    planetsRef.current.forEach((planet) => {
      planet.material.color.set(0xffffff);
    });
  };

  useEffect(() => {
    const loggedInUser = getUserFromSession();
    setUser(loggedInUser);
}, []);

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
  });

  useEffect(() => {
    if (!miningAreas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 70;
    camera.position.y = 10;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(mountRef.current.offsetWidth, mountRef.current.offsetHeight);
    renderer.domElement.id = 'planetariumCanvas';

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
    const labels = [];
    const planetData = [];
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

        // // listen to a click event on the planet
        // planet.addEventListener('click', () => {
        //   console.log('planet is clicked', planet);
        //   zoomToPlanet(planet);
        // });
        
        const distance = (index + 1) * 10;
        planet.position.x = distance;
        blurOverlay.position.x = distance;
        planet.userData = { id: _id, name, distance, description, products: data.products };

        if(!planetsTimelineRef.current) planetsTimelineRef.current = [];
        if (!planetsTimelineRef.current.some(p => p.userData.id === planet.userData.id)) {
          planetsTimelineRef.current.push(planet);
        }

        planets.push(planet);
        scene.add(planet);
        //scene.add(blurOverlay);

        const fontLoader = new FontLoader();
        fontLoader.load('/node_modules/three/examples/fonts/helvetiker_regular.typeface.json', (font) => {
          const label = createPlanetLabel(planet, planet.userData.name, font);
          if(label){
            scene.add(label);
            labels.push(label);
          }
        });

        const orbitGeometry = new THREE.RingGeometry(distance - 0.1, distance + 0.1, 64);
        const orbitMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
        const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
        orbit.rotation.x = Math.PI / 2;
        scene.add(orbit);
      });

      planetsRef.current = planets;
      labelsRef.current = labels;
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

    // const fontLoader = new FontLoader();
    // let planetLabels = [];

    // const loadFont = () => {
    //   fontLoader.load('https://cdn.jsdelivr.net/npm/three/examples/fonts/helvetiker_regular.typeface.json', (font) => {
    //     planetsRef.current.forEach((planet) => {
    //       const label = createPlanetLabel(planet.userData.name, font);
    //       planetLabels.push(label);
    //       scene.add(label);
    //     });
    //   });
    // };

    //loadFont(scene);

    const animate = () => {
      requestAnimationFrame(animate);

      planets.forEach((planet) => {
        if (!planet.userData.isHovered) {
          const distance = planet.userData.distance;
          planet.position.x = Math.cos(Date.now() * 0.000005 * distance) * distance;
          planet.position.z = Math.sin(Date.now() * 0.000005 * distance) * distance;

          // Update label position
          if(planet.userData.label && planet.userData.label.position){
            planet.userData.label.position.copy(planet.position);
            planet.userData.label.position.y += 2;
          }
        }
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

    const handleResize = (camera, renderer) => {
      // camera.aspect = mountRef.current.offsetWidth / mountRef.current.offsetHeight;
      // camera.updateProjectionMatrix();
      // renderer.setSize(mountRef.current.offsetWidth, mountRef.current.offsetHeight);

      console.log(mountRef.current);
      const width = mountRef.current.offsetWidth;
        const height = mountRef.current.offsetHeight;

        // Update camera aspect ratio and renderer size
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
        
        renderer.render(scene, camera);
    };
    
    const planetTimeline = miningAreas.map((planet, index) => (
      <div
        key={planet._id}
        className="planet-timeline-item"
        onClick={() => zoomToPlanet(planetsRef.current[index])}
      >
        <span className="planet-timeline-item-text">{planet.name}</span>
      </div>
    ));   
    
    setPlanetTimeline(planetTimeline);
    const canvas = document.getElementById('planetariumCanvas');

    window.addEventListener('resize', handleResize(camera, renderer));
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseout', handleMouseOut);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseout', handleMouseOut);

      mountRef.current?.removeChild(renderer.domElement);
    };
  }, [isFocused, selectedPlanet, miningAreas]);

  const stopPlanetMovement = (planet) => {
    planet.userData.isHovered = true;
  };
  
  const resumeAllPlanetMovement = () => {
    planetsRef.current.forEach((planet) => {
      planet.userData.isHovered = false;
    });
  };

  const zoomToPlanet2 = async (planet) => {
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
        if(planet)
          controlsRef.current.target.copy(planet.position);
      },
      onComplete: () => {
        controlsRef.current.update();
      }
    });
  };

  const zoomToPlanet = async (planet) => {
    setSelectedPlanet(planet);
    setIsFocused(true);
    
    controlsRef.current.target.copy(planet.position);
    controlsRef.current.update();
  
    const targetPosition = new THREE.Vector3().copy(planet.position).add(new THREE.Vector3(10, 10, 5)); 
    gsap.to(cameraRef.current.position, {
      duration: 2,
      x: targetPosition.x,
      y: targetPosition.y,
      z: targetPosition.z,
      onUpdate: () => {
        if(planet)
          controlsRef.current.target.copy(planet.position);
      },
      onComplete: () => {
        controlsRef.current.update();
      }
    });
  
    if (planet.userData.label) {
      planet.userData.label.visible = true;
    }

    
    window.removeEventListener('mousemove', handleMouseMove);
    const products = await fetchProductData(planet.userData.id);
    //const Iresponse = await axios.get(`${BASE_URL}/api/miningareas/${planet.userData.id}`);
    //const img = Iresponse.data.image;
    
    setProductData(products);

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

    const handleBuy = async (quantity) => {
      if(selectedProduct && selectedProduct.product_id){
      try {
          if(quantity > 0){
            if(quantity > selectedProduct.quantity){
              showToast('Quantity exceeded the available quantity', 'danger');
              return;
            }

            const response = await axios.post(`${BASE_URL}/api/planetarium/${user.id}/buy`, { miningAreaId: selectedProduct.mining_area_id, productId: selectedProduct.product_id, quantity: quantity });
            if (response.status === 200) {
                setCurrentPage(1);
                showToast('You have successfully purchase the product!', 'success');
                updateUserWalletSession(selectedProduct?.price * quantity);

                // Update product table
                const products = await fetchProductData(selectedPlanet.userData.id);
                setProductData(products);
                closePurchaseModal();
            } else {
                throw new Error('Invalid response from server');
            }
        }else{
          showToast('Quantity must be greater than zero.', 'danger');
        }
      } catch (error) {
          console.error('Error with purchase product:', error);
          showToast(error.response ? error.response.data.message : error.message, 'danger');
      }
    }
  };

    const openPurchaseModal = product => {
      setSelectedProduct(product);
      setPurchaseModal(true);
    };

    const closePurchaseModal = () => {
      setSelectedProduct(null);
      setPurchaseModal(false);
  };

  const showToast = (message, color) => {
    setToast({ show: true, message, color });
    setTimeout(() => {
        setToast({ show: false, message: '', color: '' });
    }, 3000);
  };

  if (loading) {
    return (
      <CContainer className="text-center">
        <CSpinner color="primary" style={{ width: '3rem', height: '3rem' }} />
      </CContainer>
    );
  }

  return (
    <><CContainer>
      <CToaster position="top-end" className="position-fixed top-0 end-0 p-3">
        {toast.show && (
          <CToast autohide={true} visible={true} color={toast.color} className="text-white align-items-center">
            <CToastHeader closeButton>{toast.color === 'success' ? 'Success' : 'Error'}</CToastHeader>
            <CToastBody>{toast.message}</CToastBody>
          </CToast>
        )}
      </CToaster>
      <CRow>
        <CCol>
          <div ref={mountRef} className="canvas-container" style={{ width: '100%', height: '100vh' }} ></div>
        </CCol>
      </CRow>

      {/* <div id="planet-table" className="mt-3">
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
    </div> */}
      {selectedPlanet && (
        <CCard className='planetarium-products-table'>
          <CCardHeader>
            
          <div className='float-right mb-1'>
            <CButton color="danger" onClick={resetView} size="sm">
              <CIcon icon={cilX}/>
            </CButton>
          </div>
          <div>
          <strong>{selectedPlanet.userData.name}</strong>
          <p><small className="text-body-secondary">{selectedPlanet.userData.description}</small></p>
          {/* <p>{selectedPlanet.userData.description}</p> */}
          </div>
          <div>
            <CFormInput
              type="text"
              placeholder="Search by Code and Description"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          </CCardHeader>
          <CCardBody>
            
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
                {currentProducts?.filter(product => product.quantity > 0).map(product => (
                  <CTableRow key={product.code}>
                    <CTableDataCell>{product.code}</CTableDataCell>
                    <CTableDataCell>{product.description}</CTableDataCell>
                    <CTableDataCell>{product.price}</CTableDataCell>
                    <CTableDataCell>{product.quantity}</CTableDataCell>
                    <CTableDataCell>
                      <CButton color="primary" size="sm" className=" mr-2 text-center planetarium-product-btn-buy" disabled={product.quantity < 1} onClick={(e) => { e.preventDefault(); openPurchaseModal(product); } }>
                        <CIcon icon={cilCart} className="me-1" />
                        Buy
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
            <div className="d-flex justify-content-between mt-3">
              <CButton color="primary" size="sm" onClick={handlePrevPage} disabled={currentPage === 1}>
                Previous
              </CButton>
              <CPagination
                active={currentPage}
                pages={Math.ceil(filteredProducts.length / itemsPerPage)}
                onClick={setCurrentPage} />
              <CButton color="primary" size="sm" onClick={handleNextPage} disabled={currentPage === Math.ceil(filteredProducts.length / itemsPerPage)}>
                Next
              </CButton>
            </div>

            <CModal visible={purchaseModal} backdrop="static" onClose={closePurchaseModal}>
              <CModalHeader closeButton>Purchase Product</CModalHeader>
              <CModalBody>
                <p>You are about to purchase {selectedProduct?.name} for <b>{selectedProduct?.price}</b> coins per piece.</p>
                <div className="mb-3">
                  <CFormLabel htmlFor="quantity">Quantity:</CFormLabel>
                  <CFormInput
                    type="number"
                    id="quantity"
                    name="quantity"
                    value={quantity}
                    onChange={handleChangeQuantity} />
                </div>
                <p>Total cost: {selectedProduct?.price * quantity} coins</p>
                <p>Do you wish to proceed?</p>
              </CModalBody>
              <CModalFooter>
                <CButton color="warning" onClick={() => { handleBuy(quantity); } }>Buy</CButton>
                <CButton color="secondary" onClick={closePurchaseModal}>Cancel</CButton>
              </CModalFooter>
            </CModal>
          </CCardBody>
        </CCard>
      )}
    </CContainer>
      <div id="planet-table" className="mt-3">
        {/* <PlanetSelector startPlanet={2000} planetCount={100} /> */}
        <TimelinePlanetSelector planets={planetsTimelineRef.current} selectedPlanet={selectedPlanet} onDotClick={handleDotClick} showTimelineClick={handleShowTimelineClick} getPlanets={getPlanets} />
      </div></>
  );
};

export default LandingPage;
