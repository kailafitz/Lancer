import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { AiOutlineCopyrightCircle } from "react-icons/ai";

export const Footer = () => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (window.location.href.indexOf("invoice") > -1) {
      setShow(false);
    }
    else {
      setShow(true);
    }
  }, [])

  return (
    <footer className={`bg-primary p-3 ${show === true ? `d-block` : `d-none`}`}><Container>
      <Row className="justify-content-center"><Col xs={6} className="align-items-center"><h6 className="text-white text-center m-0"><AiOutlineCopyrightCircle /> 2022 Lancer</h6>
      </Col></Row>
    </Container></footer>
  )
}
