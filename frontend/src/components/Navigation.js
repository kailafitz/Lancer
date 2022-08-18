import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, Nav, Navbar, Button } from "react-bootstrap";
import useToken from "../helpers/useToken";
import Hamburger from "hamburger-react";

export const Navigation = () => {
  const [isAuthorised, setIsAuthorised] = useState(false);
  const [isOpen, setOpen] = useState(false);
  const { removeToken, token } = useToken();
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (window.location.href.indexOf("invoice") > -1) {
      setShow(false);
    }
    else {
      setShow(true);
    }
  }, [])


  const handleClick = () => {
    axios.get("https://kailafitz.pythonanywhere.com/api/logout", {
      headers: {
        Authorization: "Bearer " + token
      }
    }).then((response) => {
      removeToken();
      window.location.href = "https://kailafitz.pythonanywhere.com/";
      return response;
    }).catch((err) => {
      return err;
    });
  }


  useEffect(() => {
    axios.get("https://kailafitz.pythonanywhere.com/api/active", {
      headers: {
        Authorization: "Bearer " + token
      }
    }).then((response) => {
      if (response.status === 200) {
        setIsAuthorised(true);
      } else {
        setIsAuthorised(false);
      }
    }).catch(err => {
      setIsAuthorised(false);
      return err;
    });
  }, [token]);

  return (
    <Navbar expand="lg" className={`w-100 bg-primary mb- ${show === true ? `d-block` : `d-none`}`}>
      <Container>
        {isAuthorised === true ? (
          <Navbar.Brand href="/dashboard" className="ms-3">Lancer</Navbar.Brand>
        ) : <Navbar.Brand href="/" className="ms-3">Lancer</Navbar.Brand>}
        <Navbar.Toggle aria-controls="basic-navbar-nav"><Hamburger toggled={isOpen} toggle={setOpen} /></Navbar.Toggle>
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto align-items-center w-100">
            {isAuthorised === true ? (
              <div className="d-flex flex-column flex-lg-row align-items-center justify-content-between w-100">
                <div className="d-flex flex-column flex-lg-row">
                  <Nav.Link href="/dashboard">Dashboard</Nav.Link>
                  <Nav.Link href="/records">Records</Nav.Link>
                  <Nav.Link href="/add-job">New Job</Nav.Link>
                  <Nav.Link href="/settings">Settings</Nav.Link>
                </div>

                <hr className="border-bottom border-dark border-2 w-50 mx-auto" />

                <Button type="submit" className="my-3 my-lg-0" onClick={handleClick}>Logout</Button>
              </div>
            ) :
              <>
                <Nav.Link href="/register">Register</Nav.Link>
                <Nav.Link href="/login">Login</Nav.Link>
              </>}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}
