import { Container, Modal, Navbar, Nav } from 'react-bootstrap';
import { Logout } from './auth';

export const GenericNavbar = ({ links }) => {
    return (
      <Navbar bg="light" expand="lg" sticky="top">
        <Container fluid>
          <Navbar.Brand>BUTUAN DIAGNOSTIC AND MEDICAL CLINIC</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="justify-content-end">
              {links.map((link, index) => (
                  <Nav.Link key={index} href={link.url}>
                    {link.label}
                  </Nav.Link>
              ))}
              <Logout/>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    );
  };

export const GenericModal = ({ show, onClose, title, message }) => {
  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{message}</Modal.Body>
      <Modal.Footer>
        <button type="button" className="btn btn-primary" onClick={onClose}>
          Close
        </button>
      </Modal.Footer>
    </Modal>
  );
};