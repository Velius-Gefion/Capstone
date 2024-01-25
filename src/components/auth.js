import { 
    auth, 
    googleProvider, 
    db} from "../config/firebase";
import { 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword, 
    signInWithPopup,
    sendPasswordResetEmail,
    signOut,
    getAuth,
    onAuthStateChanged, fetchSignInMethodsForEmail } from 'firebase/auth';
import { 
    doc, getDoc, collection, setDoc } from 'firebase/firestore'
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { Card, CardBody, CardFooter, Col, Row, InputGroup, Modal, Button, Form, Nav } from "react-bootstrap";
import { GenericModal } from "./utilities";

export const Login = () => {
    const [email, setEmail] = useState("");
    const [resetEmail, setResetEmail] = useState("");
    const [password, setPassword] = useState("");

    const [registerModal, setRegisterModal] = useState(false);
    const [resetModal, setResetModal] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [modalMessage, setModalMessage] = useState("");

    const [userIdForRegister, setUserIdForRegister] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (email && userIdForRegister) {
            setRegisterModal(true);
        }
    }, [email, userIdForRegister]);

    const handleLogin = async () => {
        try
        {
            const userCredentials = await signInWithEmailAndPassword(auth, email, password);
            const userId = userCredentials.user.uid;

            const userRef = doc(collection(db, "users"), userId);
            const userSnapshot = await getDoc(userRef);

            if (userSnapshot.exists()) {
                const userRole = userSnapshot.data().user_Role;

                if (userRole == "Admin") {
                    window.localStorage.setItem('userID', userId);
                    window.localStorage.setItem('isLoggedIn', true);
                    window.localStorage.setItem('isAdmin', true);

                    navigate('/admin-dashboard');
                }
                else {
                    window.localStorage.setItem('userID', userId);
                    window.localStorage.setItem('isLoggedIn', true);
                    window.localStorage.setItem('isAdmin', false);

                    navigate('/user-dashboard');
                }
            }
        }
        catch (errr)
        {
          console.error('Error during login', errr.message);
        }
    };

    const signInWithGoogle = async () => {
        try
        {
            const userCredentials = await signInWithPopup(auth, googleProvider);
            const userId = userCredentials.user.uid;
            const userEmail = userCredentials.user.email;

            const userRef = doc(collection(db, "users"), userId);
            const userSnapshot = await getDoc(userRef);

            if (userSnapshot.exists()) {
                const userRole = userSnapshot.data().user_Role;
    
                if (userRole === "Staff") {
                    window.localStorage.setItem('userID', userId);
                    window.localStorage.setItem('isLoggedIn', true);
                    window.localStorage.setItem('isAdmin', true);
    
                    navigate('/admin-dashboard');
                } else {
                    window.localStorage.setItem('userID', userId);
                    window.localStorage.setItem('isLoggedIn', true);
                    window.localStorage.setItem('isAdmin', false);
    
                    navigate('/user-dashboard');
                }
            } else {
                setEmail(userEmail);
                setUserIdForRegister(userId);
            }
        }
        catch (errr)
        {
            console.error("Error during sign-in", errr.message);   
        }
    };

    const resetPassword = async () => {
        const auth = getAuth();

        try {
            await sendPasswordResetEmail(auth, resetEmail);
            setResetModal(false);
            setShowModal(true);
            setModalTitle("Success");
            setModalMessage("Please check your email for the link.");
        } catch (error) {
          console.error('Error sending password reset email:', error.message);
        };
    }

    const handleOpenModal = () => {
        setResetModal(true);
    }

    const handleCloseModal = () => {
        setShowModal(false);
        setResetModal(false);
    }

    return (
        <>
            <Card className='mt-3 mx-auto' style={{ maxWidth: '400px' }}>
                <CardBody>
                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label>Email address</Form.Label>
                        <Form.Control type="email" placeholder="Enter email" onChange={(e) => setEmail(e.target.value)}/>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formBasicPassword">
                        <Form.Label>Password</Form.Label>
                        <Form.Control type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)}/>
                    </Form.Group>
                    <div className="text-center">
                        <Nav.Link onClick={handleOpenModal}>Forgot your password?</Nav.Link>
                    </div>
                </CardBody>
                <CardFooter>
                    <Row>
                        <Col>
                            <div className="d-flex justify-content-center align-items-center">
                                <Button variant="primary" type="submit" onClick={handleLogin}>
                                    <h6 className='mt-2'>Log - in</h6>
                                </Button>
                            </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <div className="d-flex justify-content-center align-items-center">
                                <h6>or</h6>
                            </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <div className="d-flex justify-content-center align-items-center">
                                <button type="btn" className="btn btn-secondary" onClick={signInWithGoogle}>
                                    Sign in with Google
                                    <span className="badge">
                                        <FontAwesomeIcon icon={faGoogle} className="mr-2" />
                                    </span>
                                </button>
                            </div>
                        </Col>
                    </Row>
                </CardFooter>
            </Card>
            <Modal show={resetModal} onHide={handleCloseModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Reset Password</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label>Please enter your email and we'll send link to reset your password</Form.Label>
                        <Form.Control type="email" placeholder="Enter email" onChange={(e) => setResetEmail(e.target.value)}/>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <button type="button" className="btn btn-primary" onClick={resetPassword}>
                        Submit
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                        Close
                    </button>
                </Modal.Footer>
            </Modal>
            <GenericModal
                show={showModal}
                onClose={handleCloseModal}
                title={modalTitle}
                message={modalMessage}
            />
            <Register
                show={registerModal}
                onHide={() => setRegisterModal(false)}
                userEmail={email}
                googleID={userIdForRegister}
                showEmailPasswordFields={false}
                showCloseButton={false}
            />
        </>
    );
};

export const Register = ({ show, onHide, userEmail, googleID, showEmailPasswordFields = true, showCloseButton = true }) => {
    const [validated, setValidated] = useState(false);
    const [firstName, setFirstName] = useState("");
    const [middleName, setMiddleName] = useState("");
    const [lastName, setLastName] = useState("");
    const [address, setAddress] = useState("");
    const [birthday, setBirthday] = useState("");
    const [gender, setGender] = useState("");
    const [mobileNumber, setMobileNumber] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [userRole] = useState("Patient");
    const navigate = useNavigate();

    const handleRegister = async (event) => {

        event.preventDefault();
        setValidated(true);
    
        const form = event.currentTarget;
    
        if (form.checkValidity() === false) {
          event.stopPropagation();
          return;
        }

        try {
            let userId;
            let modifiedEmail = email;

            if(email === "") {
                modifiedEmail = userEmail;
                userId = googleID;
            }
            else {
                const userCredentials = await createUserWithEmailAndPassword(auth, email, password);
                userId = userCredentials.user.uid;
            }

            const userCollectionRef = doc(collection(db, "users"), userId);
            const patientCollectionRef = doc(collection(db, "patients"), userId);

            await setDoc(userCollectionRef, {
                user_FirstName: firstName,
                user_MiddleName: middleName || "",
                user_LastName: lastName,
                user_Address: address,
                user_MobileNumber: mobileNumber,
                user_Email: email || modifiedEmail,
                user_Role: userRole,
            });

            await setDoc(patientCollectionRef, {
                patient_DateOfBirth: birthday,
                patient_Gender: gender,
            });

            onHide();
            if (userRole === "Staff") {
                window.localStorage.setItem('userID', userId);
                window.localStorage.setItem('isLoggedIn', true);
                window.localStorage.setItem('isAdmin', true);

                navigate('/admin-dashboard');
            } else {
                window.localStorage.setItem('userID', userId);
                window.localStorage.setItem('isLoggedIn', true);
                window.localStorage.setItem('isAdmin', false);

                navigate('/user-dashboard');
            }
        }
        catch (errr) {
            console.error(errr);
        }
    }

    return (
        <Modal show={show} onHide={onHide} centered size="lg">
            <Modal.Header closeButton={showCloseButton}>
                <Modal.Title>Register</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form noValidate validated={validated} onSubmit={handleRegister}>
                    <Form.Group className="mb-3" controlId="formBasicName">
                        <InputGroup>
                            <InputGroup.Text>Full Name</InputGroup.Text>
                            <Form.Control type="text" placeholder="First Name" required onChange={(e) => setFirstName(e.target.value)}/>
                            <Form.Control type="text" placeholder="Middle Name" onChange={(e) => setMiddleName(e.target.value)}/>
                            <Form.Control type="text" placeholder="Last Name" required onChange={(e) => setLastName(e.target.value)}/>
                            <Form.Control.Feedback type="invalid">
                                Please provide your First and Last Name (Middle Name is Optional).
                            </Form.Control.Feedback>
                        </InputGroup>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formBasicAddress">
                        <Form.Control type="text" placeholder="Address" required onChange={(e) => setAddress(e.target.value)}/>
                        <Form.Control.Feedback type="invalid">
                            Please provide your address.
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formBasicDOB">
                        <Row>
                           <Col>
                            <InputGroup>
                                <InputGroup.Text>Birthday</InputGroup.Text>
                                <Form.Control type="date" required onChange={(e) => setBirthday(e.target.value)}/>
                                <Form.Control.Feedback type="invalid">
                                    Please provide your birthday.
                                </Form.Control.Feedback>
                            </InputGroup>
                            </Col>
                            <Col>
                                <InputGroup>
                                    <InputGroup.Text>Gender</InputGroup.Text>
                                    <Form.Select required onChange={(e) => setGender(e.target.value)}>
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
                    <Form.Group className="mb-3" controlId="formBasicMobile">
                        <Row>
                            <Col>
                                <InputGroup>
                                    <InputGroup.Text>Mobile Number</InputGroup.Text>
                                    <Form.Control type="tel" placeholder="Mobile number" required onChange={(e) => setMobileNumber(e.target.value)}/>
                                    <Form.Control.Feedback type="invalid">
                                        Please provide your Mobile number.
                                    </Form.Control.Feedback>
                                </InputGroup>
                            </Col>
                        </Row>
                    </Form.Group>
                    {showEmailPasswordFields && (
                        <Form.Group className="mb-3" controlId="formBasicEmail">
                            <Form.Control type="email" placeholder="Email Address" required={showEmailPasswordFields} onChange={(e) => setEmail(e.target.value)} />
                            <Form.Control.Feedback type="invalid">
                                Please provide your email.
                            </Form.Control.Feedback>
                        </Form.Group>
                    )}
                    {showEmailPasswordFields && (
                        <Form.Group className="mb-3" controlId="formBasicPassword">
                            <Form.Control type="password" placeholder="Password" required={showEmailPasswordFields} onChange={(e) => setPassword(e.target.value)} />
                            <Form.Control.Feedback type="invalid">
                                Please provide a password.
                            </Form.Control.Feedback>
                        </Form.Group>
                    )}
                    <div className="d-flex justify-content-center align-items-center">
                        <Button variant="primary" type="submit">
                            Sign Up
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export const Logout = () => {
    const navigate = useNavigate();
    const logout = async () =>
    {
        try
        {
            window.localStorage.removeItem('userID');
            window.localStorage.removeItem('isLoggedIn');
            window.localStorage.removeItem('isAdmin');

            await signOut(auth);
            navigate('/');
        }
        catch (errr)
        {
            console.error(errr);
        }
    };

    return (
        <div>
            <Nav.Link onClick={logout}>Logout</Nav.Link>
        </div>
    );
};