import React, { useEffect, useState} from 'react';
import { db } from '../config/firebase';
import { getDocs, setDoc, getDoc, collection, addDoc, deleteDoc, updateDoc, doc, query, where } from 'firebase/firestore'
import { Tab, Row, Col, Modal, Container, Navbar, Form, InputGroup, Nav, CardGroup, Card, CardHeader, CardBody, CardFooter, Button, Offcanvas, OffcanvasBody, OffcanvasHeader, FormControl, ModalHeader, ModalBody, ModalFooter, Accordion, Spinner, Dropdown } from 'react-bootstrap';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { getAuth, onAuthStateChanged, updateEmail, updatePassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { UserNavBar } from './dashboardUser';
import { Footer } from './home';
import { GenericModal } from './utilities';

export const AdminDashboard = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [userList, setUserList] = useState(null);
  const [patientList, setPatientList] = useState(null);
  const [staffList, setStaffList] = useState(null);
  const [appointmentList, setAppointmentList] = useState(null);
  const [serviceList, setServiceList] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (!user) {
        navigate('/');
      } else {
        checkUserRole(user.uid);

        const [userData, patientData, staffData, appointmentData, serviceData] = await Promise.all([
          getDocs(collection(db, "users")),
          getDocs(collection(db, "patients")),
          getDocs(collection(db, "staffs")),
          getDocs(collection(db, "appointment")),
          getDocs(collection(db, "services")),
        ]);
    
        const filteredUserData = userData.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        const filteredPatientData = patientData.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        const filteredStaffData = staffData.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        const filteredAppointmentData = appointmentData.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        const filteredServiceData = serviceData.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    
        setUserList(filteredUserData);
        setPatientList(filteredPatientData);
        setStaffList(filteredStaffData);
        setAppointmentList(filteredAppointmentData);
        setServiceList(filteredServiceData);

        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const checkUserRole = async (userId) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();

        if (userData.user_Role !== 'Staff' && userData.user_Role !== 'Doctor') {
          
          navigate('/');
        }
      }
    } catch (error) {
      console.error('Error checking user role:', error);
    }
  }

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
                  <Nav.Link eventKey="first">Schedule</Nav.Link>
                </Nav.Item>
                <Nav.Item className='mt-1 mb-1'>
                  <Nav.Link eventKey="second">Patient List</Nav.Link>
                </Nav.Item>
                <Nav.Item className='mt-1 mb-1'>
                  <Nav.Link eventKey="third">Staff List</Nav.Link>
                </Nav.Item>
                <Nav.Item className='mt-1 mb-1'>
                  <Nav.Link eventKey="fourth">Service List</Nav.Link>
                </Nav.Item>
                <Nav.Item className='mt-1 mb-3'>
                  <Nav.Link eventKey="fifth">Settings</Nav.Link>
                </Nav.Item>
              </Nav>
          </Col>
          <Col sm={10} className='bg-secondary'>
            <Tab.Content>
              <Tab.Pane eventKey="first">
                <Schedule
                  userList={userList}
                  patientList={patientList}
                  staffList={staffList}
                  appointmentList={appointmentList}
                  serviceList={serviceList}
                />
              </Tab.Pane>
              <Tab.Pane eventKey="second">
                <PatientList
                  userData={userList}
                  patientData={patientList}
                  appointmentData={appointmentList}
                  serviceList={serviceList}
                />
              </Tab.Pane>
              <Tab.Pane eventKey="third">
                <StaffList
                  userList={userList}
                  patientList={patientList}
                  staffList={staffList}
                />
              </Tab.Pane>
              <Tab.Pane eventKey="fourth">
                <ServiceList
                  serviceList={serviceList}
                />
              </Tab.Pane>
              <Tab.Pane eventKey="fifth">
                <AdminSetting
                  currentUser={currentUser}
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

const Schedule = ({ userList, patientList, staffList, appointmentList, serviceList }) => {
  const [date, setDate] = useState(new Date());
  const [reminders, setReminders] = useState([]);
  const [newReminderText, setNewReminderText] = useState('');
  const [selectedDateReminders, setSelectedDateReminders] = useState([]);

  const onChange = (selectedDate) => {
    setDate(selectedDate);
    setSelectedDateReminders(reminders.filter((reminder) => reminder.date === selectedDate.toDateString()));
  };

  const handleAddReminder = () => {
    if (newReminderText.trim() === '') {
      alert('Please enter a reminder text.');
      return;
    }

    const newReminder = {
      text: newReminderText,
      date: date.toDateString(),
    };

    setReminders([...reminders, newReminder]);
    setNewReminderText('');
    setSelectedDateReminders([...selectedDateReminders, newReminder]);
  };

  const handleUpdateReminder = (index, newText) => {
    const updatedReminders = [...reminders];
    updatedReminders[index].text = newText;

    setReminders(updatedReminders);
    setSelectedDateReminders(updatedReminders.filter((reminder) => reminder.date === date.toDateString()));
  };

  // Function to check if a day has a reminder
  const hasReminder = (checkDate) => {
    return reminders.some((reminder) => reminder.date === checkDate.toDateString());
  };


  return (
    <Container className='mt-3 mb-3'>
      <CardGroup>
        <Card>
          <CardHeader>
            <h4 className='text-center mt-2'>Calendar</h4>
          </CardHeader>
          <CardBody>
            <div className="d-flex justify-content-center align-items-center">
              <Button className='mb-3' onClick={handleAddReminder}>Schedule an Appointment</Button>
            </div>
            <div className="d-flex justify-content-center align-items-center">
              <Calendar onChange={onChange} value={date} tileContent={({ date, view }) => {
                if (view === 'month') {
                  const hasReminderForDay = hasReminder(date);
                  return hasReminderForDay ? <div style={{ color: 'red' }}>•</div> : null;
                }
                return null;
              }} />
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <h4 className='text-center mt-2'>Waiting List for {date.toDateString()}</h4>
          </CardHeader>
          <CardBody className="overflow-auto" style={{ maxHeight: '450px' }}>
            <div class="container">
              <input
                type="text"
                value={newReminderText}
                onChange={(e) => setNewReminderText(e.target.value)}
                placeholder="Enter new reminder"
              />
            </div>
            {selectedDateReminders.map((reminder, index) => (
              <Card className="mt-2 mb-3" key={index}>
                <CardHeader>
                  <div className='mt-2'>
                    <h6><strong>Date: </strong></h6>
                    <h6><strong>Time: </strong></h6>
                    <h6><strong>Doctor: </strong></h6>
                    <h6><strong>Patient: </strong></h6>
                  </div>
                </CardHeader>
                <CardBody>
                  {reminder.text}
                </CardBody>
                <CardFooter>
                  <div className="d-grid gap-2 d-md-flex justify-content-md-between">
                    <Button onClick={() => handleUpdateReminder(index, prompt('Enter new reminder text:', reminder.text))}>Reschedule</Button>
                    <Button variant='secondary'>Mark as Done</Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </CardBody>
        </Card>
      </CardGroup>
    </Container>
  );
};

const PatientList = ({ userData, patientData, appointmentData, serviceList }) => {
  const [userList, setUserList] = useState(userData);
  const [patientList, setPatientList] = useState(patientData);
  const [appointmentList, setAppointmentList] = useState(appointmentData);
  const [searchTerm, setSearchTerm] = useState('');
  const [openedHistoryModal, setOpenedHistoryModal] = useState(null);
  const [openedUpdateModal, setOpenedUpdateModal] = useState(null);

  const fetchHistoryData = async (users, setHistoryData, setDoctorData, setServiceData) => {
    try {
      if (!users.id) {
        console.error('Patient ID is undefined');
        return;
      }
  
      const patientAppointments = appointmentList.filter(appointment => appointment.appointment_PatientID === users.id);
      const doctorIds = patientAppointments.map(appointment => appointment.appointment_DoctorID);
      const serviceIds = patientAppointments.map(appointment => appointment.appointment_ServiceID);

      const doctorDataArray = userList.filter(user => doctorIds.includes(user.id));
      const serviceDataArray = serviceList.filter(service => serviceIds.includes(service.id));

      setHistoryData(patientAppointments);
      setDoctorData(doctorDataArray);
      setServiceData(serviceDataArray);
    } catch (error) {
      console.error('Error fetching history data: ', error);
    }
  };
    
  const PatientHistoryModal = ({ users, historyModal, handleCloseModal }) => {
    const [historyData, setHistoryData] = useState([]);
    const [doctorData, setDoctorData] = useState([]);
    const [serviceData, setServiceData] = useState([]);
  
    useEffect(() => {
      if (historyModal) {
        fetchHistoryData(users, setHistoryData, setDoctorData, setServiceData);
      }
    }, [users.id, historyModal]);

    return (
      <Modal show={historyModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
        <Modal.Title>{users.user_FirstName} {users.user_MiddleName} {users.user_LastName}'s History</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {historyData.length > 0 ? (
            historyData.filter((appointment) => appointment.appointment_PatientID === users.id)
            .map((appointment, index) => (
              <Card className='mb-3' key={index}>
                <CardHeader>
                  <div className="mt-2">
                    <h6><strong>Date:</strong> {appointment.appointment_Date}</h6>
                    <h6><strong>Time:</strong> {appointment.appointment_Time}</h6>
                  </div>
                </CardHeader>
                <CardBody>
                  {doctorData
                    .map((doctor) => (
                      <div key={`doctor-${doctor.id}`}>
                        <h6><strong>Doctor: </strong>{doctor.user_FirstName} {doctor.user_MiddleName} {doctor.user_LastName}</h6>
                      </div>
                    ))}
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
                  <h6 className='mt-2'><strong>Appointment Status: </strong>{appointment.appointment_Status}</h6>
                </CardFooter>
              </Card>
            ))
          ) : (
            <h6>No history data available.</h6>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };

  const UpdateInformationModal = ({users, patient, updateModal, handleCloseModal, onUpdateUser, onUpdatePatient }) => {
    const [validated, setValidated] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [modalMessage, setModalMessage] = useState("");

    const [firstName, setFirstName] = useState("");
    const [middleName, setMiddleName] = useState("");
    const [lastName, setLastName] = useState("");
    const [address, setAddress] = useState("");
    const [birthday, setBirthday] = useState("");
    const [gender, setGender] = useState("");
    const [mobileNumber, setMobileNumber] = useState("");

    const fetchDataForAccordionItem = async (navItem) => {
      if (navItem === "0") {
        setFirstName(users.user_FirstName || "");
        setMiddleName(users.user_MiddleName || "");
        setLastName(users.user_LastName || "");
        setAddress(users.user_Address || "");
        setBirthday(patient.patient_DateOfBirth || "");
        setGender(patient.patient_Gender || "");
      } else if (navItem === "1") {
        setMobileNumber(users.user_MobileNumber || "");
      }
    };

    useEffect(() => {
      fetchDataForAccordionItem("0");
      fetchDataForAccordionItem("1");
    }, []);

    const handlePersonal = async (e) => {
      e.preventDefault();
  
      setValidated(true);
      const form = e.currentTarget;
  
      if (form.checkValidity() === false) {
        e.stopPropagation();
        return;
      }
  
      try {
        const userDoc = doc(db, "users", users.id);
        const patientDoc = doc(db, "patients", users.id);
  
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

        setModalTitle("Success");
        setModalMessage("Your Personal Information has been updated.");

        onUpdateUser({
          user_FirstName: firstName,
          user_MiddleName: middleName,
          user_LastName: lastName,
          user_Address: address,
        });
        
        onUpdatePatient({
          patient_DateOfBirth: birthday,
          patient_Gender: gender,
        });

        setShowModal(true);
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
        const userDoc = doc(db, "users", users.id);
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
  
        await updateDoc(userDoc, {
          user_MobileNumber: mobileNumber,
        });

        setModalTitle("Success");
        setModalMessage("Your Contact Information has been updated.");
  
        onUpdateUser({
          user_MobileNumber: mobileNumber,
        });

        setShowModal(true);
      } catch (errr) {
        console.error(errr);
      }
    }

    return (
      <div>
        <Modal show={updateModal} onHide={handleCloseModal} centered>
          <ModalHeader closeButton>
            <Modal.Title>Update Information</Modal.Title>
          </ModalHeader>
          <ModalBody>
            <Accordion>
              <Accordion.Item eventKey="0">
                <Accordion.Header>Personal Information</Accordion.Header>
                <Accordion.Body>
                  <Form noValidate validated={validated} onSubmit={(e) => { e.preventDefault(); handlePersonal(e); }}>
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
                    <div className="d-flex justify-content-center align-items-center">
                      <Button variant="primary" type="input">
                        Update
                      </Button>
                    </div>         
                  </Form>
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="1">
                <Accordion.Header>Contact Information</Accordion.Header>
                <Accordion.Body>
                  <Form noValidate validated={validated} onSubmit={handleContact}>
                    <Form.Group className="mb-3">                      
                      <InputGroup>
                        <InputGroup.Text>Mobile Number</InputGroup.Text>
                        <Form.Control type="tel" placeholder="Mobile number" value={mobileNumber} required onChange={(e) => setMobileNumber(e.target.value)}/>
                        <Form.Control.Feedback type="invalid">
                          Please provide a new mobile number.
                        </Form.Control.Feedback>
                      </InputGroup>
                    </Form.Group>
                    <div className="d-flex justify-content-center align-items-center">
                      <Button variant="primary" type="input">
                        Update
                      </Button>
                    </div>
                  </Form>
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </ModalBody>
          <GenericModal
            show={showModal}
            onClose={() => setShowModal(false)}
            title={modalTitle}
            message={modalMessage}
          />
        </Modal>
      </div>
    );
  };

  const handleCloseModal = () => {
    setOpenedHistoryModal(null);
    setOpenedUpdateModal(null);
  };

  const updateUserData = (userList, userId, updatedData) => {
    return userList.map((user) => {
      if (user.id === userId) {
        return { ...user, ...updatedData };
      }
      return user;
    });
  };
  
  const updatePatientData = (patientList, userId, updatedData) => {
    return patientList.map((patient) => {
      if (patient.id === userId) {

        return { ...patient, ...updatedData };
      }
      return patient;
    });
  };

  const updateAppointmentData = (appointmentList, userId, updatedData) => {
    return appointmentList.map((appointment) => {
      if (appointment.appointment_PatientID === userId) {
        return { ...appointment, ...updatedData };
      }
      return appointment;
    });
  };
console.log.apply("Test");
  return (
    <Container className='mt-3 mb-3'>
      <Card>
        <CardHeader>
          <Navbar bg="light" expand="lg">
            <Navbar.Brand><h4 className='mt-2'>Patient List</h4></Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
              <Form inline="true">
                <input
                  className="form-control me-2 mt-2 mb-2"
                  type="text"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Form>
            </Navbar.Collapse>
          </Navbar>
        </CardHeader>
        <CardBody className="overflow-auto" style={{ maxHeight: '450px' }}>
          {userList
            .filter((users) => users.user_Role === 'Patient' &&
              `${users.user_FirstName} ${users.user_MiddleName} ${users.user_LastName}`
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
            )
            .map((users) => (
              <Card className="mb-3" key={users.id}>
                <CardHeader>
                    <h6 className="mt-2"><strong>Name: </strong>{users.user_FirstName} {users.user_MiddleName} {users.user_LastName}</h6>
                </CardHeader>
                <CardBody>
                  {patientList
                  .filter((patients) => patients.id === users.id)
                  .map((patients) => (
                    <div>
                      <h6><strong>Birthday: </strong>{patients.patient_DateOfBirth}</h6>
                      <h6><strong>Gender: </strong>{patients.patient_Gender}</h6>
                    </div>
                  ))}
                  <h6><strong>Email: </strong>{users.user_Email}</h6>
                  <h6><strong>Mobile Number: </strong>{users.user_MobileNumber}</h6>
                  <h6><strong>Address: </strong>{users.user_Address}</h6>
                </CardBody>
                <CardFooter>
                  <div className="d-grid gap-2 d-md-flex justify-content-md-between">
                    <Button variant="secondary" onClick={() => setOpenedUpdateModal(users.id)}>Update Information</Button>
                    <Button>Schedule Appointment</Button>
                    <Button variant='info' onClick={() => setOpenedHistoryModal(users.id)}>View Appointment History</Button>
                  </div>
                </CardFooter>
                <>
                  <UpdateInformationModal
                    users={users}
                    patient={patientList.find(patient => patient.id === users.id)}
                    updateModal={openedUpdateModal === users.id}
                    handleCloseModal={handleCloseModal}
                    onUpdateUser={(updatedData) => setUserList((prevUsers) => updateUserData(prevUsers, users.id, updatedData))}
                    onUpdatePatient={(updatedData) => setPatientList((prevPatients) => updatePatientData(prevPatients, users.id, updatedData))}
                  />
                  <PatientHistoryModal
                    users={users}
                    historyModal={openedHistoryModal === users.id}
                    handleCloseModal={handleCloseModal}
                  />
                </>
              </Card>
            ))
          }
        </CardBody>
      </Card>
    </Container>
  );
};

function StaffList({ userList, patientList, staffList }) {
  const [userData, setUserData] = useState(userList);
  const [patientData, setPatientData] = useState(patientList);
  const [staffData, setStaffData] = useState(staffList);
  const [searchTerm, setSearchTerm] = useState('');
  const [changeToForm, setChangeToForm] = useState(false);
  const [openedUpdateModal, setOpenedUpdateModal] = useState(null);

  const [changeToSchedule, setChangeToSchedule] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');

  const UpdateInformationModal = ({ users, staffs, updateModal, handleCloseModal, onUpdateUser, onUpdateStaff }) => {
    const [validated, setValidated] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [modalMessage, setModalMessage] = useState("");

    const [firstName, setFirstName] = useState("");
    const [middleName, setMiddleName] = useState("");
    const [lastName, setLastName] = useState("");
    const [address, setAddress] = useState("");
    const [birthday, setBirthday] = useState("");
    const [gender, setGender] = useState("");
    const [mobileNumber, setMobileNumber] = useState("");
    const [jobDescription, setJobDescription] = useState("");

    const fetchDataForAccordionItem = async (navItem) => {
      if (navItem === "0") {
        setFirstName(users.user_FirstName || "");
        setMiddleName(users.user_MiddleName || "");
        setLastName(users.user_LastName || "");
        setAddress(users.user_Address || "");
        setBirthday(staffs.staff_DateOfBirth || "");
        setGender(staffs.staff_Gender || "");
        setJobDescription(staffs.staff_JobDescription || "");
      } else if (navItem === "1") {
        setMobileNumber(users.user_MobileNumber || "");
      }
    };

    useEffect(() => {
      fetchDataForAccordionItem("0");
      fetchDataForAccordionItem("1");
    }, []);

    const handlePersonal = async (e) => {
      e.preventDefault();

      setValidated(true);
      const form = e.currentTarget;

      if (form.checkValidity() === false) {
        e.stopPropagation();
        return;
      }

      try {
        const userDoc = doc(db, "users", users.id);
        const staffDoc = doc(db, "staffs", users.id);

        const userSnapshot = await getDoc(userDoc);
        const staffSnapshot = await getDoc(staffDoc);

        if (userSnapshot.exists() &&
          staffSnapshot.exists() &&
          userSnapshot.data().user_FirstName === firstName &&
          userSnapshot.data().user_MiddleName === middleName &&
          userSnapshot.data().user_LastName === lastName &&
          userSnapshot.data().user_Address === address &&
          staffSnapshot.data().staff_DateOfBirth === birthday &&
          staffSnapshot.data().staff_Gender === gender &&
          staffSnapshot.data().staff_JobDescription === jobDescription) {
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

        await updateDoc(staffDoc, {
          staff_DateOfBirth: birthday,
          staff_Gender: gender,
          staff_JobDescription: jobDescription,
        });

        setModalTitle("Success");
        setModalMessage("Your Personal Information has been updated.");

        onUpdateUser({
          user_FirstName: firstName,
          user_MiddleName: middleName,
          user_LastName: lastName,
          user_Address: address,
        });

        onUpdateStaff({
          staff_DateOfBirth: birthday,
          staff_Gender: gender,
          staff_JobDescription: jobDescription,
        });

        setShowModal(true);
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
        const userDoc = doc(db, "users", users.id);
        const userSnapshot = await getDoc(userDoc);

        if (userSnapshot.exists() &&
          userSnapshot.data().user_MobileNumber === mobileNumber) {
          setShowModal(true);
          setModalTitle("No Change");
          setModalMessage("No changes have been made.");
          return;
        }

        await updateDoc(userDoc, {
          user_MobileNumber: mobileNumber,
        });

        setModalTitle("Success");
        setModalMessage("Your Contact Information has been updated.");

        onUpdateUser({
          user_MobileNumber: mobileNumber,
        });

        setShowModal(true);
      } catch (errr) {
        console.error(errr);
      }
    };

    return (
      <div>
        <Modal show={updateModal} onHide={handleCloseModal} centered>
          <ModalHeader closeButton>
            <Modal.Title>Update Information</Modal.Title>
          </ModalHeader>
          <ModalBody>
            <Accordion>
              <Accordion.Item eventKey="0">
                <Accordion.Header>Personal Information</Accordion.Header>
                <Accordion.Body>
                  <Form noValidate validated={validated} onSubmit={(e) => { e.preventDefault(); handlePersonal(e); } }>
                    <Form.Group className="mb-3">
                      <InputGroup>
                        <InputGroup.Text>Full Name</InputGroup.Text>
                        <Form.Control type="text" placeholder="First Name" value={firstName} required onChange={(e) => setFirstName(e.target.value)} />
                        <Form.Control type="text" placeholder="Middle Name" value={middleName} onChange={(e) => setMiddleName(e.target.value)} />
                        <Form.Control type="text" placeholder="Last Name" value={lastName} required onChange={(e) => setLastName(e.target.value)} />
                        <Form.Control.Feedback type="invalid">
                          Please provide your First and Last Name (Middle Name is Optional).
                        </Form.Control.Feedback>
                      </InputGroup>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Control type="text" placeholder="Address" value={address} required onChange={(e) => setAddress(e.target.value)} />
                      <Form.Control.Feedback type="invalid">
                        Please provide your address.
                      </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Row>
                        <Col>
                          <InputGroup>
                            <InputGroup.Text>Birthday</InputGroup.Text>
                            <Form.Control type="date" value={birthday} required onChange={(e) => setBirthday(e.target.value)} />
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
                    <Form.Group className="mb-3">
                      <InputGroup>
                        <InputGroup.Text>Job Description</InputGroup.Text>
                        <Form.Control value={jobDescription} required onChange={(e) => setJobDescription(e.target.value)} />
                        <Form.Control.Feedback type="invalid">
                          Please provide your job description.
                        </Form.Control.Feedback>
                      </InputGroup>
                    </Form.Group>
                    <div className="d-flex justify-content-center align-items-center">
                      <Button variant="primary" type="input">
                        Update
                      </Button>
                    </div>
                  </Form>
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="1">
                <Accordion.Header>Contact Information</Accordion.Header>
                <Accordion.Body>
                  <Form noValidate validated={validated} onSubmit={handleContact}>
                    <Form.Group className="mb-3">
                      <InputGroup>
                        <InputGroup.Text>Mobile Number</InputGroup.Text>
                        <Form.Control type="tel" placeholder="Mobile number" value={mobileNumber} required onChange={(e) => setMobileNumber(e.target.value)} />
                        <Form.Control.Feedback type="invalid">
                          Please provide a new mobile number.
                        </Form.Control.Feedback>
                      </InputGroup>
                    </Form.Group>
                    <div className="d-flex justify-content-center align-items-center">
                      <Button variant="primary" type="input">
                        Update
                      </Button>
                    </div>
                  </Form>
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </ModalBody>
          <GenericModal
            show={showModal}
            onClose={() => setShowModal(false)}
            title={modalTitle}
            message={modalMessage} />
        </Modal>
      </div>
    );
  };

  const handleStartDateChange = (date) => {
    setStartDate(date);
  };

  const handleEndDateChange = (date) => {
    setEndDate(date);
  };

  const handleStartTimeChange = (e) => {
    setStartTime(e.target.value);
  };

  const handleEndTimeChange = (e) => {
    setEndTime(e.target.value);
  };

  const handleChangeSchedule = async (userId) => {
    try {
      const startDateTime = new Date(`${startDate.toDateString()} ${startTime}`);
      const endDateTime = new Date(`${endDate.toDateString()} ${endTime}`);

      const staffDoc = doc(db, 'staffs', userId);
      await updateDoc(staffDoc, {
        staff_Schedule: { start: startDateTime, end: endDateTime },
      });

      setStaffData((prevStaffs) => prevStaffs.map((staff) => staff.id === userId
        ? { ...staff, staff_Schedule: { start: startDateTime, end: endDateTime } }
        : staff
      )
      );
    } catch (error) {
      console.error('Error updating schedule:', error);
    }
  };

  const StaffAdditionModal = ({ userList, searchTerm, changeToForm, onUpdateUser, onUpdatePatient, onUpdateStaff }) => {

    const addAsStaff = async (id) => {
      try {
        const userDocRef = doc(db, 'users', id);
        const userSnapshot = await getDoc(userDocRef);

        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();

          await updateDoc(userDocRef, {
            user_Role: 'Staff',
          });

          const staffDocRef = doc(db, 'staffs', id);
          await setDoc(staffDocRef, {
            staff_JobDescription: '',
            staff_Schedule: '',
            staff_DateOfBirth: userData.patient_DateOfBirth || '',
            staff_Gender: userData.patient_Gender || '',
          });

          const patientDocRef = doc(db, 'patients', id);
          await deleteDoc(patientDocRef);

          onUpdateUser();
          onUpdateStaff();
          onUpdatePatient();
        }
      } catch (error) {
        console.error('Error adding as staff:', error);
      }
    };

    return (
      <>
        {searchTerm !== "" && changeToForm && userList.map((user) => (
          <Card className='mb-3' key={user.id}>
            <CardHeader>
              <h6 className='mt-2'><strong>Name: </strong>{user.user_FirstName} {user.user_MiddleName} {user.user_LastName}</h6>
            </CardHeader>
            <CardBody>
              <h6><strong>User Role: </strong>{user.user_Role}</h6>
              <h6><strong>Email: </strong>{user.user_Email}</h6>
              <h6><strong>Mobile Number: </strong>{user.user_MobileNumber}</h6>
            </CardBody>
            <CardFooter>
              <div className="d-flex justify-content-center align-items-center">
                <Button onClick={() => addAsStaff(user.id)}>
                  Add as a Staff
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </>
    );
  };

  const filteredUsers = userList.filter((user) => user.user_Role === 'Patient' &&
    `${user.user_FirstName} ${user.user_MiddleName} ${user.user_LastName} ${user.user_Email}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const handleChangeState = () => {
    setChangeToForm(!changeToForm);
  };

  const handleCloseModal = () => {
    setOpenedUpdateModal(null);
  };

  const updateUserData = (userList, userId, updatedData) => {
    return userList.map((user) => {
      if (user.id === userId) {
        return { ...user, ...updatedData };
      }
      return user;
    });
  };

  const updatePatientData = (patientList, userId, updatedData) => {
    return patientList.map((patient) => {
      if (patient.id === userId) {

        return { ...patient, ...updatedData };
      }
      return patient;
    });
  };

  const updateStaffData = (staffList, userId, updatedData) => {
    return staffList.map((staff) => {
      if (staff.id === userId) {

        return { ...staff, ...updatedData };
      }
      return staff;
    });
  };

  const ChangeToScheduleCard = () => {
    setChangeToSchedule(!changeToSchedule);
  };

  return (
    <Container className='mt-3 mb-3'>
      <Card>
        <CardHeader>
          <Navbar bg="light" expand="lg">
            <Navbar.Brand><h4 className='mt-2'>{changeToForm ? 'Staff Addition Form' : 'Staff List'}</h4></Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
              <div className="d-grid gap-2 d-md-flex justify-content-md-between">
                <Form inline="true">
                  <FormControl
                    type="text"
                    className='mt-2'
                    placeholder="Search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)} />
                </Form>
                <Button
                  type="button"
                  className="btn btn-secondary mt-2 mb-2"
                  onClick={handleChangeState}
                >
                  {changeToForm ? 'Show Staff List' : 'Show Staff Addition Form'}
                </Button>
              </div>
            </Navbar.Collapse>
          </Navbar>
        </CardHeader>
        <CardBody className="overflow-auto" style={{ maxHeight: '450px' }}>
          {!changeToForm ? (
            userData
              .filter((users) => users.user_Role === 'Staff' &&
                `${users.user_FirstName} ${users.user_MiddleName} ${users.user_LastName}`
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase()))
              .map((users) => (
                <Card className="mb-3" key={users.id}>
                  <CardHeader>
                    <h5 className="mt-2"><strong>Name: </strong>{users.user_FirstName} {users.user_MiddleName} {users.user_LastName}</h5>
                  </CardHeader>
                  <CardGroup>
                    <Card>
                      <CardBody>
                        {staffData
                          .filter((staffs) => staffs.id === users.id)
                          .map((staffs) => (
                            <div>
                              <h6><strong>Job Description: </strong>{staffs.staff_JobDescription}</h6>
                              {staffs.staff_Schedule && staffs.staff_Schedule.start && staffs.staff_Schedule.end && staffs.staff_Schedule.start.toDate && staffs.staff_Schedule.end.toDate && (
                                <div className='mt-3'>
                                  <h5 className='text-center mb-3'><strong>Schedule</strong></h5>
                                  <h6><strong>Date: </strong>
                                    {`${staffs.staff_Schedule.start.toDate().toLocaleDateString()} - ${staffs.staff_Schedule.end.toDate().toLocaleDateString()}`}
                                  </h6>
                                  <h6>
                                    <strong>Time: </strong>
                                    {`${staffs.staff_Schedule.start.toDate().toLocaleTimeString()} - ${staffs.staff_Schedule.end.toDate().toLocaleTimeString()}`}
                                  </h6>
                                </div>
                              )}
                            </div>
                          ))}
                      </CardBody>
                    </Card>
                    <Card>
                      <CardBody>
                        {!changeToSchedule ? (
                          <div>
                            <h6><strong>Email: </strong>{users.user_Email}</h6>
                            <h6><strong>Mobile Number: </strong>{users.user_MobileNumber}</h6>
                            {staffData
                              .filter((staffs) => staffs.id === users.id)
                              .map((staffs) => (
                                <div>
                                  <h6><strong>Gender: </strong>{staffs.staff_Gender}</h6>
                                  <h6><strong>Birthday: </strong>{staffs.staff_DateOfBirth}</h6>
                                </div>
                              ))}
                            <h6><strong>Address: </strong>{users.user_Address}</h6>
                          </div>) : (
                          <div>
                            <Accordion>
                              <Accordion.Item eventKey="0">
                                <Accordion.Header>Start Date</Accordion.Header>
                                <Accordion.Body>
                                  <div className="d-flex justify-content-center align-items-center ">
                                    <Calendar onChange={handleStartDateChange} value={startDate} />
                                  </div>
                                </Accordion.Body>
                              </Accordion.Item>
                              <Accordion.Item eventKey='1'>
                                <Accordion.Header>End Date</Accordion.Header>
                                <Accordion.Body>
                                  <div className="d-flex justify-content-center align-items-center ">
                                    <Calendar onChange={handleEndDateChange} value={endDate} />
                                  </div>
                                </Accordion.Body>
                              </Accordion.Item>
                              <Accordion.Item eventKey="2">
                                <Accordion.Header>Time Range</Accordion.Header>
                                <Accordion.Body>
                                  <div className="d-flex justify-content-center align-items-center ">
                                    <Form.Group controlId="startTimePicker">
                                      <InputGroup>
                                        <InputGroup.Text>Start Time:  </InputGroup.Text>
                                        <Form.Control type="time" value={startTime} onChange={handleStartTimeChange} />
                                      </InputGroup>
                                    </Form.Group>
                                    <Form.Group controlId="endTimePicker">
                                      <InputGroup>
                                        <InputGroup.Text>End Time:  </InputGroup.Text>
                                        <Form.Control type="time" value={endTime} onChange={handleEndTimeChange} />
                                      </InputGroup>
                                    </Form.Group>
                                  </div>
                                </Accordion.Body>
                              </Accordion.Item>
                            </Accordion>
                            <div className="d-flex justify-content-center align-items-center mt-2">
                              <Button variant="primary" onClick={handleChangeSchedule(users.id)}>
                                Save Changes
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardBody>
                    </Card>
                  </CardGroup>
                  <CardFooter>
                    <div className="d-grid gap-2 d-md-flex justify-content-md-between">
                      <Button variant='info' onClick={() => setOpenedUpdateModal(users.id)}>
                        Update Information
                      </Button>
                      <Button onClick={(console.log("Yeet"))}>
                        Remove from List
                      </Button>
                      <Button variant="secondary" onClick={ChangeToScheduleCard}>
                        {changeToSchedule ? "Change to Schedule Card" : "Change to Contact Card"}
                      </Button>
                    </div>
                  </CardFooter>
                  <UpdateInformationModal
                    users={users}
                    staffs={staffData.find(staff => staff.id === users.id)}
                    updateModal={openedUpdateModal === users.id}
                    handleCloseModal={handleCloseModal}
                    onUpdateUser={(updatedData) => setUserData((prevUsers) => updateUserData(prevUsers, users.id, updatedData))}
                    onUpdateStaff={(updatedData) => setStaffData((prevStaffs) => updateStaffData(prevStaffs, users.id, updatedData))} />
                </Card>
              ))
          ) : (
            searchTerm !== "" && (
              <StaffAdditionModal
                userList={filteredUsers}
                searchTerm={searchTerm}
                changeToForm={changeToForm}
                onUpdateUser={(updatedData) => setUserData((prevUsers) => updateUserData(prevUsers, filteredUsers[0].id, updatedData))}
                onUpdatePatient={(updatedData) => setPatientData((prevPatients) => updatePatientData(prevPatients, filteredUsers[0].id, updatedData))}
                onUpdateStaff={(updatedData) => setStaffData((prevStaffs) => updateStaffData(prevStaffs, filteredUsers[0].id, updatedData))} />
            ))}
        </CardBody>
      </Card>
    </Container>
  );
}

const ServiceList = ({ serviceList }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [formVisible, setFormVisible] = useState(false);

  // For Adding Function
  const [newServiceName, setNewServiceName] = useState("");
  const [newServiceCategory, setNewServiceCategory] = useState("");
  const [newServicePrice, setNewServicePrice] = useState("");
  const [confirmationModal, setConfirmationModal] = useState(false);

  // For Update Function
  const [updateModal, setUpdateModal] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [serviceData, setServiceData] = useState([]);

  useEffect(() => {
    setServiceData(serviceList);
  }, [serviceList]);


  const toggleFormVisibility = () => {
    setFormVisible(!formVisible);
  };

  const handleCloseModal = () => {
    setConfirmationModal(false);
  };

  const onSubmitService = async () => {
    try {
      if (!newServiceCategory || !newServiceName || !newServicePrice) {
        alert('Please fill in all required fields');
        return;
      }

      const newServiceRef = await addDoc(collection(db, "services"), {
        service_Name: newServiceName,
        service_Category: newServiceCategory,
        service_Price: newServicePrice,
      });

      setServiceData([...serviceData, {
        id: newServiceRef.id,
        service_Name: newServiceName,
        service_Category: newServiceCategory,
        service_Price: newServicePrice,
      }]);

      setNewServiceName("");
      setNewServiceCategory("");
      setNewServicePrice("");
      setConfirmationModal(true);
    } catch (error) {
      console.error(error);
    }
  };

  const deleteService = async (id) => {
    const servicesDoc = doc(db, "services", id);
    await deleteDoc(servicesDoc);

    setServiceData(serviceData.filter(service => service.id !== id));
  };

  const updateServiceInformation = async (id, newServiceName, newServiceCategory, newServicePrice) => {
    const serviceDoc = doc(db, "services", id);
    await updateDoc(serviceDoc, {
      service_Name: newServiceName,
      service_Category: newServiceCategory,
      service_Price: newServicePrice,
    });

    setServiceData(serviceData.map(service => 
      service.id === id
        ? {
            ...service,
            service_Name: newServiceName,
            service_Category: newServiceCategory,
            service_Price: newServicePrice,
          }
        : service
    ));

    setUpdateModal(false);
  };

  const UpdateServiceModal = ({ show, hide, id }) => {
    const [loading, setLoading] = useState(true);
    const [newServiceName, setNewServiceName] = useState("");
    const [newServiceCategory, setNewServiceCategory] = useState("");
    const [newServicePrice, setNewServicePrice] = useState("");
  
    useEffect(() => {
      const fetchToUpdateInfo = async (documentId) => {
        try {
          const docRef = doc(db, "services", documentId);
          const docSnapshot = await getDoc(docRef);
    
          if (docSnapshot.exists()) {
            setNewServiceName(docSnapshot.data().service_Name);
            setNewServiceCategory(docSnapshot.data().service_Category);
            setNewServicePrice(docSnapshot.data().service_Price);
          }
        } catch (error) {
          console.error(error);
        }
        finally
        {
          setLoading(false);
        }
      };

      if(show)
      {
        setLoading(true);
        fetchToUpdateInfo(id);
      }
    }, [show, id]);
  
    const handleUpdate = () => {
      updateServiceInformation(id, newServiceName, newServiceCategory, newServicePrice);
    };
  
    return (
      <Modal show={show} onHide={hide} centered>
        <Modal.Header closeButton>
          <Modal.Title>Update Information</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        {loading ? ( <h2 className="text-center">Loading...</h2> ) : 
          (
            <>
              <div className="form-group mb-3">
                <label htmlFor="service_Name"><strong>Service Name:</strong></label>
                <input
                  type="text"
                  id="service_Name"
                  className="form-control"
                  placeholder="Enter Service Name"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                />
              </div>
              <div className="form-group mb-3">
                <label htmlFor="service_Category"><strong>Service Category:</strong></label>
                <select
                  className="form-control"
                  id="appointmentType"
                  value={newServiceCategory}
                  onChange={(e) => setNewServiceCategory(e.target.value)}
                >
                  <option class="text-center" disabled selected>Pick Service Category</option>
                  <option value="Laboratory Test">Laboratory Test</option>
                  <option value="Ultrasounds">Ultrasounds</option>
                </select>
              </div>
              <div className="form-group mb-3">
                <label htmlFor="service_Price"><strong>Price:</strong></label>
                <input
                  type="text"
                  id="service_Price"
                  className="form-control"
                  placeholder="Enter Price"
                  value={newServicePrice}
                  onChange={(e) => setNewServicePrice(e.target.value)}
                />
              </div>
              <div className="d-flex justify-content-center align-items-center ">
                <button type="button" className="btn btn-info" onClick={handleUpdate}>
                  Update
                </button>
              </div>
            </>
          )}
        </Modal.Body>
      </Modal>
    );
  };

  const showServiceModal = (id) => {
    setSelectedId(id);
    setUpdateModal(true);
  };

  const hideServiceModal = () => {
    setUpdateModal(false);
  };

  return (
    <Container className='mt-3 mb-3'>
      <Card>
        <CardHeader>
          <Navbar bg="light" expand="lg">
            <Navbar.Brand><h4 className='mt-2'>Service List</h4></Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
              <div className="d-grid gap-2 d-md-flex justify-content-md-between">
                <Form inline="true">
                  <FormControl
                    type="text"
                    className='mt-2'
                    placeholder="Search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </Form>
                <Button
                  type="button"
                  className="btn btn-secondary mt-2 mb-2"
                  onClick={toggleFormVisibility}
                >
                  {formVisible ? 'Hide Service Addition Form' : 'Show Service Addition Form'}
                </Button>
              </div>
            </Navbar.Collapse>
          </Navbar>
        </CardHeader>
        <CardBody className="overflow-auto" style={{ maxHeight: '450px' }}>
          {serviceData.filter((services) =>
            `${services.service_Name} ${services.service_Category} ${services.service_Price}`
              .toLowerCase()
              .includes(searchTerm.toLowerCase())
          ).map((services) => (
            <Card className="card mb-3" key={services.id}>
              <CardBody>
                <h6><strong>Service Name: </strong>{services.service_Name}</h6>
                <h6><strong>Category: </strong>{services.service_Category}</h6>
                <h6><strong>Price: </strong>{services.service_Price}</h6>
              </CardBody>
              <CardFooter>
                <div className="d-grid gap-2 d-md-flex justify-content-md-between">
                  <button type="button" className="btn btn-info" onClick={() => showServiceModal(services.id)}>Update Information</button>
                  <button type="button" className="btn btn-danger" onClick={() => deleteService(services.id)}>Delete</button>
                </div>
              </CardFooter>
              <UpdateServiceModal
                show={updateModal}
                hide={hideServiceModal}
                id={selectedId}
              />
            </Card>
          ))}
        </CardBody>
      </Card>
      {formVisible && (
        <Offcanvas show={formVisible} onHide={() => setFormVisible(false)} placement='end'>
          <OffcanvasHeader closeButton>
            <h3 className="text-center">Service Addition Form</h3>
          </OffcanvasHeader>
          <OffcanvasBody  scroll='false'>
            <div className="form-group mb-3">
              <input type="text" id="service_Name" className="form-control" placeholder="Enter Service Name" onChange={(e) => setNewServiceName(e.target.value)} required />
            </div>
            <div className="form-group mb-3">
              <select className="form-control" id="appointmentType" onChange={(e) => setNewServiceCategory(e.target.value)} required>
                <option class="text-center" disabled selected>Pick Service Category</option>
                <option value="Laboratory Test">Laboratory Test</option>
                <option value="Ultrasounds">Ultrasounds</option>
              </select>
            </div>
            <div className="form-group mb-3">
              <input type="text" id="service_Price" className="form-control" placeholder="Enter Price" onChange={(e) => setNewServicePrice(e.target.value)} required />
            </div>
            <div className="d-flex justify-content-center align-items-center ">
              <button type="button" className="btn btn-primary" onClick={onSubmitService}>Submit</button>
            </div>
          </OffcanvasBody>
        </Offcanvas>
      )}
      <Modal show={confirmationModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Submission Status</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          New service has been submitted successfully!
        </Modal.Body>
        <Modal.Footer>
          <button type="button" className="btn btn-primary" onClick={handleCloseModal}>
            Close
          </button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

const AdminSetting = ({ currentUser }) => {
  const [validated, setValidated] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const navigate = useNavigate();

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

  const fetchDataForNavItem = async (navItem) => {
    const userDoc = doc(db, "users", currentUser.uid);
    const patientDoc = doc(db, "staffs", currentUser.uid);

    if (navItem === "fourth") {
      const userSnapshot = await getDoc(userDoc);
      const patientSnapshot = await getDoc(patientDoc);

      if (userSnapshot.exists() && patientSnapshot.exists()) {
        const userData = userSnapshot.data();
        const patientData = patientSnapshot.data();

        setFirstName(userData.user_FirstName || "");
        setMiddleName(userData.user_MiddleName || "");
        setLastName(userData.user_LastName || "");
        setAddress(userData.user_Address || "");
        setBirthday(patientData.staff_DateOfBirth || "");
        setGender(patientData.staff_Gender || "");
      }
    } else if (navItem === "fifth") {
      const userSnapshot = await getDoc(userDoc);

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
            <Tab.Container id="left-tabs-example" defaultActiveKey="fourth" fill>
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
                              <InputGroup>
                                <InputGroup.Text>Mobile Number</InputGroup.Text>
                                <Form.Control type="tel" placeholder="Mobile number" value={mobileNumber} required onChange={(e) => setMobileNumber(e.target.value)}/>
                                <Form.Control.Feedback type="invalid">
                                  Please provide a new mobile number.
                                </Form.Control.Feedback>
                              </InputGroup>
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