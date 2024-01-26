import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import { Offcanvas, Card, Row, Col, CardBody, ListGroup, Spinner } from 'react-bootstrap';
import { Login, Register } from './auth';

export const CustomNavbar = () => {
  const [showAboutModal, setShowAboutModal] = useState(false);

  const openAboutModal = () => {
    setShowAboutModal(true);
  };

  const closeModal = () => {
    setShowAboutModal(false);
  };

  return (  
    <div>
      <Navbar bg="light" text="white" expand="lg" sticky="top">
        <Container fluid>
          <Navbar.Brand className="d-flex align-items-center">
            <img src="/bdmc-logo.svg" 
            width="50" height="50" 
            className='d-inline-block align-top'/>
            <div className="ml-3">
              <div className="font-weight-bold">Butuan Diagnostic and</div>
              <div className="font-weight-bold">Medical Clinic</div>
            </div>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav"  className="justify-content-end">
              <Nav>
                <Nav.Link as={Link} to="/">Home</Nav.Link>
                <Nav.Link as={Link} to="/services">Services</Nav.Link>
                <Nav.Link as={Link} to="/physicians">Physicians</Nav.Link>
                <Nav.Link onClick={openAboutModal}>About Us</Nav.Link>
              </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <About show={showAboutModal} onHide={closeModal} />
    </div>
  );
}

export const Footer = () => {
  return (
    <footer className='bg-dark text-light py-3'>
      <Container className='text-center'>
        <h5 className='mt-3 mb-4'>Butuan Diagnostic and Medical Clinic</h5>
        <p>R. Calo Street, Butuan City</p>
        <p>Tel No.# (085) 342-1794</p>
        <p className='mt-4 mb-4'>Copyright © 2024 Butuan Diagnostic and Medical Clinic - All Rights Reserved.</p>
      </Container>
    </footer>
  );
}

export const Home = () => {
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const isAdmin = window.localStorage.getItem('isAdmin');
  const isLoggedIn = window.localStorage.getItem('isLoggedIn');
  const navigate = useNavigate();
  const maintenance = useState(true);

  useEffect(() => {
    if(isLoggedIn) {
      if(isAdmin) {
        navigate('/admin-dashboard');
      } else {
        navigate('/user-dashboard');
      }
    }
  });

  if (maintenance)
  {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Row>
          <Col className="d-flex align-items-center">
            <Spinner animation="border" role="status" className="me-2">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <h2 className='mt-2'>Maintenance...</h2>
          </Col>
        </Row>
      </div>
    )
  }

  const openRegisterModal = () => {
    setShowRegisterModal(true);
  };

  const closeModal = () => {
    setShowRegisterModal(false);
  };

  return (
    <div>
      <CustomNavbar/>
      <Container className="d-flex justify-content-center align-items-center vh-100">
        <Row>
          <Col>
            <div className='text-center'>
              <h1>Butuan Diagnostic and Medical Clinic Portal</h1>
              <p>Book an appointment with us, today!</p>
            </div>
          </Col>
          <Col>
            <Login/>
            <Card className='mt-3 mx-auto' style={{ maxWidth: '400px' }}>
              <CardBody>
                <div className="text-center">
                  <Nav.Link onClick={openRegisterModal}>Click here to Register</Nav.Link>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
      <Footer/>
      <Register show={showRegisterModal} onHide={closeModal} />
    </div>
  );
};

export const Services = () => {
  const servicesLaboratoryList = [
    'BUN',
    'CBC AUTOMATED',
    'CHOLESTEROL',
    'CREATININE',
    'CT/BT',
    'DRUG TEST',
    'ECG',
    'ESR',
    'FBS',
    'HBA1C',
    'HEMOGLOBIN',
    'HEPATITIS A',
    'HEPATITIS B',
    'HEPATITIS C',
    'HIV',
    'LIPID PROFILE',
    'NA, K, CL',
    'PAPS SMEAR',
    'SGOT',
    'STOOL',
    'THYROID PANEL',
    'URIC ACID',
    'URINALYSIS',
    'VDRL',
    'X-RAY',
    '75 Grams OGTT',
    'BLOOD OCCULT',
    'DENGUE DOU',
    'RAPID ANTIGEN',
    'RAPID ANTIBODY',
    'RT-PCR',
  ];
  const servicesUltrasoundsList = [
    'HBT (HEPATO BILIARY TREE)',
    'KIDNEY URINARY BLADDER',
    'KUB/PROSTATE',
    'LOWER ABDOMEN',
    'PELVIC ULTRASOUND',
    'PROSTATE ULATRASOUND',
    'TRANVAGINAL ULTRASOUND',
    'UPPER ABDOMEN',
    'WHOLE ABDOMEN',
    'ADDITIONAL ORGAN (PER ORGAN)',
  ];
  const servicesExecutiveAList = [
    'FASTING BLOOD SUGAR',
    'LIVER PROFILE (SGOT, SPGT, ALK. PHOSPHATE)',
    'LIPID PROFILE (Total Cholesterol, Triglycerides, LDL, HDL)',
    'KIDNEY FUNCTION TEST (Creatinine)',
    'BLOOD URIC ACID',
    'COMPLETE BLOOD COUNT',
    'HEPATITIS-B',
    'URINALYSIS',
  ];
  const servicesExecutiveBList = [
    'FASTING BLOOD SUGAR',
    'LIVER PROFILE (SGOT, SPGT)',
    'LIPID PROFILE (Total Cholesterol, Triglycerides, LDL, HDL)',
    'KIDNEY FUNCTION TEST (Creatinine)',
    'BLOOD URIC ACID',
    'COMPLETE BLOOD COUNT',
    'URINALYSIS',
  ];
  const servicesExecutiveCList = [
    'FASTING BLOOD SUGAR',
    'BLOOD TYPING WITH RH',
    'KIDNEY FUNCTION TEST (Creatinine)',
    'TOTAL CHOLESTEROL',
    'BLOOD URIC ACID',
    'COMPLETE BLOOD COUNT',
    'URINALYSIS',
  ];

  return (
    <div>
      <CustomNavbar />
      <Container>
        <h2 className='text-center mt-3'>Services</h2>
        <Row className='mt-3 mb-3'>
          <Col>
            <h5 className='text-center'>Executive Check Up - A</h5>
            <ListGroup>
              {servicesExecutiveAList.map((service, index) => (
                <ListGroup.Item key={index}>{service}</ListGroup.Item>
              ))}
            </ListGroup>
          </Col>
          <Col>
            <h5 className='text-center'>Executive Check Up - B</h5>
            <ListGroup>
              {servicesExecutiveBList.map((service, index) => (
                <ListGroup.Item key={index}>{service}</ListGroup.Item>
              ))}
            </ListGroup>
          </Col>
          <Col>
            <h5 className='text-center'>Executive Check Up - C</h5>
            <ListGroup>
              {servicesExecutiveCList.map((service, index) => (
                <ListGroup.Item key={index}>{service}</ListGroup.Item>
              ))}
            </ListGroup>
          </Col>
        </Row>
        <Row className='mt-3 mb-3'>
          <Col>
            <h5 className='text-center mb-2'>Laboratory Test</h5>
            <ListGroup>
              {servicesLaboratoryList.map((service, index) => (
                <ListGroup.Item key={index}>{service}</ListGroup.Item>
              ))}
            </ListGroup>  
          </Col>
          <Col>
            <h5 className='text-center mb-2'>Ultrasounds</h5>
            <ListGroup>
              {servicesUltrasoundsList.map((service, index) => (
                <ListGroup.Item key={index}>{service}</ListGroup.Item>
              ))}
            </ListGroup>
          </Col>
        </Row>
      </Container>
      <Footer/>
    </div>
  )
}

export const Physicians = () => {
  return (
    <div>
      <CustomNavbar />
      <Container>
        <h2 className='text-center mt-3'>Physicians</h2>
        <Row className='mt-4 mb-5'>
          <Col>
            <h5 className='text-center mt-2 mb-3'>BAYOTOLOGY</h5>
            <ListGroup>
              <ListGroup.Item>CON-UI, Francis Bernard, MD</ListGroup.Item>
              <ListGroup.Item>AZARCON, Christian Joseph, MD</ListGroup.Item>
              <ListGroup.Item>MONTENEGTRO, Lance, MD</ListGroup.Item>
              <ListGroup.Item>QUILLANO, Aldrin B., MD</ListGroup.Item>
              <ListGroup.Item>ORBOC, Hyram, MD</ListGroup.Item>
            </ListGroup>
          </Col>
          <Col>
            <h5 className='text-center mt-2 mb-3'>OB - GYNE</h5>
            <ListGroup>
              
              <ListGroup.Item>ABAO, Rechelyn, MD</ListGroup.Item>
            </ListGroup>
          </Col>
          <Col>
            <h5 className='text-center mt-2 mb-3'>GENERAL SURGERY</h5>
            <ListGroup>
              <ListGroup.Item>BERDERA, El Bern S., MD</ListGroup.Item>
            </ListGroup>
          </Col>
        </Row>
      </Container>
      <Footer/>
    </div>
  )
}

const About = ({show, onHide}) => {
  return (
    <Offcanvas show={show} onHide={onHide} placement='end'>
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>About Us</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body style={{ textAlign: 'justify' }}>
        <strong>Butuan Diagnostic and Medical Clinic </strong>
          is a leading healthcare facility committed to providing comprehensive and quality medical services to the community of Butuan City and its surrounding areas. With a dedicated team of highly skilled healthcare professionals, state-of-the-art medical equipment, and a patient-centered approach, we strive to deliver the highest standard of care. Our clinic is equipped to handle a wide range of medical services, including diagnostic tests, preventive care, consultations, and specialized treatments. At Butuan Diagnostic and Medical Clinic, we prioritize the well-being of our patients, ensuring a compassionate and supportive environment. We are proud to be a trusted healthcare provider, fostering a commitment to excellence in healthcare delivery and contributing to the overall health and wellness of the community.
      </Offcanvas.Body>
    </Offcanvas>
  );
};