import React, { useEffect, useState} from 'react';
import { Logout } from './auth';
import { Container, Modal, Navbar, Nav, Col, Row, Tab, Form, InputGroup, Button, Card, CardBody, CardGroup, CardHeader, CardFooter, Spinner } from 'react-bootstrap';
import { db } from '../config/firebase';
import { useNavigate } from 'react-router-dom';
import { getDocs, getDoc, collection, deleteDoc, updateDoc, doc, query, where, orderBy} from 'firebase/firestore'
import { getAuth,
    onAuthStateChanged, updatePassword, updateEmail } from 'firebase/auth';
import { Footer } from './home';
import { GenericModal } from './utilities';

export const UserNavBar = () => {
  return (
    <div>
      <Navbar bg="light" expand="lg" sticky="top">
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
                <Logout/>
              </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </div>
  );
};

export const UserDashboard = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRef, setUserRef] = useState(null);
  const [patientRef, setPatientRef] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const isAdmin = window.localStorage.getItem('isAdmin');

  useEffect(() => {
    const auth = getAuth();
    try {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        setCurrentUser(user);
  
        if (!user) {
          navigate('/');
        } else if (isAdmin) {
          navigate('/admin-dashboard');
        } else {
          await checkUserRole(user.uid);
  
          const userDocRef = doc(db, 'users', user.uid);
          const patientDocRef = doc(db, 'patients', user.uid);
  
          setUserRef(userDocRef);
          setPatientRef(patientDocRef);
  
          setLoading(false);
        }
      });
  
      return () => unsubscribe();
    } catch (errr) {
      console.error(errr);
      setLoading(false);
    }
  }, [navigate]);

  const checkUserRole = async (userId) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();

        if (userData.user_Role !== 'Patient') {
          
          navigate('/');
        }
      }
    } catch (error) {
      console.error('Error checking user role:', error);
    }
  };
  
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Row>
          <Col className="d-flex align-items-center">
            <Spinner animation="border" role="status" className="me-2">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <h2 className='mt-2'>Loading...</h2>
          </Col>
        </Row>
      </div>
    );
  }

  return (
    <div>
      <UserNavBar/>
      <Tab.Container id="left-tabs" defaultActiveKey="first" fill>
        <Row>
          <Col sm={2}>
              <Nav variant="pills" className="flex-column">
                <Nav.Item className='mt-3 mb-1'>
                  <Nav.Link eventKey="first">Profile</Nav.Link>
                </Nav.Item>
                <Nav.Item className='mt-1 mb-1'>
                  <Nav.Link eventKey="second">Appointment</Nav.Link>
                </Nav.Item>
                <Nav.Item className='mt-1 mb-3'>
                  <Nav.Link eventKey="third">Settings</Nav.Link>
                </Nav.Item>
              </Nav>
          </Col>
          <Col sm={10} className='bg-secondary'>
            <Tab.Content>
              <Tab.Pane eventKey="first">
                <UserProfile 
                  currentUser={currentUser}
                  userRef={userRef} 
                  patientRef={patientRef}
                />
              </Tab.Pane>
              <Tab.Pane eventKey="second"><UserAppointment/></Tab.Pane>
              <Tab.Pane eventKey="third">
                <UserSetting 
                  currentUser={currentUser}
                  userRef={userRef} 
                  patientRef={patientRef}
                />
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
      <Footer/>
    </div>
  );
};

const UserProfile = ({ currentUser, userRef, patientRef }) => {
  const [userData, setUserData] = useState(null);
  const [patientData, setPatientData] = useState(null);

  const fetchUserData = async () => {
    try {
      if (currentUser) {
        const userDocSnap = await getDoc(userRef);
        const patientDocSnap = await getDoc(patientRef);

        setUserData(userDocSnap.data());
        setPatientData(patientDocSnap.data());
      }
    }
    catch (errr) {
      console.error(errr);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [currentUser]);

  return (
    <Container className='mt-3 mb-3'>
      {userData && (
        <CardGroup>
          <Card>
            <CardHeader>
              <h4 className='mt-2'>Personal Information</h4>
            </CardHeader>
            <CardBody>
              <p><strong>Name:</strong> {userData.user_FirstName} {userData.user_MiddleName} {userData.user_LastName}</p>
              {patientData && (
                <>
                  <p><strong>Gender:</strong> {patientData.patient_Gender}</p>
                  <p><strong>Birthday:</strong> {patientData.patient_DateOfBirth}</p>
                </>
              )}
              <p><strong>Address:</strong> {userData.user_Address}</p>
            </CardBody>
          </Card>
          <Card>
            <CardHeader>
              <h4 className='mt-2'>Contact Information</h4>
            </CardHeader>
            <CardBody>
                  <p><strong>Email:</strong> {userData.user_Email}</p>
                  <p><strong>Phone:</strong> {userData.user_MobileNumber}</p>
            </CardBody>
          </Card>
        </CardGroup>
      )}
    </Container>
  );
};

const UserAppointment = () => {
  const [appointmentType, setAppointmentType] = useState("");
  const [serviceData, setServiceData] = useState(null);
  const [appointmentHistory, setAppointmentHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const fetchAppointmentHistory = async () => {
          try {
            const historyQuery = query(
              collection(db, 'appointment'),
              where('appointment_PatientID', '==', user.uid),
              orderBy('appointment_Date', 'desc')
            );
  
            const historySnapshot = await getDocs(historyQuery);
            const appointments = historySnapshot.docs.map((doc) => doc.data());
  
            const staffPromises = appointments.map(async (appointment) => {
              if (appointment.appointment_DoctorID) {
                const staffRef = doc(db, "users", appointment.appointment_DoctorID);
                const staffDocSnap = await getDoc(staffRef);
        
                if (staffDocSnap.exists()) {
                  const staffData = staffDocSnap.data();

                  if (staffData.user_Role === "Staff" || staffData.user_Role === "Doctor") {
                    return staffData;
                  }
                }
              }
              return null;
            });
  
            const staffData = await Promise.all(staffPromises);
  
            setAppointmentHistory(appointments.map((appointment, index) => ({
              ...appointment,
              staffData: staffData[index],
            })));
          } catch (error) {
            console.error('Error fetching appointment history:', error);
          } finally {
            setLoading(false);
          }
        };

        fetchAppointmentHistory();
      }
    });

    const fetchServiceData = async () => {
      try {        
        const servicesRef = collection(db, 'services');
        const servicesSnapshot = await getDocs(servicesRef);

        const services = servicesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setServiceData(services);
      } catch (error) {
        console.error('Error fetching service data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServiceData();

    return () => unsubscribe();
  }, []);

  const handleAppointmentType = (event) => {
    setAppointmentType(event.target.value);
  };

  return (
    <div>
      <Container className='mt-3 mb-3'>
        <CardGroup>
          <Card>
            <CardHeader>
              <h2 className='mt-2'>Appointment Form</h2>
            </CardHeader>
            <CardBody>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Appointment Type</Form.Label>
                  <Form.Control className='mb-3' as="select" value={appointmentType} onChange={handleAppointmentType}>
                    <option>Select</option>
                    <option value="Check Up A">Executive Check Up A</option>
                    <option value="Check Up B">Executive Check Up B</option>
                    <option value="Check Up C">Executive Check Up C</option>
                    <option value="Laboratory Test">Laboratory Test</option>
                    <option value="Ultrasounds">Ultrasounds</option>
                  </Form.Control>
                  {appointmentType === "Laboratory Test" && (
                    <Form.Control className='mb-3' as="select">
                      {serviceData
                        .filter((service) => service.service_Category === "Laboratory Test")
                        .map((service) => (
                          <option key={service.id} value={service.id}>
                            {service.service_Name}
                          </option>
                        ))}
                    </Form.Control>
                  )}
                  {appointmentType === "Ultrasounds" && (
                    <Form.Control className='mb-3' as="select">
                      {serviceData
                        .filter((service) => service.service_Category === "Ultrasounds")
                        .map((service) => (
                          <option key={service.id} value={service.id}>
                            {service.service_Name}
                          </option>
                        ))}
                    </Form.Control>
                  )}
                  <Form.Label>Additional Comment</Form.Label>
                  <Form.Control as="textarea" rows={3}/>
                </Form.Group>
              </Form>
              <div className="d-flex justify-content-center align-items-center">
                <Button variant="primary" type="submit">
                  Submit
                </Button>
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardHeader>
              <h2 className='text-center mt-2'>Appointment History</h2>
            </CardHeader>
            <CardBody className="overflow-auto" style={{ maxHeight: '350px' }}>
              {loading ? (
                <p>Loading...</p>
              ) : appointmentHistory !== null ? (
                appointmentHistory.map((appointment) => (
                  <Card key={appointment.id} className='mb-3'>
                    <CardHeader>
                      <div className='mt-2'>
                        <h6><strong>Date: </strong>{appointment.appointment_Date}</h6>
                        <h6><strong>Time: </strong>{appointment.appointment_Time}</h6>
                      </div>
                    </CardHeader>
                    <CardBody>
                    {serviceData
                    .filter((service) => service.id === appointment.appointment_ServiceID)
                    .map((service) => (
                      <div key={`service-${service.id}`}>
                        <h6><strong>Service: </strong>{service.service_Name}</h6>
                      </div>
                    ))}
                      <h6><strong>Additional Comment: </strong></h6>
                      <p>{appointment.appointment_Comment}</p>
                    </CardBody>
                    <CardFooter>
                      <div className='mt-2'>
                        {appointment.appointment_DoctorID && (
                          <>
                            <h6><strong>Doctor: </strong>
                              {appointment.staffData ? (
                                `${appointment.staffData.user_FirstName} ${appointment.staffData.user_MiddleName} ${appointment.staffData.user_LastName}`
                              ) : (
                                'Unknown Doctor'
                              )}
                            </h6>
                          </>
                        )}
                      </div>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <p className='text-center'>No appointment history available.</p>
              )}
            </CardBody>
          </Card>
        </CardGroup>
      </Container>
    </div>
  );
};

const UserSetting = ({ currentUser, userRef, patientRef }) => {
  const [validated, setValidated] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [birthday, setBirthday] = useState("");
  const [gender, setGender] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [oldEmail, setOldEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const navigate = useNavigate();

  const fetchDataForNavItem = async (navItem) => {
    if (navItem === "fourth") {
      const userSnapshot = await getDoc(userRef);
      const patientSnapshot = await getDoc(patientRef);

      if (userSnapshot.exists() && patientSnapshot.exists()) {
        const userData = userSnapshot.data();
        const patientData = patientSnapshot.data();

        setFirstName(userData.user_FirstName || "");
        setMiddleName(userData.user_MiddleName || "");
        setLastName(userData.user_LastName || "");
        setAddress(userData.user_Address || "");
        setBirthday(patientData.patient_DateOfBirth || "");
        setGender(patientData.patient_Gender || "");
      }
    } else if (navItem === "fifth") {
      const userSnapshot = await getDoc(userRef);

      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();

        setMobileNumber(userData.user_MobileNumber || "");
        setOldEmail(userData.user_Email || "");
      }
    }
  };

  const handleNavItemClick = (navItem) => {
    fetchDataForNavItem(navItem);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  }

  const handlePersonal = async (e) => {
    e.preventDefault();

    setValidated(true);
    const form = e.currentTarget;

    if (form.checkValidity() === false) {
      e.stopPropagation();
      return;
    }

    try {
      const userDoc = doc(db, "users", currentUser.uid);
      const patientDoc = doc(db, "patients", currentUser.uid);

      const userSnapshot = await getDoc(userDoc);
      const patientSnapshot = await getDoc(patientDoc);

      if (
        userSnapshot.exists() &&
        patientSnapshot.exists() &&
        userSnapshot.data().user_FirstName === firstName &&
        userSnapshot.data().user_MiddleName === middleName &&
        userSnapshot.data().user_LastName === lastName &&
        userSnapshot.data().user_Address === address &&
        patientSnapshot.data().patient_DateOfBirth === birthday &&
        patientSnapshot.data().patient_Gender === gender
      ) {
        setShowModal(true);
        setModalTitle("No Change");
        setModalMessage("No changes have been made.");
        return;
      }

      await updateDoc(userDoc, {
        user_FirstName: firstName,
        user_MiddleName: middleName,
        user_LastName: lastName,
        user_Address: address,
      });

      await updateDoc(patientDoc, {
        patient_DateOfBirth: birthday,
        patient_Gender: gender,
      });

      setShowModal(true);
      setModalTitle("Success");
      setModalMessage("Your Personal Information has been updated.");
    }
    catch (errr) {
      console.error(errr);
    }
  };

  const handleContact = async (e) => {
    e.preventDefault();

    setValidated(true);
    const form = e.currentTarget;

    if (form.checkValidity() === false) {
      e.stopPropagation();
      return;
    }
    
    try {
      const userDoc = doc(db, "users", currentUser.uid);
      const userSnapshot = await getDoc(userDoc);

      if (
        userSnapshot.exists() &&
        userSnapshot.data().user_MobileNumber === mobileNumber
      ) {
        setShowModal(true);
        setModalTitle("No Change");
        setModalMessage("No changes have been made.");
        return;
      }

      if (oldEmail === newEmail) {
        await updateDoc(userDoc, {
          user_MobileNumber: mobileNumber,
        });
      }
      else {
        await updateDoc(userDoc, {
          user_Email: newEmail,
          user_MobileNumber: mobileNumber,
        });

        await updateEmail(currentUser, newEmail);
      }

      setShowModal(true);
      setModalTitle("Success");
      setModalMessage("Your Contact Information has been updated.");
    } catch (errr) {
      console.error(errr);
    }
  }

  const handlePassword = async (e) => {
    e.preventDefault();
    
    setValidated(true);
    const form = e.currentTarget;

    if (form.checkValidity() === false) {
      e.stopPropagation();
      return;
    }

    try {
      if (oldPassword === newPassword) {
        setShowModal(true);
        setModalTitle("Error");
        setModalMessage("Old and new passwords cannot be the same.");
        return;
      }
    
      try {
        const user = getAuth().currentUser;
    
        await updatePassword(user, newPassword);
    
        setShowModal(true);
        setModalTitle("Success");
        setModalMessage("Your Password has been updated.");
      } catch (error) {
        console.error(error);
        setShowModal(true);
        setModalTitle("Error");
        setModalMessage("Failed to update your password. Please try again.");
      }   
    } catch (errr) {
      console.error(errr);
    }
  };

  const handleDeletion = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (form.checkValidity() === false) {
      e.stopPropagation();
      return;
    }

    try {
      setShowDeleteModal(true);  
    } catch (errr) {
     console.error(errr);
    }
  };

  const handleCancelDeletion = () => {
    setShowDeleteModal(false);
  };

  const handleConfirmDeletion = async () => {
    setShowDeleteModal(false);
    
    try {
      const user = getAuth().currentUser;
      
      const userDoc = doc(db, "users", currentUser.uid);
      const patientDoc = doc(db, "patients", currentUser.uid);

      await deleteDoc(userDoc);
      await deleteDoc(patientDoc);
  
      const appointmentsQuery = query(collection(db, 'appointment'), where('appointment_PatientID', '==', currentUser.uid));
      const appointmentsData = await getDocs(appointmentsQuery);
      await Promise.all(appointmentsData.docs.map(async (appointmentDoc) => {
        const appointmentId = appointmentDoc.id;
        const appointmentRef = doc(db, 'appointment', appointmentId);
        await deleteDoc(appointmentRef);
      }));

      await user?.delete()
      setShowModal(true);
      setModalTitle("Success");
      setModalMessage("Your account has been deleted.");
      navigate('/');
    } catch (error) {
      console.error(error);
      setShowModal(true);
      setModalTitle("Warning");
      setModalMessage("Failed to delete your account. Please try again.");
    }
  };

  return (
    <div>
      <Container className='mt-3 mb-3'>
        <Card>
          <CardHeader>
            <h2 className='mt-2'>Update Information</h2>
          </CardHeader>
          <CardBody>
            <Tab.Container id="left-tabs-example" fill>
              <Row>
                <Col sm={2}>
                  <Nav variant="pills" className="flex-column">
                    <Nav.Item className='mt-2 mb-1'>
                      <Nav.Link eventKey="fourth" onClick={() => handleNavItemClick("fourth")}>Update Personal Information</Nav.Link>
                    </Nav.Item>
                    <Nav.Item className='mt-1 mb-1'>
                      <Nav.Link eventKey="fifth" onClick={() => handleNavItemClick("fifth")}>Update Contact Information</Nav.Link>
                    </Nav.Item>
                    <Nav.Item className='mt-1 mb-1'>
                      <Nav.Link eventKey="sixth" onClick={() => handleNavItemClick("sixth")}>Update Password</Nav.Link>
                    </Nav.Item>
                    <Nav.Item className='mt-1 mb-2'>
                      <Nav.Link eventKey="seventh" onClick={() => handleNavItemClick("seventh")}>Delete Account</Nav.Link>
                    </Nav.Item>
                  </Nav>
                </Col>
                <Col sm={10}>
                  <Tab.Content>
                    <Tab.Pane eventKey="fourth">
                      <Form noValidate validated={validated} onSubmit={handlePersonal}>
                        <Card>
                          <CardBody>
                            <Form.Group className="mb-3">
                              <InputGroup>
                                <InputGroup.Text>Full Name</InputGroup.Text>
                                <Form.Control type="text" placeholder="First Name" value={firstName} required onChange={(e) => setFirstName(e.target.value)}/>
                                <Form.Control type="text" placeholder="Middle Name" value={middleName} onChange={(e) => setMiddleName(e.target.value)}/>
                                <Form.Control type="text" placeholder="Last Name" value={lastName} required onChange={(e) => setLastName(e.target.value)}/>
                                <Form.Control.Feedback type="invalid">
                                  Please provide your First and Last Name (Middle Name is Optional).
                                </Form.Control.Feedback>
                              </InputGroup>
                            </Form.Group>
                            <Form.Group className="mb-3">
                              <Form.Control type="text" placeholder="Address" value={address} required onChange={(e) => setAddress(e.target.value)}/>
                              <Form.Control.Feedback type="invalid">
                                Please provide your address.
                              </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group className="mb-3">
                              <Row>
                                <Col>
                                <InputGroup>
                                  <InputGroup.Text>Birthday</InputGroup.Text>
                                  <Form.Control type="date" value={birthday} required onChange={(e) => setBirthday(e.target.value)}/>
                                  <Form.Control.Feedback type="invalid">
                                    Please provide your birthday.
                                  </Form.Control.Feedback>
                                </InputGroup>
                                </Col>
                                <Col>
                                  <InputGroup>
                                    <InputGroup.Text>Gender</InputGroup.Text>
                                    <Form.Select value={gender || ""} required onChange={(e) => setGender(e.target.value)}>
                                      <option type="invalid">Select</option>
                                      <option value="Male">Male</option>
                                      <option value="Female">Female</option>
                                      <option value="Other">Other</option>
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid">
                                      Please pick your gender.
                                    </Form.Control.Feedback>
                                  </InputGroup>
                                </Col>
                              </Row>
                            </Form.Group>
                          </CardBody>
                          <CardFooter>
                            <div className="d-flex justify-content-center align-items-center">
                              <Button variant="primary" type="input">
                                Update
                              </Button>
                            </div>
                          </CardFooter>
                        </Card>
                      </Form>
                    </Tab.Pane>
                    <Tab.Pane eventKey="fifth">
                      <Form noValidate validated={validated} onSubmit={handleContact}>
                      <Card>
                          <CardBody>
                            <Form.Group className="mb-3">
                              <Row>
                                <Col>
                                  <InputGroup>
                                    <InputGroup.Text>Mobile Number</InputGroup.Text>
                                    <Form.Control type="tel" placeholder="Mobile number" value={mobileNumber} required onChange={(e) => setMobileNumber(e.target.value)}/>
                                    <Form.Control.Feedback type="invalid">
                                      Please provide a new mobile number.
                                    </Form.Control.Feedback>
                                  </InputGroup>
                                </Col>
                              </Row>
                            </Form.Group>
                            <Form.Group className="mb-3">
                              <Form.Control type="email" placeholder="Old Email Address" value={oldEmail} required onChange={(e) => setOldEmail(e.target.value)}/>
                              <Form.Control.Feedback type="invalid">
                                Please provide your old email.
                              </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group className="mb-3">
                              <Form.Control type="email" placeholder="New Email Address" value={newEmail} required onChange={(e) => setNewEmail(e.target.value)}/>
                              <Form.Control.Feedback type="invalid">
                                Please provide a new email.
                              </Form.Control.Feedback>
                            </Form.Group>
                          </CardBody>
                          <CardFooter>
                            <div className="d-flex justify-content-center align-items-center">
                              <Button variant="primary" type="input">
                                Update
                              </Button>
                            </div>
                          </CardFooter>
                        </Card>
                      </Form>
                    </Tab.Pane>
                    <Tab.Pane eventKey="sixth">
                      <Form noValidate validated={validated} onSubmit={handlePassword}>
                        <Card>
                          <CardBody>
                            <Form.Group className="mb-3">                        
                              <Form.Control type="password" placeholder="Old Password" required onChange={(e) => setOldPassword(e.target.value)}/>
                              <Form.Control.Feedback type="invalid">
                                Please input your old password.
                              </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group className="mb-3" >                        
                              <Form.Control type="password" placeholder="New Password" required onChange={(e) => setNewPassword(e.target.value)}/>
                              <Form.Control.Feedback type="invalid">
                                Please provide a new password.
                              </Form.Control.Feedback>
                            </Form.Group>
                          </CardBody>
                          <CardFooter>
                            <div className="d-flex justify-content-center align-items-center">
                              <Button variant="primary" type="input">
                                Update Password
                              </Button>
                            </div> 
                          </CardFooter>
                        </Card>
                      </Form>
                    </Tab.Pane>
                    <Tab.Pane eventKey="seventh">
                      <Form noValidate validated={validated} onSubmit={handleDeletion}>
                        <Card>
                          <CardBody>
                            <Form.Group className="mb-3" >
                              <Form.Control type="email" placeholder="Email Address" required onChange={(e) => setOldEmail(e.target.value)}/>
                              <Form.Control.Feedback type="invalid">
                                Please enter your email.
                              </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group className="mb-3" >                        
                              <Form.Control type="password" placeholder="Password" required onChange={(e) => setOldPassword(e.target.value)}/>
                              <Form.Control.Feedback type="invalid">
                                Please enter your password.
                              </Form.Control.Feedback>
                            </Form.Group>
                          </CardBody>
                          <CardFooter>
                            <div className="d-flex justify-content-center align-items-center">
                              <Button variant="danger" type="input">
                                Delete Account
                              </Button>
                            </div>
                          </CardFooter>
                        </Card>
                      </Form>
                      <Modal show={showDeleteModal} onHide={handleCancelDeletion} centered>
                        <Modal.Header closeButton>
                          <Modal.Title>Confirm Deletion</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                          <p>Are you sure you want to delete your account?</p>
                        </Modal.Body>
                        <Modal.Footer>
                          <Button variant="secondary" onClick={handleCancelDeletion}>
                            Cancel
                          </Button>
                          <Button variant="danger" onClick={handleConfirmDeletion}>
                            Delete
                          </Button>
                        </Modal.Footer>
                      </Modal>
                    </Tab.Pane>
                  </Tab.Content>
                </Col>
              </Row>
            </Tab.Container>
          </CardBody>
        </Card>
      </Container>
      <GenericModal
        show={showModal}
        onClose={handleCloseModal} 
        title={modalTitle}
        message={modalMessage}
      />
    </div>
  );
};